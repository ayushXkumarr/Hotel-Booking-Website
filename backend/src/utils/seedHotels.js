import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import connectDB from '../config/db.js';

// Pre-load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const sampleHotels = [
  {
    name: 'The Grand Luminary Palace',
    description: 'Immerse yourself in timeless Parisian elegance. Situated in the prestigious 8th arrondissement, The Grand Luminary features gilded neoclassical architecture, a Michelin-starred culinary program, a signature subterranean thermal spa, and panoramic views of the Eiffel Tower from its private terraces.',
    address: '14 Avenue Montaigne',
    city: 'Paris',
    country: 'France',
    rating: 4.9,
    amenities: ['High-Speed WiFi', 'Heated Pool', 'Luxury Spa', 'Michelin Restaurant', 'Valet Parking', 'Fitness Center', 'Concierge Service', 'Room Service'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    ],
    featured: true,
    rooms: [
      {
        roomType: 'Deluxe',
        roomNumber: '101',
        description: 'Spacious room overlooking the courtyard gardens with marble bathroom and plush king bedding.',
        pricePerNight: 35000,
        currency: 'INR',
        maxGuests: 2,
        bedType: 'King Size',
        amenities: ['Marble Bath', 'Espresso Machine', 'High-Speed WiFi', 'Balcony'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
      },
      {
        roomType: 'Executive Suite',
        roomNumber: '201',
        description: 'Grand suite featuring a separate parlor, fireplace, and private balcony with avenue views.',
        pricePerNight: 62000,
        currency: 'INR',
        maxGuests: 3,
        bedType: 'California King',
        amenities: ['Private Parlor', 'Eiffel Tower View', 'Soaking Tub', 'Complimentary Champagne'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'],
      },
      {
        roomType: 'Presidential Suite',
        roomNumber: '301',
        description: 'The pinnacle of luxury with private butler service, bespoke antique furnishings, and wrap-around terrace.',
        pricePerNight: 135000,
        currency: 'INR',
        maxGuests: 4,
        bedType: 'Master King + Twin',
        amenities: ['Dedicated Butler', 'Panoramic Terrace', 'Private Jacuzzi', 'Dining Room'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },
  {
    name: 'The Azure Waterfront Manhattan',
    description: 'An iconic glass-and-steel architectural triumph hovering directly over the New York harbor. Experience sweeping skyline vistas, floor-to-ceiling windows, an infinity sky-pool, and world-class mixology lounges.',
    address: '88 Battery Place',
    city: 'New York',
    country: 'United States',
    rating: 4.8,
    amenities: ['Skyline Pool', 'Rooftop Lounge', 'High-Speed WiFi', '24/7 Gym', 'Valet Parking', 'Pet Friendly', 'Cocktail Bar'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    ],
    featured: true,
    rooms: [
      {
        roomType: 'Standard',
        roomNumber: '401',
        description: 'Contemporary urban studio designed for modern professionals and travelers.',
        pricePerNight: 24000,
        currency: 'INR',
        maxGuests: 2,
        bedType: 'Queen Size',
        amenities: ['City View', 'Workstation', 'Smart TV', 'Rain Shower'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
      },
      {
        roomType: 'Deluxe',
        roomNumber: '502',
        description: 'Corner room with dual-aspect floor-to-ceiling skyline and harbor views.',
        pricePerNight: 38000,
        currency: 'INR',
        maxGuests: 2,
        bedType: 'King Size',
        amenities: ['Harbor View', 'Nespresso', 'Soundproof Windows', 'Bose Speaker'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
      },
      {
        roomType: 'Executive Suite',
        roomNumber: '601',
        description: 'Sprawling high-floor sanctuary with panoramic views of the Statue of Liberty and Manhattan.',
        pricePerNight: 75000,
        currency: 'INR',
        maxGuests: 3,
        bedType: 'King Size',
        amenities: ['Skyline Panorama', 'Deep Soaking Tub', 'Living Room', 'Wine Cooler'],
        images: ['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },
  {
    name: 'Kyoto Zen Haven & Onsen Sanctuary',
    description: 'Nestled on the serene hillside of Higashiyama, Kyoto Zen Haven combines minimalist Japanese Sukiya craftsmanship with world-class natural volcanic hot spring onsens, bamboo gardens, and multi-course Kaiseki dining.',
    address: '22 Maruyama-cho, Higashiyama-ku',
    city: 'Kyoto',
    country: 'Japan',
    rating: 4.95,
    amenities: ['Natural Thermal Onsen', 'Japanese Tea Garden', 'Kaiseki Dining', 'High-Speed WiFi', 'Spa & Wellness', 'Tatami Lounges'],
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    ],
    featured: true,
    rooms: [
      {
        roomType: 'Deluxe',
        roomNumber: '101',
        description: 'Serene room lined with natural cedar, private garden view, and handcrafted Hinoki wood bathtub.',
        pricePerNight: 32000,
        currency: 'INR',
        maxGuests: 2,
        bedType: 'Traditional Futon or King Bed',
        amenities: ['Hinoki Wood Tub', 'Garden View', 'Ceremonial Tea Set', 'Yukata Robes'],
        images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
      },
      {
        roomType: 'Executive Suite',
        roomNumber: '202',
        description: 'Suite with private open-air onsen bath (Rotenburo) overlooking tranquil bamboo groves.',
        pricePerNight: 59000,
        currency: 'INR',
        maxGuests: 3,
        bedType: 'King Size',
        amenities: ['Private Open-Air Onsen', 'Bamboo Forest View', 'Tatami Salon', 'Kaiseki Breakfast'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },
  {
    name: 'The Oasis Palm Monarch',
    description: 'A lavish beachfront sanctuary on the crescent of Palm Jumeirah. Boasts private white sand beaches, personal butler service, underwater aquariums, and ten international dining destinations.',
    address: 'Crescent Road, Palm Jumeirah',
    city: 'Dubai',
    country: 'United Arab Emirates',
    rating: 4.85,
    amenities: ['Private Beach', 'Infinity Pool', 'Underwater Spa', 'Helipad', 'Tennis Courts', 'Fine Dining', 'Kids Club', 'Yacht Charter'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=80',
    ],
    featured: false,
    rooms: [
      {
        roomType: 'Standard',
        roomNumber: '301',
        description: 'Generously proportioned room featuring Arabian architectural flourishes and Gulf views.',
        pricePerNight: 26000,
        currency: 'INR',
        maxGuests: 2,
        bedType: 'King Size',
        amenities: ['Gulf View', 'Balcony', 'Marble Bathroom', 'High-Speed WiFi'],
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'],
      },
      {
        roomType: 'Executive Suite',
        roomNumber: '401',
        description: 'Lavish suite with private plunge pool and terrace directly facing the Dubai Marina skyline.',
        pricePerNight: 70000,
        currency: 'INR',
        maxGuests: 3,
        bedType: 'King Size',
        amenities: ['Private Plunge Pool', 'Terrace', 'Personal Butler', 'Evening Cocktails'],
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },
  {
    name: 'The Royal Westminster Stays',
    description: 'An illustrious heritage property seconds from Buckingham Palace and St. James Park. Experience polished brass fixtures, grand chandeliers, classic British afternoon tea, and refined butler service.',
    address: '10 St. James Place',
    city: 'London',
    country: 'United Kingdom',
    rating: 4.75,
    amenities: ['Afternoon Tea Lounge', 'Historic Library', 'High-Speed WiFi', 'Fitness Suite', 'Chauffeur Service', '24-hour Concierge'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
    ],
    featured: false,
    rooms: [
      {
        roomType: 'Standard',
        roomNumber: '102',
        description: 'Classic room with tailored British fabrics, writing bureau, and bespoke brass accents.',
        pricePerNight: 25000,
        currency: 'INR',
        maxGuests: 2,
        bedType: 'Queen Size',
        amenities: ['Writing Desk', 'Rain Shower', 'Complimentary Tea', 'High-Speed WiFi'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
      },
      {
        roomType: 'Deluxe',
        roomNumber: '202',
        description: 'Elegant deluxe room overlooking the historic cobblestone courtyard.',
        pricePerNight: 36000,
        currency: 'INR',
        maxGuests: 2,
        bedType: 'King Size',
        amenities: ['Courtyard View', 'Fireplace', 'Luxury Toiletries', 'Nespresso Bar'],
        images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },
  {
    name: 'Villa Serenity Rainforest Retreat',
    description: 'Suspended above the emerald Ayung River gorge in Ubud, Bali. Features private cliffside plunge pools, open-air living pavilions, yoga sanctuaries, and organic farm-to-table dining surrounded by lush jungle.',
    address: 'Banjar Payogan, Kedewatan, Ubud',
    city: 'Bali',
    country: 'Indonesia',
    rating: 4.92,
    amenities: ['Infinity Jungle Pool', 'Yoga Pavilion', 'Ayurvedic Spa', 'Organic Dining', 'River Views', 'High-Speed WiFi', 'Free Shuttle'],
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    ],
    featured: true,
    rooms: [
      {
        roomType: 'Deluxe',
        roomNumber: '101',
        description: 'Open-concept villa with private timber deck hovering above the jungle canopy.',
        pricePerNight: 22000,
        currency: 'INR',
        maxGuests: 2,
        bedType: 'Four-Poster King',
        amenities: ['Jungle Deck', 'Outdoor Stone Tub', 'Daily Yoga', 'Tropical Fruit Basket'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
      },
      {
        roomType: 'Executive Suite',
        roomNumber: '201',
        description: 'Private pool villa with dedicated pavilion, personal infinity plunge pool, and river valley vistas.',
        pricePerNight: 42000,
        currency: 'INR',
        maxGuests: 3,
        bedType: 'King Size',
        amenities: ['Private Infinity Pool', 'River Gorge View', 'Outdoor Shower', 'In-Villa Breakfast'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },
];

/**
 * Main Seeding Routine
 */
const seedHotelsAndRooms = async () => {
  try {
    console.log('[SeedCatalog] Connecting to MongoDB...');
    await connectDB();

    console.log('[SeedCatalog] Clearing existing catalog data...');
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    console.log('[SeedCatalog] Existing hotels and rooms cleared.');

    let totalHotelsCreated = 0;
    let totalRoomsCreated = 0;

    for (const hotelData of sampleHotels) {
      const { rooms, ...hotelInfo } = hotelData;

      // 1. Create Hotel
      const createdHotel = await Hotel.create(hotelInfo);
      totalHotelsCreated++;

      // 2. Create Rooms for this Hotel
      for (const roomData of rooms) {
        await Room.create({
          ...roomData,
          hotel: createdHotel._id,
        });
        totalRoomsCreated++;
      }
    }

    console.log('================================================================');
    console.log(`[SeedCatalog] ✅ Seeding Complete!`);
    console.log(`[SeedCatalog] 🏨 Total Hotels created: ${totalHotelsCreated}`);
    console.log(`[SeedCatalog] 🛏️ Total Rooms created:  ${totalRoomsCreated}`);
    console.log('================================================================');

    await mongoose.connection.close();
    console.log('[SeedCatalog] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`[SeedCatalog] Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedHotelsAndRooms();
