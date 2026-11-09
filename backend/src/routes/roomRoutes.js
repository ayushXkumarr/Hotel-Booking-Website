import express from 'express';
import {
  getRoomsByHotel,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Room Endpoints
 */
router.get('/hotel/:hotelId', getRoomsByHotel);
router.get('/:id', getRoomById);

/**
 * Admin Only Room Endpoints
 * Protected by verifyToken and authorizeRole('admin')
 */
router.post('/', verifyToken, authorizeRole('admin'), createRoom);
router.put('/:id', verifyToken, authorizeRole('admin'), updateRoom);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteRoom);

export default router;
