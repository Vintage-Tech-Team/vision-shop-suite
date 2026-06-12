import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { slugify, generateSKU } from "../utils/slugify.js";

dotenv.config();

const categoryTree = [
  {
    name: "Men",
    children: [
      {
        name: "Top Wear",
        children: [
          { name: "T-Shirts" },
          { name: "Polo Shirts" },
          { name: "Casual Shirts" },
          { name: "Formal Shirts" },
        ],
      },
      {
        name: "Bottom Wear",
        children: [
          { name: "Jeans" },
          { name: "Chinos" },
          { name: "Trousers" },
          { name: "Shorts" },
        ],
      },
      {
        name: "Accessories",
        children: [
          { name: "Belts" },
          { name: "Wallets" },
          { name: "Watches" },
          { name: "Caps" },
        ],
      },
    ],
  },
  {
    name: "Women",
    children: [
      { name: "Top Wear", children: [{ name: "Blouses" }, { name: "T-Shirts" }, { name: "Tunics" }] },
      { name: "Bottom Wear", children: [{ name: "Jeans" }, { name: "Skirts" }, { name: "Trousers" }] },
      { name: "Dresses", children: [{ name: "Casual Dresses" }, { name: "Evening Dresses" }] },
      { name: "Accessories", children: [{ name: "Bags" }, { name: "Jewelry" }, { name: "Scarves" }] },
    ],
  },
  {
    name: "Kids",
    children: [
      { name: "Boys", children: [{ name: "T-Shirts" }, { name: "Shorts" }, { name: "Jackets" }] },
      { name: "Girls", children: [{ name: "Dresses" }, { name: "Tops" }, { name: "Skirts" }] },
      { name: "Accessories", children: [{ name: "Caps" }, { name: "Backpacks" }] },
    ],
  },
];

const productSamples = [
  {
    name: "Classic Fit Oxford Shirt",
    brand: "Stitch Makers",
    price: 89,
    salePrice: 69,
    stock: 120,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "White", hexCode: "#FFFFFF" },
      { name: "Navy", hexCode: "#1B2A4A" },
    ],
    featured: true,
    newArrival: true,
    tags: ["shirt", "formal", "men"],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b00?w=800&q=80",
  },
  {
    name: "Slim Fit Denim Jeans",
    brand: "Stitch Makers",
    price: 99,
    stock: 85,
    sizes: ["28", "30", "32", "34", "36"],
    colors: [{ name: "Indigo", hexCode: "#1E3A5F" }],
    trending: true,
    tags: ["jeans", "denim", "men"],
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
  },
  {
    name: "Premium Leather Belt",
    brand: "Stitch Makers",
    price: 59,
    stock: 200,
    sizes: ["S", "M", "L"],
    colors: [{ name: "Brown", hexCode: "#8B4513" }],
    tags: ["belt", "accessories"],
    image: "https://images.unsplash.com/photo-1624225247340-5246a532f8e3?w=800&q=80",
  },
  {
    name: "Floral Midi Dress",
    brand: "Stitch Makers",
    price: 129,
    salePrice: 99,
    stock: 60,
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Rose", hexCode: "#E8A598" },
      { name: "Sage", hexCode: "#9CAF88" },
    ],
    featured: true,
    trending: true,
    tags: ["dress", "women", "floral"],
    image: "https://images.unsplash.com/photo-1595777457583-f062933bb4ab?w=800&q=80",
  },
  {
    name: "High-Waist Wide Leg Trousers",
    brand: "Stitch Makers",
    price: 109,
    stock: 75,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Black", hexCode: "#111111" }],
    newArrival: true,
    tags: ["trousers", "women"],
    image: "https://images.unsplash.com/photo-1594633312681-425a7b956cc8?w=800&q=80",
  },
  {
    name: "Kids Graphic Tee",
    brand: "Stitch Makers",
    price: 29,
    stock: 150,
    sizes: ["4Y", "6Y", "8Y", "10Y", "12Y"],
    colors: [
      { name: "Red", hexCode: "#E31E24" },
      { name: "Blue", hexCode: "#2563EB" },
    ],
    tags: ["kids", "t-shirt"],
    image: "https://images.unsplash.com/photo-1519238263530-99bdd127df10?w=800&q=80",
  },
  {
    name: "Merino Wool Sweater",
    brand: "Stitch Makers",
    price: 149,
    stock: 45,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Camel", hexCode: "#C19A6B" }],
    featured: true,
    tags: ["sweater", "knitwear", "men"],
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
  },
  {
    name: "Minimalist Leather Sneakers",
    brand: "Stitch Makers",
    price: 189,
    salePrice: 159,
    stock: 90,
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: [
      { name: "White", hexCode: "#FFFFFF" },
      { name: "Black", hexCode: "#111111" },
    ],
    trending: true,
    newArrival: true,
    tags: ["sneakers", "footwear"],
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
  },
];

