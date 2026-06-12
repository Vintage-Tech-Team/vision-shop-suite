import Category from "../models/Category.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { slugify } from "../utils/slugify.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import { withCache } from "../services/cacheService.js";

const buildTree = (categories, parentId = null) =>
  categories
    .filter((c) => String(c.parentCategory || null) === String(parentId))
    .map((c) => ({
      ...c.toObject(),
      children: buildTree(categories, c._id),
    }));

export const getCategories = asyncHandler(async (_req, res) => {
  const data = await withCache("categories:tree", async () => {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return buildTree(categories);
  });
  sendSuccess(res, data);
});

export const getFlatCategories = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.level !== undefined) filter.level = Number(req.query.level);
  const categories = await Category.find(filter).populate("parentCategory", "name slug").sort({ name: 1 });
  sendSuccess(res, categories);
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) return sendError(res, "Category not found", 404);
  sendSuccess(res, category);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, parentCategory, level } = req.body;
  const slug = slugify(name);

  const exists = await Category.findOne({ slug });
  if (exists) return sendError(res, "Category slug already exists", 400);

  let image = req.body.image;
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, "stitch-makers/categories");
    image = uploaded.url;
  }

  const category = await Category.create({
    name,
    slug,
    image,
    parentCategory: parentCategory || null,
    level: level ?? (parentCategory ? 1 : 0),
  });

  sendSuccess(res, category, "Category created", 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return sendError(res, "Category not found", 404);

  const updates = { ...req.body };
  if (updates.name) updates.slug = slugify(updates.name);
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, "stitch-makers/categories");
    updates.image = uploaded.url;
  }

  Object.assign(category, updates);
  await category.save();
  sendSuccess(res, category, "Category updated");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) return sendError(res, "Category not found", 404);
  sendSuccess(res, null, "Category deactivated");
});
