import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    level: { type: Number, enum: [0, 1, 2], default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1, level: 1 });
categorySchema.index({ isActive: 1 });

export default mongoose.model("Category", categorySchema);
