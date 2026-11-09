import express from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotelController.js';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Hotel Endpoints
 */
router.get('/', getHotels);
router.get('/:id', getHotelById);

/**
 * Admin Only Hotel Endpoints
 * Protected by verifyToken and authorizeRole('admin')
 */
router.post('/', verifyToken, authorizeRole('admin'), createHotel);
router.put('/:id', verifyToken, authorizeRole('admin'), updateHotel);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteHotel);

export default router;
