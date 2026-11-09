import express from 'express';
import {
  checkAvailability,
  createBooking,
  getBookingById,
  getMyBookings,
  cancelMyBooking,
  getAllBookingsAdmin,
  updateBookingStatusAdmin,
  getBookingStatsAdmin,
} from '../controllers/bookingController.js';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Booking Endpoints
 */
router.post('/check-availability', checkAvailability);

/**
 * Customer / Authenticated Endpoints
 */
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);
router.get('/:id', verifyToken, getBookingById);
router.put('/:id/cancel', verifyToken, cancelMyBooking);

/**
 * Admin Only Booking Endpoints
 */
router.get('/admin/all', verifyToken, authorizeRole('admin'), getAllBookingsAdmin);
router.put('/admin/:id/status', verifyToken, authorizeRole('admin'), updateBookingStatusAdmin);
router.get('/admin/stats', verifyToken, authorizeRole('admin'), getBookingStatsAdmin);

export default router;
