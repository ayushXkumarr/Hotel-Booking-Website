import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

/**
 * In-memory FIFO queue mutex keyed by resource identifier (e.g. roomId)
 * Serializes concurrent asynchronous operations on the same room within the Node.js process.
 */
class KeyedMutex {
  constructor() {
    this.queues = new Map();
  }

  acquire(key) {
    const queue = this.queues.get(key) || Promise.resolve();
    let release;
    const next = new Promise((resolve) => {
      release = resolve;
    });
    this.queues.set(key, queue.then(() => next));
    return queue.then(() => () => {
      release();
      if (this.queues.get(key) === next) {
        this.queues.delete(key);
      }
    });
  }
}

export const roomMutex = new KeyedMutex();

/**
 * Helper: Parse & Validate Reservation Date Range
 */
const parseAndValidateDates = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    throw new Error('Both checkInDate and checkOutDate are required.');
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new Error('Invalid date format provided.');
  }

  // Normalize both dates to UTC midnight so reservation dates operate strictly on calendar days
  checkInDate.setUTCHours(0, 0, 0, 0);
  checkOutDate.setUTCHours(0, 0, 0, 0);

  // Check-out must strictly be after check-in
  if (checkOutDate <= checkInDate) {
    throw new Error('Check-out date must be after check-in date.');
  }

  // Normalize current date to UTC midnight for comparison
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (checkInDate < today) {
    throw new Error('Check-in date cannot be in the past.');
  }

  // Calculate duration in nights
  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  const totalNights = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (totalNights < 1) {
    throw new Error('Reservations must be for at least 1 night.');
  }

  return { checkInDate, checkOutDate, totalNights };
};

/**
 * Helper: Query for Overlapping Confirmed Reservations
 *
 * Conflict Condition:
 * existing.checkInDate < requested.checkOutDate AND existing.checkOutDate > requested.checkInDate
 * Cancelled bookings do NOT block availability.
 */
export const findConflictingBookings = async (roomId, checkInDate, checkOutDate, session = null) => {
  const query = {
    room: roomId,
    bookingStatus: 'Confirmed',
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  };

  if (session) {
    return await Booking.find(query).session(session);
  }
  return await Booking.find(query);
};

/**
 * @desc    Check room availability for selected date range
 * @route   POST /api/bookings/check-availability
 * @access  Public
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate, guestsCount } = req.body;

    // 1. Validate Room ID format
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing room ID.',
      });
    }

    // 2. Validate Dates
    let parsedDates;
    try {
      parsedDates = parseAndValidateDates(checkInDate, checkOutDate);
    } catch (dateErr) {
      return res.status(400).json({
        success: false,
        message: dateErr.message,
      });
    }

    // 3. Validate Room Exists & Active Status
    const room = await Room.findById(roomId).populate('hotel', 'name city address rating images');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'The requested room does not exist.',
      });
    }

    if (!room.isAvailable) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        reason: 'This room is currently marked as unavailable for reservations by hotel administration.',
      });
    }

    // 4. Validate Guest Capacity
    const guests = parseInt(guestsCount, 10) || 1;
    if (guests < 1 || guests > room.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Guest count (${guests}) exceeds maximum capacity of ${room.maxGuests} for this suite.`,
      });
    }

    // 5. Query for Overlapping Confirmed Reservations
    const conflicts = await findConflictingBookings(
      roomId,
      parsedDates.checkInDate,
      parsedDates.checkOutDate
    );

    if (conflicts.length > 0) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        message: 'This room is already reserved for the selected date range. Please select different dates.',
        conflictsCount: conflicts.length,
      });
    }

    // 5b. Room Currency Validation: Only rooms denominated in INR can be booked during INR transition
    if (room.currency !== 'INR') {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        message: 'This room is currently listed in an un-migrated currency and cannot be booked. Only rooms denominated in Indian Rupees (INR) are available for new reservations.',
        currency: room.currency || 'USD',
      });
    }

    // 6. Calculate Price Breakdown
    const totalPrice = parsedDates.totalNights * room.pricePerNight;

    res.status(200).json({
      success: true,
      isAvailable: true,
      room: {
        _id: room._id,
        roomType: room.roomType,
        roomNumber: room.roomNumber,
        pricePerNight: room.pricePerNight,
        currency: 'INR',
        maxGuests: room.maxGuests,
        bedType: room.bedType,
        hotel: room.hotel,
      },
      checkInDate: parsedDates.checkInDate,
      checkOutDate: parsedDates.checkOutDate,
      totalNights: parsedDates.totalNights,
      pricePerNight: room.pricePerNight,
      currency: 'INR',
      totalPrice,
      guestsCount: guests,
      message: 'Room is available for reservation.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new booking with concurrency-safe reservation lock
 * @route   POST /api/bookings
 * @access  Private (Authenticated User)
 */
