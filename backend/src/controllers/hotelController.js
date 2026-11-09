import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

/**
 * @desc    Get all hotels with search, filter, and pagination
 * @route   GET /api/hotels
 * @access  Public
 */
export const getHotels = async (req, res, next) => {
  try {
    const {
      search,
      city,
      minRating,
      minPrice,
      maxPrice,
      featured,
      page = 1,
      limit = 9,
      sort,
    } = req.query;

    // Strict query building to prevent arbitrary NoSQL injection
    const query = { isActive: true };

    // 1. Full-text or regex search across name, city, and country
    if (search && typeof search === 'string' && search.trim() !== '') {
      const sanitizedSearch = search.trim();
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { city: { $regex: sanitizedSearch, $options: 'i' } },
        { country: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    // 2. City filter
    if (city && typeof city === 'string' && city.trim() !== '') {
      query.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }

    // 3. Minimum rating filter
    if (minRating) {
      const parsedRating = parseFloat(minRating);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        query.rating = { $gte: parsedRating };
      }
    }

    // 4. Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // 5. Price range filtering via associated Rooms
    if (minPrice || maxPrice) {
      const roomPriceQuery = { isAvailable: true };
      const parsedMinPrice = parseFloat(minPrice);
      const parsedMaxPrice = parseFloat(maxPrice);

      if (!isNaN(parsedMinPrice) && parsedMinPrice >= 0) {
        roomPriceQuery.pricePerNight = { ...roomPriceQuery.pricePerNight, $gte: parsedMinPrice };
      }
      if (!isNaN(parsedMaxPrice) && parsedMaxPrice >= 0) {
        roomPriceQuery.pricePerNight = { ...roomPriceQuery.pricePerNight, $lte: parsedMaxPrice };
      }

      // Find hotels that contain at least one room within this price range
      const matchingHotelIds = await Room.distinct('hotel', roomPriceQuery);
      query._id = { $in: matchingHotelIds };
    }

    // Pagination calculations (bound limit to between 1 and 50)
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    // Sorting options
    let sortOption = { featured: -1, rating: -1, createdAt: -1 };
    if (sort === 'rating_desc') sortOption = { rating: -1 };
    if (sort === 'rating_asc') sortOption = { rating: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    // Execute paginated queries in parallel
    const [total, hotels] = await Promise.all([
      Hotel.countDocuments(query),
      Hotel.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
    ]);

    // Attach minimum starting price for each hotel dynamically
    const hotelIds = hotels.map((h) => h._id);
    const roomPrices = await Room.aggregate([
      { $match: { hotel: { $in: hotelIds }, isAvailable: true } },
      { $group: { _id: '$hotel', minPrice: { $min: '$pricePerNight' } } },
    ]);

    const priceMap = {};
    roomPrices.forEach((rp) => {
      priceMap[rp._id.toString()] = rp.minPrice;
    });

    const hotelsWithPricing = hotels.map((hotel) => ({
      ...hotel,
      startingPrice: priceMap[hotel._id.toString()] ?? 0,
    }));

    res.status(200).json({
      success: true,
      count: hotelsWithPricing.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      hotels: hotelsWithPricing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single hotel by ID with all associated rooms
 * @route   GET /api/hotels/:id
 * @access  Public
 */
export const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hotel ID format.',
      });
    }

    // 2. Fetch hotel details
    const hotel = await Hotel.findById(id).lean();

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.',
      });
    }

    // 3. Fetch rooms belonging to this hotel
    const rooms = await Room.find({ hotel: id, isAvailable: true }).sort({
      pricePerNight: 1,
    });

    // 4. Compute starting price
    const startingPrice = rooms.length > 0 ? rooms[0].pricePerNight : 0;

    res.status(200).json({
      success: true,
      hotel: {
        ...hotel,
        startingPrice,
      },
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new hotel
 * @route   POST /api/hotels
 * @access  Private (Admin only)
 */
export const createHotel = async (req, res, next) => {
  try {
    const {
      name,
      description,
      address,
      city,
      country,
      rating,
      amenities,
      images,
      featured,
    } = req.body;

    // 1. Validate required fields
    if (!name || !description || !address || !city || !country) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, address, city, country.',
      });
    }

    // 2. Validate rating if provided
    let parsedRating = 4.5;
    if (rating !== undefined) {
      parsedRating = parseFloat(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a numeric value between 1.0 and 5.0.',
        });
      }
    }

    // 3. Normalize amenities and images arrays
    const sanitizedAmenities = Array.isArray(amenities)
      ? amenities.map((a) => String(a).trim()).filter(Boolean)
      : [];

    const sanitizedImages = Array.isArray(images)
      ? images.map((img) => String(img).trim()).filter(Boolean)
      : [];

    // 4. Create hotel record
    const hotel = await Hotel.create({
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      rating: parsedRating,
      amenities: sanitizedAmenities,
      images: sanitizedImages,
      featured: Boolean(featured),
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully.',
      hotel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hotel details
 * @route   PUT /api/hotels/:id
 * @access  Private (Admin only)
 */
export const updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hotel ID format.',
      });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.',
      });
    }

    const {
      name,
      description,
      address,
      city,
      country,
      rating,
      amenities,
      images,
      featured,
      isActive,
    } = req.body;

    if (name) hotel.name = name.trim();
    if (description) hotel.description = description.trim();
    if (address) hotel.address = address.trim();
    if (city) hotel.city = city.trim();
    if (country) hotel.country = country.trim();
    if (featured !== undefined) hotel.featured = Boolean(featured);
    if (isActive !== undefined) hotel.isActive = Boolean(isActive);

    if (rating !== undefined) {
      const parsedRating = parseFloat(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a numeric value between 1.0 and 5.0.',
        });
      }
      hotel.rating = parsedRating;
    }

    if (Array.isArray(amenities)) {
      hotel.amenities = amenities.map((a) => String(a).trim()).filter(Boolean);
    }

    if (Array.isArray(images)) {
      hotel.images = images.map((img) => String(img).trim()).filter(Boolean);
    }

    const updatedHotel = await hotel.save();

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully.',
      hotel: updatedHotel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a hotel and its associated rooms
 * @route   DELETE /api/hotels/:id
 * @access  Private (Admin only)
 */
export const deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hotel ID format.',
      });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.',
      });
    }

    // Cascade deletion: remove all rooms associated with this hotel
    const deletedRooms = await Room.deleteMany({ hotel: id });

    await hotel.deleteOne();

    res.status(200).json({
      success: true,
      message: `Hotel and ${deletedRooms.deletedCount} associated room(s) deleted successfully.`,
      hotelId: id,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
};
