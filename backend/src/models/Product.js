import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
  },
  { _id: false },
);

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hexCode: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    childCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    brand: { type: String, default: "Stitch Makers" },

    images: [imageSchema],

    sizes: [{ type: String }],
    colors: [colorSchema],

    stock: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },

    tags: [{ type: String }],

    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ category: 1, subCategory: 1, childCategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1, salePrice: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ stock: 1 });
productSchema.index({ featured: 1, trending: 1, newArrival: 1 });
productSchema.index({ name: "text", description: "text", tags: "text", brand: "text" });

productSchema.virtual("effectivePrice").get(function () {
  return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
});

export default mongoose.model("Product", productSchema);
