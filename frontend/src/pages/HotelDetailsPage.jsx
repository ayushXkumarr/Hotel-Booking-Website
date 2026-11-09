import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import RoomCard from '../components/rooms/RoomCard';
import BookingModal from '../components/bookings/BookingModal';
import {
  MapPin,
  Star,
  Sparkles,
  Wifi,
  Waves,
  Coffee,
  Car,
  Dumbbell,
  Utensils,
  ShieldCheck,
  ChevronLeft,
  Loader2,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';

export default function HotelDetailsPage() {
  const { id } = useParams();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/hotels/${id}`);
        if (res.data?.success) {
          setHotel(res.data.hotel);
          setRooms(res.data.rooms || []);
        }
      } catch (err) {
        console.error('Error fetching hotel details:', err);
        setError(err.response?.data?.message || 'Hotel details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id]);

  // Icon mapping for common luxury amenities
  const getAmenityIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-4 h-4 text-brand-600" />;
    if (lower.includes('pool') || lower.includes('onsen')) return <Waves className="w-4 h-4 text-brand-600" />;
    if (lower.includes('spa') || lower.includes('tea')) return <Coffee className="w-4 h-4 text-brand-600" />;
    if (lower.includes('valet') || lower.includes('park')) return <Car className="w-4 h-4 text-brand-600" />;
    if (lower.includes('gym') || lower.includes('fit')) return <Dumbbell className="w-4 h-4 text-brand-600" />;
    if (lower.includes('restaurant') || lower.includes('din')) return <Utensils className="w-4 h-4 text-brand-600" />;
    return <CheckCircle2 className="w-4 h-4 text-brand-600" />;
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading sanctuary details...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Hotel Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || 'The requested hotel property does not exist or has been removed.'}
        </p>
        <Link
          to="/hotels"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Stays Catalog
        </Link>
      </div>
    );
  }

  const galleryImages =
    hotel.images && hotel.images.length > 0
      ? hotel.images
      : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/hotels"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to All Stays
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {hotel.featured && (
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-brand-600" />
                Featured Property
              </span>
            )}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-amber-300">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{Number(hotel.rating).toFixed(1)}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {hotel.name}
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              {hotel.address}, {hotel.city}, {hotel.country}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 text-right">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Starting from</div>
          <div className="text-2xl font-black text-slate-900">
            ${hotel.startingPrice}{' '}
            <span className="text-xs font-normal text-slate-500">/ night</span>
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-12">
        {/* Main large image */}
        <div className="lg:col-span-3 h-80 sm:h-96 md:h-[450px] rounded-3xl overflow-hidden bg-slate-100 shadow-sm">
          <img
            src={galleryImages[activeImage] || galleryImages[0]}
            alt={hotel.name}
            className="w-full h-full object-cover transition-all duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
            }}
          />
        </div>

        {/* Thumbnail column */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImage(idx)}
              className={`h-24 sm:h-28 w-28 lg:w-full rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                activeImage === idx
                  ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md scale-98'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80';
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Overview & Amenities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-12 border-b border-slate-200">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            About the Property
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {hotel.description}
          </p>

          <div className="pt-4">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Featured Luxuries & Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hotel.amenities && hotel.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                >
                  {getAmenityIcon(amenity)}
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Property Highlights Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider pb-3 border-b border-slate-100">
              Reservation Summary
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Available Rooms:</span>
                <span className="font-bold text-slate-800">{rooms.length} Suites</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guest Rating:</span>
                <span className="font-bold text-slate-800">{hotel.rating} / 5.0 Exceptional</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Check-In Time:</span>
                <span className="font-medium text-slate-700">3:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Check-Out Time:</span>
                <span className="font-medium text-slate-700">11:00 AM</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <a
                href="#available-rooms"
                className="w-full block text-center py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-600/20"
              >
                View Available Rooms Below
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Available Rooms Section */}
      <div id="available-rooms" className="pt-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Select Your Suite
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Choose from our curated room configurations for this destination.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200">
            {rooms.length} Room Categories Available
          </span>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center space-y-2">
            <h4 className="text-sm font-bold text-slate-700">No Rooms Currently Listed</h4>
            <p className="text-xs text-slate-500">
              Rooms for this hotel are being updated by property management. Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                onSelectRoom={handleSelectRoom}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Reservation Modal */}
      <BookingModal
        room={selectedRoom}
        hotel={hotel}
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </div>
  );
}
