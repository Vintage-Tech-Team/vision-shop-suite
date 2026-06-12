import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { slugify, generateSKU } from "../utils/slugify.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinaryService.js";

const populateProduct = [
  { path: "category", select: "name slug" },
  { path: "subCategory", select: "name slug" },
  { path: "childCategory", select: "name slug" },
];

const buildProductFilter = (query) => {
  const filter = { isActive: true };
  const {
    category,
    subCategory,
    childCategory,
    brand,
    minPrice,
    maxPrice,
    size,
    color,
    rating,
    inStock,
    featured,
    trending,
    newArrival,
    search,
  } = query;

  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (childCategory) filter.childCategory = childCategory;
  if (brand) filter.brand = new RegExp(brand, "i");
  if (minPrice || maxPrice) {
    filter.$or = [
      { salePrice: { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) } },
      {
        salePrice: { $exists: false },
        price: { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) },
      },
    ];
  }
  if (size) filter.sizes = size;
  if (color) filter["colors.name"] = new RegExp(color, "i");
  if (rating) filter.rating = { $gte: Number(rating) };
  if (inStock === "true") filter.stock = { $gt: 0 };
  if (featured === "true") filter.featured = true;
  if (trending === "true") filter.trending = true;
  if (newArrival === "true") filter.newArrival = true;
  if (search) filter.$text = { $search: search };

  return filter;
};

const buildSort = (sort) => {
  switch (sort) {
    case "price_asc":
      return { salePrice: 1, price: 1 };
    case "price_desc":
      return { salePrice: -1, price: -1 };
    case "popular":
      return { reviewsCount: -1, rating: -1 };
    case "rating":
      return { rating: -1 };
    default:
      return { createdAt: -1 };
  }
};

export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 12);
  const skip = (page - 1) * limit;

  const filter = buildProductFilter(req.query);
  const sort = buildSort(req.query.sort);

  const [products, total] = await Promise.all([
    Product.find(filter).populate(populateProduct).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  sendPaginated(res, products, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) return sendSuccess(res, []);

  const products = await Product.find(
    { isActive: true, $text: { $search: q } },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(10)
    .select("name slug price salePrice images brand rating");

  sendSuccess(res, products);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(populateProduct);
  if (!product) return sendError(res, "Product not found", 404);

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  })
    .limit(4)
    .select("name slug price salePrice images rating brand");

  sendSuccess(res, { product, related });
});

export const getHomeSections = asyncHandler(async (_req, res) => {
  const [newArrivals, trending, bestSellers, featured] = await Promise.all([
    Product.find({ isActive: true, newArrival: true }).limit(8).populate(populateProduct),
    Product.find({ isActive: true, trending: true }).limit(8).populate(populateProduct),
    Product.find({ isActive: true }).sort({ reviewsCount: -1 }).limit(8).populate(populateProduct),
    Product.find({ isActive: true, featured: true }).limit(8).populate(populateProduct),
  ]);

  sendSuccess(res, { newArrivals, trending, bestSellers, featured });
});

export const createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.slug = slugify(data.name);
  data.sku = data.sku || generateSKU();

  if (typeof data.sizes === "string") data.sizes = JSON.parse(data.sizes);
  if (typeof data.colors === "string") data.colors = JSON.parse(data.colors);
  if (typeof data.tags === "string") data.tags = JSON.parse(data.tags);

  if (req.files?.length) {
    data.images = await Promise.all(
      req.files.map(async (file) => uploadToCloudinary(file.buffer, "stitch-makers/products")),
    );
  }

  const product = await Product.create(data);
  sendSuccess(res, await product.populate(populateProduct), "Product created", 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return sendError(res, "Product not found", 404);

  const data = { ...req.body };
  if (data.name) data.slug = slugify(data.name);
  if (typeof data.sizes === "string") data.sizes = JSON.parse(data.sizes);
  if (typeof data.colors === "string") data.colors = JSON.parse(data.colors);
  if (typeof data.tags === "string") data.tags = JSON.parse(data.tags);

  if (req.files?.length) {
    const newImages = await Promise.all(
      req.files.map(async (file) => uploadToCloudinary(file.buffer, "stitch-makers/products")),
    );
    data.images = [...(product.images || []), ...newImages];
  }

  Object.assign(product, data);
  await product.save();
  sendSuccess(res, await product.populate(populateProduct), "Product updated");
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return sendError(res, "Product not found", 404);

  for (const img of product.images || []) {
    if (img.publicId) await deleteFromCloudinary(img.publicId);
  }

  sendSuccess(res, null, "Product deleted");
});

export const bulkUploadProducts = asyncHandler(async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) return sendError(res, "Products array required", 400);

  const created = [];
  for (const item of products) {
    const product = await Product.create({
      ...item,
      slug: slugify(item.name),
      sku: item.sku || generateSKU(),
    });
    created.push(product);
  }

  sendSuccess(res, created, `${created.length} products uploaded`, 201);
});

export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
  if (!product) return sendError(res, "Product not found", 404);
  sendSuccess(res, product, "Stock updated");
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return sendError(res, "Product not found", 404);

  const image = product.images?.find((img) => img.publicId === req.params.publicId || img.url === req.params.publicId);
  if (image?.publicId) await deleteFromCloudinary(image.publicId);

  product.images = product.images.filter((img) => img.publicId !== req.params.publicId && img.url !== req.params.publicId);
  await product.save();
  sendSuccess(res, product, "Image removed");
});
