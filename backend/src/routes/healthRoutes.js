import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint to verify backend status & MongoDB connectivity
 * @access  Public
 */
router.get('/', (req, res) => {
  // MongoDB readyState mapping: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const dbStatus = dbStatusMap[mongoose.connection.readyState] || 'Unknown';
  const isHealthy = mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2;

  res.status(200).json({
    success: true,
    service: 'Hotel Booking Management System API',
    status: 'Operational',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    database: {
      status: dbStatus,
      connected: mongoose.connection.readyState === 1,
    },
    version: '1.0.0',
  });
});

export default router;
