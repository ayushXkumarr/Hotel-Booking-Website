import mongoose from 'mongoose';

/**
 * Hotel Schema
 * Represents hotel properties with location, rating, imagery, and amenities.
 */
const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the hotel name'],
      trim: true,
      maxlength: [100, 'Hotel name cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a comprehensive hotel description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    address: {
      type: String,
      required: [true, 'Please provide the physical address of the hotel'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide the city where the hotel is located'],
      trim: true,
      index: true,
    },
    country: {
      type: String,
      required: [true, 'Please provide the country'],
      trim: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating cannot exceed 5.0'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v);
        },
        message: 'Images must be provided as an array of URLs',
      },
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for optimized search and filtering by city and rating
hotelSchema.index({ city: 1, rating: -1 });

// Text index to support full-text search across hotel name and city
hotelSchema.index({ name: 'text', city: 'text' });

// Virtual field: Populate rooms associated with this hotel
hotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel',
});

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;
