import { cloudinary } from "../config/cloudinary.js";

export const uploadToCloudinary = (buffer, folder = "stitch-makers") =>
  new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return resolve({
        url: `https://picsum.photos/seed/${Date.now()}/800/1000`,
        publicId: null,
      });
    }
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(publicId);
};
