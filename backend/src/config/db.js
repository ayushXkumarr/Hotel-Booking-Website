import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Uses Mongoose with connection pooling and graceful error handling.
 *
 * PRODUCTION SECURITY REQUIREMENT:
 * In production (NODE_ENV === 'production'), MONGODB_URI is strictly required.
 * Silent fallback to localhost is forbidden in production environments.
 */
export const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  let mongoUri = process.env.MONGODB_URI;

  if (isProduction && (!mongoUri || mongoUri.trim() === '')) {
    console.error('================================================================');
    console.error('[MongoDB] FATAL CONFIGURATION ERROR:');
    console.error('[MongoDB] MONGODB_URI is strictly required when running in production mode.');
    console.error('[MongoDB] Silent fallback to localhost is prohibited in production.');
    console.error('[MongoDB] Please configure MONGODB_URI in your production environment variables.');
    console.error('================================================================');
    process.exit(1);
  }

  // Preserve local development convenience when MONGODB_URI is not explicitly provided
  if (!mongoUri || mongoUri.trim() === '') {
    mongoUri = 'mongodb://127.0.0.1:27017/hotel_booking';
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000, // Timeout after 3s if server isn't reachable
    });

    console.log(`[MongoDB] Database connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
    console.warn('[MongoDB] Please ensure MongoDB is running locally or verify your MONGODB_URI in backend/.env');
    if (isProduction) {
      process.exit(1);
    }
  }
};

export default connectDB;
