import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Pre-load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;
let serverInstance = null;

/**
 * Server Lifecycle Manager
 *
 * STARTUP ENFORCEMENT:
 * - Awaits connectDB() before binding the HTTP server listener.
 * - In production, ensures database connection succeeded; terminates process if failed.
 * - In development, allows starting server with fallback or notice.
 * - Manages graceful shutdown on SIGTERM / SIGINT signals.
 */
const startServer = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';

    // 1. Initialize and await database connection
    console.log('[Server] Connecting to database...');
    const conn = await connectDB();

    if (isProduction && !conn) {
      console.error('[Server] FATAL: Production database connection was not established. Aborting server startup.');
      process.exit(1);
    }

    // 2. Start Express HTTP Server only after DB attempt finishes
    serverInstance = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🏨 Hotel Booking API Server running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===============================================`);
    });

    return serverInstance;
  } catch (error) {
    console.error(`[Server] Startup Failure: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] ${signal} signal received. Initiating graceful shutdown...`);
  if (serverInstance) {
    serverInstance.close(async () => {
      console.log('[Server] HTTP server stopped accepting connections.');
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
          console.log('[Server] MongoDB connection closed.');
        }
      } catch (dbCloseErr) {
        console.error(`[Server] Error closing MongoDB connection: ${dbCloseErr.message}`);
      }
      console.log('[Server] Shutdown complete.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error(`[Server] Unhandled Rejection Error: ${err.message}`);
});

startServer();

export default app;
