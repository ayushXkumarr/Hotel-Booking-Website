import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

const VALID_ROOM_TYPES = ['Standard', 'Deluxe', 'Executive Suite', 'Presidential Suite'];

/**
 * @desc    Get all rooms for a specific hotel
 * @route   GET /api/rooms/hotel/:hotelId
 * @access  Public
 */
export const getRoomsByHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const { availableOnly } = req.query;

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hotel ID format.',
      });
    }

    const hotelExists = await Hotel.findById(hotelId);
    if (!hotelExists) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.',
      });
    }

    const filter = { hotel: hotelId };
    if (availableOnly === 'true') {
      filter.isAvailable = true;
    }

    const rooms = await Room.find(filter).sort({ pricePerNight: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single room by ID
 * @route   GET /api/rooms/:id
 * @access  Public
 */
export const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format.',
      });
    }

    const room = await Room.findById(id).populate('hotel', 'name city country address rating');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new room in a hotel
 * @route   POST /api/rooms
 * @access  Private (Admin only)
 */
export const createRoom = async (req, res, next) => {
  try {
    const {
      hotel,
      roomType,
      roomNumber,
      description,
      pricePerNight,
      maxGuests,
      bedType,
      amenities,
      images,
      isAvailable,
    } = req.body;

    // 1. Validate required fields
    if (!hotel || !roomType || !roomNumber || pricePerNight === undefined || maxGuests === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: hotel, roomType, roomNumber, pricePerNight, maxGuests.',
      });
    }

    // 2. Validate hotel reference
    if (!mongoose.Types.ObjectId.isValid(hotel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hotel ID format.',
      });
    }

    const parentHotel = await Hotel.findById(hotel);
    if (!parentHotel) {
      return res.status(404).json({
        success: false,
        message: 'The specified parent hotel does not exist.',
      });
    }

    // 3. Validate room category
    if (!VALID_ROOM_TYPES.includes(roomType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid roomType. Must be one of: [${VALID_ROOM_TYPES.join(', ')}].`,
      });
    }

    // 4. Validate numerical bounds
    const parsedPrice = parseFloat(pricePerNight);
    const parsedGuests = parseInt(maxGuests, 10);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price per night must be a non-negative number.',
      });
    }

    if (isNaN(parsedGuests) || parsedGuests < 1 || parsedGuests > 10) {
      return res.status(400).json({
        success: false,
        message: 'Max guests must be an integer between 1 and 10.',
      });
    }

    // 5. Enforce room number uniqueness within the specified hotel
    const trimmedRoomNumber = String(roomNumber).trim();
    const existingRoom = await Room.findOne({
      hotel,
      roomNumber: trimmedRoomNumber,
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room number "${trimmedRoomNumber}" is already in use at this hotel.`,
      });
    }

    // 6. Create room record
    const room = await Room.create({
      hotel,
      roomType,
      roomNumber: trimmedRoomNumber,
      description: description ? description.trim() : '',
      pricePerNight: parsedPrice,
      currency: req.body.currency || 'INR',
      maxGuests: parsedGuests,
      bedType: bedType ? bedType.trim() : 'King Size',
      amenities: Array.isArray(amenities) ? amenities.map((a) => String(a).trim()).filter(Boolean) : [],
      images: Array.isArray(images) ? images.map((i) => String(i).trim()).filter(Boolean) : [],
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update room details
 * @route   PUT /api/rooms/:id
 * @access  Private (Admin only)
 */
export const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format.',
      });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    const {
      roomType,
      roomNumber,
      description,
      pricePerNight,
      maxGuests,
      bedType,
      amenities,
      images,
      isAvailable,
    } = req.body;

    // Check room number uniqueness if altered
    if (roomNumber !== undefined) {
      const trimmedRoomNumber = String(roomNumber).trim();
      if (trimmedRoomNumber !== room.roomNumber) {
        const duplicate = await Room.findOne({
          hotel: room.hotel,
          roomNumber: trimmedRoomNumber,
          _id: { $ne: room._id },
        });

        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: `Room number "${trimmedRoomNumber}" already exists in this hotel.`,
          });
        }
        room.roomNumber = trimmedRoomNumber;
      }
    }

    if (roomType) {
      if (!VALID_ROOM_TYPES.includes(roomType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid roomType. Must be one of: [${VALID_ROOM_TYPES.join(', ')}].`,
        });
      }
      room.roomType = roomType;
    }

    if (pricePerNight !== undefined) {
      const parsedPrice = parseFloat(pricePerNight);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price per night must be a non-negative number.',
        });
      }
      room.pricePerNight = parsedPrice;
    }

    if (maxGuests !== undefined) {
      const parsedGuests = parseInt(maxGuests, 10);
      if (isNaN(parsedGuests) || parsedGuests < 1 || parsedGuests > 10) {
        return res.status(400).json({
          success: false,
          message: 'Max guests must be an integer between 1 and 10.',
        });
      }
      room.maxGuests = parsedGuests;
    }

    if (description !== undefined) room.description = description.trim();
    if (bedType !== undefined) room.bedType = bedType.trim();
    if (isAvailable !== undefined) room.isAvailable = Boolean(isAvailable);
    if (req.body.currency !== undefined && ['INR', 'USD'].includes(req.body.currency)) {
      room.currency = req.body.currency;
    }

    if (Array.isArray(amenities)) {
      room.amenities = amenities.map((a) => String(a).trim()).filter(Boolean);
    }

    if (Array.isArray(images)) {
      room.images = images.map((i) => String(i).trim()).filter(Boolean);
    }

    const updatedRoom = await room.save();

    res.status(200).json({
      success: true,
      message: 'Room updated successfully.',
      room: updatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:id
 * @access  Private (Admin only)
 */
export const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format.',
      });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully.',
      roomId: id,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getRoomsByHotel,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
