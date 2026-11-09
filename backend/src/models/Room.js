import mongoose from 'mongoose';

/**
 * Room Schema
 * Represents individual hotel rooms, pricing per night, capacity, and availability.
 */
const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'A room must belong to a valid Hotel reference'],
      index: true,
    },
    roomType: {
      type: String,
      required: [true, 'Please select a room category'],
      enum: {
        values: ['Standard', 'Deluxe', 'Executive Suite', 'Presidential Suite'],
        message: '{VALUE} is not a valid room type',
      },
      index: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide the room number / identifier'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please specify the room price per night'],
      min: [0, 'Price per night cannot be negative'],
      index: true,
    },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      // Note: No default value here. Un-migrated database records without a currency field
      // must remain undefined so that booking validation strictly rejects them until migrated.
    },
    maxGuests: {
      type: Number,
      required: [true, 'Please specify the maximum guest capacity'],
      min: [1, 'Maximum guests must be at least 1'],
      max: [10, 'Maximum guests cannot exceed 10'],
      index: true,
    },
    bedType: {
      type: String,
      default: 'King Size',
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound Unique Index
 * Enforces room number uniqueness within the specific hotel.
 * (e.g. Hotel A can have Room 101, and Hotel B can also have Room 101, but Hotel A cannot have two Room 101s).
 */
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

// Compound index for querying available rooms in a hotel sorted by price
roomSchema.index({ hotel: 1, isAvailable: 1, pricePerNight: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;