export const createBooking = async (req, res, next) => {
  let session = null;
  let useTransaction = false;
  let releaseLock = null;

  try {
    const { roomId, checkInDate, checkOutDate, guestsCount } = req.body;

    // 1. Validate Room ID
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid roomId is required.',
      });
    }

    // 2. Validate Dates
    let parsedDates;
    try {
      parsedDates = parseAndValidateDates(checkInDate, checkOutDate);
    } catch (dateErr) {
      return res.status(400).json({
        success: false,
        message: dateErr.message,
      });
    }

    // 3. Acquire in-process mutex lock for this roomId to serialize concurrent requests
    releaseLock = await roomMutex.acquire(roomId.toString());

    // 4. Fetch Room & Parent Hotel
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room does not exist.',
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not currently active for reservations.',
      });
    }

    // 5. Validate Guest Capacity
    const guests = parseInt(guestsCount, 10) || 1;
    if (guests < 1 || guests > room.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Guest count (${guests}) exceeds maximum room capacity (${room.maxGuests}).`,
      });
    }

    // 5b. Room Currency Validation: New bookings only allowed for INR-denominated rooms
    if (room.currency !== 'INR') {
      return res.status(400).json({
        success: false,
        message: 'This room is currently listed in an un-migrated currency and cannot be booked. Only rooms denominated in Indian Rupees (INR) are available for new reservations.',
        currency: room.currency || 'USD',
      });
    }

    // 6. Backend Pricing Calculation (NEVER trust frontend price)
    const pricePerNightSnapshot = room.pricePerNight;
    const totalPrice = parsedDates.totalNights * pricePerNightSnapshot;

    // 7. Concurrency-Safe Transaction Attempt (For MongoDB Replica Set / Atlas Clusters)
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
      // In replica sets, acquire write lock by incrementing Room version within transaction
      await Room.findOneAndUpdate({ _id: roomId }, { $inc: { __v: 1 } }, { session });
    } catch (txInitErr) {
      // Standalone MongoDB nodes do not support transactions.
      // In standalone mode, the in-process KeyedMutex guarantees single-instance serialization.
      session = null;
      useTransaction = false;
    }

    // 8. Re-verify room availability inside transaction / mutex critical section
    const conflicts = await findConflictingBookings(
      roomId,
      parsedDates.checkInDate,
      parsedDates.checkOutDate,
      useTransaction ? session : null
    );

    if (conflicts.length > 0) {
      if (useTransaction && session) {
        await session.abortTransaction();
      }
      return res.status(409).json({
        success: false,
        message: 'Conflict: This room was just reserved by another guest for the selected dates.',
      });
    }

    // 9. Persist Booking Document
    const bookingPayload = {
      user: req.user._id,
      hotel: room.hotel,
      room: room._id,
      checkInDate: parsedDates.checkInDate,
      checkOutDate: parsedDates.checkOutDate,
      totalNights: parsedDates.totalNights,
      pricePerNightSnapshot,
      currency: 'INR',
      totalPrice,
      guestsCount: guests,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Simulated_Paid', // Clearly documented as simulated sandbox payment
    };

    let newBooking;
    if (useTransaction && session) {
      const created = await Booking.create([bookingPayload], { session });
      newBooking = created[0];
      await session.commitTransaction();
    } else {
      newBooking = await Booking.create(bookingPayload);
    }

    // Populate references for client response
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('hotel', 'name city address rating images')
      .populate('room', 'roomType roomNumber bedType amenities');

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully (Simulated Payment Processed).',
      booking: populatedBooking,
    });
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
    if (releaseLock) {
      releaseLock();
    }
  }
};

/**
 * @desc    Get bookings of the currently logged in customer
 * @route   GET /api/bookings/my-bookings
 * @access  Private (Authenticated User)
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hotel', 'name city address rating images')
      .populate('room', 'roomType roomNumber bedType amenities')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel user's own booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (Authenticated User)
 */
export const cancelMyBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format.',
      });
    }

    const booking = await Booking.findById(id).populate('hotel', 'name').populate('room', 'roomNumber roomType');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.',
      });
    }

    // Security Verification: Customer can ONLY cancel their own booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to cancel another customer\'s reservation.',
      });
    }

    // Check current booking state
    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This reservation is already cancelled.',
      });
    }

    if (booking.bookingStatus === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Past or completed reservations cannot be cancelled.',
      });
    }

    // Cancellation Policy: Must cancel before check-in date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    if (today >= checkIn && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cancellation policy: Bookings cannot be cancelled on or after the scheduled check-in date.',
      });
    }

    // Apply cancellation & simulated refund
    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';

    const updatedBooking = await booking.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully. Simulated payment has been marked as Refunded.',
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings across the platform (Admin Only)
 * @route   GET /api/bookings/admin/all
 * @access  Private (Admin Only)
 */
export const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && ['Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      query.bookingStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, bookings] = await Promise.all([
      Booking.countDocuments(query),
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('hotel', 'name city country')
        .populate('room', 'roomNumber roomType pricePerNight')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    // Optional in-memory filter if admin provided keyword search for user or hotel
    let filteredBookings = bookings;
    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      filteredBookings = bookings.filter((b) => {
        const userName = b.user?.name?.toLowerCase() || '';
        const userEmail = b.user?.email?.toLowerCase() || '';
        const hotelName = b.hotel?.name?.toLowerCase() || '';
        return userName.includes(term) || userEmail.includes(term) || hotelName.includes(term);
      });
    }

    res.status(200).json({
      success: true,
      count: filteredBookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      bookings: filteredBookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status (Admin Only)
 * @route   PUT /api/bookings/admin/:id/status
 * @access  Private (Admin Only)
 */
export const updateBookingStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format.',
      });
    }

    if (!['Confirmed', 'Cancelled', 'Completed'].includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bookingStatus. Must be Confirmed, Cancelled, or Completed.',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // If status is being changed to Confirmed, verify no overlapping confirmed reservation exists
    if (bookingStatus === 'Confirmed' && booking.bookingStatus !== 'Confirmed') {
      const conflicts = await Booking.find({
        _id: { $ne: booking._id },
        room: booking.room,
        bookingStatus: 'Confirmed',
        checkInDate: { $lt: booking.checkOutDate },
        checkOutDate: { $gt: booking.checkInDate },
      });

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Cannot re-confirm reservation: Another confirmed booking already exists for this room on overlapping dates.',
        });
      }
    }

    booking.bookingStatus = bookingStatus;
    if (bookingStatus === 'Cancelled') {
      booking.paymentStatus = 'Refunded';
    }

    const updated = await booking.save();

    res.status(200).json({
      success: true,
      message: `Reservation status updated to "${bookingStatus}".`,
      booking: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking details by ID
 * @route   GET /api/bookings/:id
 * @access  Private (Owner Customer or Admin)
 */
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format.',
      });
    }

    const booking = await Booking.findById(id)
      .populate('hotel', 'name address city country rating images')
      .populate('room', 'roomNumber roomType bedType maxGuests amenities pricePerNight')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.',
      });
    }

    // Enforce customer ownership check
    const isOwner = booking.user && booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not authorized to view another customer's reservation details.",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform booking statistics (Admin Only)
 * @route   GET /api/bookings/admin/stats
 * @access  Private (Admin Only)
 */
export const getBookingStatsAdmin = async (req, res, next) => {
  try {
    const [totalBookings, confirmedBookings, cancelledBookings, completedBookings] =
      await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ bookingStatus: 'Confirmed' }),
        Booking.countDocuments({ bookingStatus: 'Cancelled' }),
        Booking.countDocuments({ bookingStatus: 'Completed' }),
      ]);

    // Calculate simulated revenue grouped by currency from confirmed bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'Confirmed' } },
      { $group: { _id: { $ifNull: ['$currency', 'USD'] }, totalRevenue: { $sum: '$totalPrice' } } },
    ]);

    const revenueByCurrency = { INR: 0, USD: 0 };
    revenueAgg.forEach((item) => {
      const curr = item._id || 'USD';
      revenueByCurrency[curr] = item.totalRevenue;
    });

    const totalRevenueINR = revenueByCurrency.INR || 0;
    const totalRevenueUSD = revenueByCurrency.USD || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue: totalRevenueINR,
        totalRevenueINR,
        totalRevenueUSD,
        revenueByCurrency,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  checkAvailability,
  createBooking,
  getBookingById,
  getMyBookings,
  cancelMyBooking,
  getAllBookingsAdmin,
  updateBookingStatusAdmin,
  getBookingStatsAdmin,
};
