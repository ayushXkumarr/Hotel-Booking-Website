import mongoose from 'mongoose';

/**
 * Booking Schema
 * Records room reservations, date ranges, night counts, pricing snapshots, and reservation states.
 */
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A booking must be associated with an authenticated User'],
      index: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'A booking must be associated with a valid Hotel'],
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'A booking must specify a reserved Room'],
      index: true,
    },
    checkInDate: {
      type: Date,
      required: [true, 'Please provide a valid check-in date'],
      index: true,
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Please provide a valid check-out date'],
      index: true,
    },
    totalNights: {
      type: Number,
      required: [true, 'Total nights duration is required'],
      min: [1, 'Reservations must be for at least 1 night'],
    },
    pricePerNightSnapshot: {
      type: Number,
      required: [true, 'Room price snapshot at booking time is required'],
      min: [0, 'Nightly rate cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total reservation price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    guestsCount: {
      type: Number,
      required: [true, 'Please specify the number of guests'],
      min: [1, 'Guest count must be at least 1'],
    },
    bookingStatus: {
      type: String,
      enum: {
        values: ['Confirmed', 'Cancelled', 'Completed'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'Confirmed',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Simulated_Paid', 'Refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'Simulated_Paid',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound Indexes for High-Performance Queries:
 * 1. Overlap Conflict Detection: Filter active confirmed bookings for a specific room across dates.
 * 2. User History Index: Quickly fetch user bookings sorted by most recent.
 */
bookingSchema.index({ room: 1, bookingStatus: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
