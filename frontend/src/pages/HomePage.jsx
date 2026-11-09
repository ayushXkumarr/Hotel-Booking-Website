import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Shield,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Clock,
  HeartHandshake,
  Compass,
  Quote,
} from 'lucide-react';
import HotelCard from '../components/hotels/HotelCard';
import api from '../services/api';

const FEATURED_CITIES = [
  { name: 'Paris', country: 'France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80', desc: 'Romance & Culture' },
  { name: 'Kyoto', country: 'Japan', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80', desc: 'Zen & Heritage' },
  { name: 'New York', country: 'United States', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80', desc: 'Urban Sophistication' },
  { name: 'Dubai', country: 'United Arab Emirates', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80', desc: 'Modern Opulence' },
];

const TESTIMONIALS = [
  {
    name: 'Elena Rostova',
    location: 'Geneva, Switzerland',
    hotel: 'The Ritz Paris Heritage',
    rating: 5,
    quote:
      'GrandStay made our anniversary getaway effortless. The suite reservation was confirmed instantly, and the private balcony overlooking Paris was pure perfection.',
  },
  {
    name: 'Marcus Vance',
    location: 'San Francisco, CA',
    hotel: 'Kyoto Zen Ryokan',
    rating: 5,
    quote:
      'The booking transparency and verified luxury photos matched our exact experience. The hot spring bath and morning tea service exceeded all our expectations.',
  },
  {
    name: 'Sophia Al-Mansoor',
    location: 'London, UK',
    hotel: 'The Oasis Palm Monarch',
    rating: 5,
    quote:
      'Flawless experience from discovery to check-out. Transparent rates with locked price snapshots and immediate confirmation. We will always book through GrandStay.',
  },
];

export default function HomePage() {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState('2');
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/hotels?featured=true&limit=3');
        if (res.data?.success) {
          setFeaturedHotels(res.data.hotels || []);
        }
      } catch (err) {
        console.warn('Could not load featured hotels:', err);
      } finally {
        setLoadingHotels(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.append('search', destination.trim());
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guestsCount) params.append('guests', guestsCount);
    navigate(`/hotels${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-navy-900 to-slate-950 text-white overflow-hidden py-16 sm:py-24">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Search, and Cities */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Curated Luxury Hotels & Suites
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Find & Book <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-teal-300 to-indigo-300">
                  Exceptional Hotels
                </span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Discover handpicked resorts, bespoke suites, and premier urban retreats around the world. Real-time availability, conflict-free scheduling, and verified luxury.
              </p>

              {/* Functional Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl shadow-2xl max-w-2xl space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Destination (5 cols on sm) */}
                  <div className="sm:col-span-5 bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-brand-400 shrink-0" />
                    <div className="w-full">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                        Destination
                      </div>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Paris, New York, Kyoto..."
                        className="w-full bg-transparent text-sm font-medium text-white placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Dates (4 cols on sm) */}
                  <div className="sm:col-span-4 bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-brand-400 shrink-0" />
                    <div className="w-full grid grid-cols-2 gap-1.5">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider">
                          Check-In
                        </div>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full bg-transparent text-xs font-medium text-white focus:outline-none [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider">
                          Check-Out
                        </div>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full bg-transparent text-xs font-medium text-white focus:outline-none [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guests (3 cols on sm) */}
                  <div className="sm:col-span-3 bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3">
                    <Users className="w-5 h-5 text-brand-400 shrink-0" />
                    <div className="w-full">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                        Guests
                      </div>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(e.target.value)}
                        className="w-full bg-transparent text-sm font-medium text-white focus:outline-none [color-scheme:dark] cursor-pointer"
                      >
                        <option value="1" className="bg-slate-900 text-white">1 Guest</option>
                        <option value="2" className="bg-slate-900 text-white">2 Guests</option>
                        <option value="3" className="bg-slate-900 text-white">3 Guests</option>
                        <option value="4" className="bg-slate-900 text-white">4 Guests</option>
                        <option value="5" className="bg-slate-900 text-white">5 Guests</option>
                        <option value="6" className="bg-slate-900 text-white">6+ Guests</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 text-sm"
                  >
                    <Search className="w-4 h-4" />
                    Search Available Stays
                  </button>
                </div>
              </form>

              {/* Quick Destination Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Popular Destinations:</span>
                {['Paris', 'New York', 'Kyoto', 'Dubai', 'London', 'Bali'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => navigate(`/hotels?city=${c}`)}
                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Customer Value Highlights */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 text-sm text-slate-300 w-full max-w-md shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">The GrandStay Promise</h3>
                    <p className="text-[11px] text-slate-400">Premium hospitality & reservation guarantee</p>
                  </div>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>100% Conflict-Free Scheduling:</strong> Guaranteed room allocation backed by real-time reservation locks.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Transparent Pricing:</strong> Fixed nightly rate snapshots locked upon reservation with zero hidden fees.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Flexible Self-Service:</strong> Real-time booking management, itineraries, and easy cancellations.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Curated Global Catalog:</strong> Handcrafted 5-star properties and bespoke suites across premier destinations.</span>
                  </li>
                </ul>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Looking for exclusive member rates?</span>
                  <Link
                    to="/login"
                    className="text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1 transition"
                  >
                    Member Sign In
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations Grid */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Inspiring Getaways
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Explore World-Class Destinations
              </h2>
            </div>
            <Link
              to="/hotels"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition"
            >
              View All Destinations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_CITIES.map((city) => (
              <div
                key={city.name}
                onClick={() => navigate(`/hotels?city=${city.name}`)}
                className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={city.img}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] uppercase font-semibold text-brand-300 tracking-wider">
                    {city.country}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">
                    {city.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 flex items-center justify-between">
                    <span>{city.desc}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-brand-300 text-xs flex items-center gap-0.5">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      {featuredHotels.length > 0 && (
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                  Featured Sanctuaries
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Handcrafted Stays Around the Globe
                </h2>
              </div>
              <Link
                to="/hotels"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition"
              >
                Browse All Properties
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredHotels.map((h) => (
                <HotelCard key={h._id} hotel={h} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Key Customer Benefits Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              The GrandStay Difference
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Why Discerning Travelers Choose GrandStay
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Every stay is designed around uncompromising quality, verified accommodations, and an effortless booking journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Best Rate Guarantee</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct booking assurance with guaranteed competitive nightly rates and no hidden reservation fees.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">100% Verified Luxury</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every property and suite in our collection is rigorously evaluated to satisfy 5-star hospitality benchmarks.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Instant Confirmation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time room availability locks your chosen suite immediately without waiting for host approvals.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Flexible Bookings</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hassle-free self-service reservation management and clear cancellation eligibility for peace of mind.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Transparent Pricing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nightly rates and stay totals are snapshot locked upon booking so your price never changes unexpectedly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Testimonials Section */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Guest Experiences
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Stories from Our Global Travelers
            </h2>
            <p className="mt-2 text-slate-500 text-sm">
              Discover how GrandStay crafts unforgettable memories for guests around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-7 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <p className="text-[11px] text-slate-500">{t.location}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                    {t.hotel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-brand-500 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Your Next Luxury Stay Awaits
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready for an Unforgettable Escape?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            Browse our handpicked collection of luxury suites and premier boutique hotels. Lock in your dates with instant confirmation and zero booking friction.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/hotels"
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-600/30 transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Explore All Properties
            </Link>
            <Link
              to="/amenities"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-sm backdrop-blur-md transition flex items-center justify-center gap-2"
            >
              Discover Amenities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
