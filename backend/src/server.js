import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initRedis } from "./config/redis.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await initRedis();

  app.listen(PORT, () => {
    console.log(`Stitch Makers API running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
