import mongoose from "mongoose";
import { logger } from './logger.js'

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/carhubconnect";
  try {
    await mongoose.connect(mongoUri, {
      autoIndex: true
    });
    logger.info({ uri: mongoUri }, "MongoDB connected")
  } catch (error) {
    logger.error({ err: error }, "MongoDB connection error")
    process.exit(1);
  }
};


