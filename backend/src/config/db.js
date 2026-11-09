import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Uses Mongoose with connection pooling and graceful error handling.
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_booking';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000, // Timeout after 3s if server isn't reachable
    });

    console.log(`[MongoDB] Database connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
    console.warn('[MongoDB] Please ensure MongoDB is running locally or verify your MONGODB_URI in backend/.env');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