async function seedCategories(tree, parentId = null, level = 0) {
  const map = {};
  for (const node of tree) {
    const cat = await Category.create({
      name: node.name,
      slug: slugify(node.name),
      parentCategory: parentId,
      level,
      image: `https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80&sig=${slugify(node.name)}`,
    });
    map[node.name] = cat;
    if (node.children) {
      const childMap = await seedCategories(node.children, cat._id, level + 1);
      Object.assign(map, childMap);
    }
  }
  return map;
}

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  const admin = await User.create({
    name: "Admin",
    email: process.env.ADMIN_EMAIL || "admin@stitchmakers.com",
    password: process.env.ADMIN_PASSWORD || "Admin@123456",
    role: "admin",
  });

  const customer = await User.create({
    name: "Demo Customer",
    email: "customer@stitchmakers.com",
    password: "Customer@123",
    role: "customer",
  });

  const categories = await seedCategories(categoryTree);

  const menTop = categories["Top Wear"];
  const womenDress = categories["Casual Dresses"] || categories["Dresses"];
  const menBottom = categories["Jeans"];
  const kidsBoys = categories["Boys"];

  const categoryAssignments = [
    [menTop, categories["Formal Shirts"], menTop],
    [categories["Men"], categories["Bottom Wear"], menBottom],
    [categories["Men"], categories["Accessories"], categories["Belts"]],
    [categories["Women"], categories["Dresses"], womenDress],
    [categories["Women"], categories["Bottom Wear"], categories["Trousers"]],
    [categories["Kids"], categories["Boys"], categories["T-Shirts"]],
    [categories["Men"], categories["Top Wear"], categories["T-Shirts"]],
    [categories["Men"], categories["Top Wear"], categories["T-Shirts"]],
  ];

  for (let i = 0; i < productSamples.length; i++) {
    const sample = productSamples[i];
    const [cat, sub, child] = categoryAssignments[i] || [categories["Men"], menTop, categories["T-Shirts"]];

    await Product.create({
      name: sample.name,
      slug: slugify(sample.name),
      sku: generateSKU(),
      description: `${sample.name} — crafted with premium materials for lasting comfort and style. Part of the Stitch Makers collection.`,
      shortDescription: sample.name,
      category: cat?._id || categories["Men"]._id,
      subCategory: sub?._id,
      childCategory: child?._id,
      brand: sample.brand,
      images: [{ url: sample.image }],
      sizes: sample.sizes,
      colors: sample.colors,
      stock: sample.stock,
      price: sample.price,
      salePrice: sample.salePrice,
      tags: sample.tags,
      featured: sample.featured || false,
      trending: sample.trending || false,
      newArrival: sample.newArrival || false,
      rating: 4 + Math.random(),
      reviewsCount: Math.floor(Math.random() * 50),
    });
  }

  await Coupon.create({
    code: "WELCOME10",
    description: "10% off your first order",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 50,
    maxDiscount: 30,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    usageLimit: 1000,
  });

  await Coupon.create({
    code: "FLAT20",
    description: "$20 off orders over $100",
    discountType: "fixed",
    discountValue: 20,
    minOrderAmount: 100,
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: 500,
  });

  console.log("Seed completed!");
  console.log(`Admin: ${admin.email} / ${process.env.ADMIN_PASSWORD || "Admin@123456"}`);
  console.log(`Customer: ${customer.email} / Customer@123`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
