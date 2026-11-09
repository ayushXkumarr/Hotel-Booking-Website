import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import HotelCard from '../components/hotels/HotelCard';
import HotelFilter from '../components/hotels/HotelFilter';
import { Building2, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';

const CITIES = ['Paris', 'New York', 'Kyoto', 'Dubai', 'London', 'Bali'];

export default function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    minRating: searchParams.get('minRating') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    featured: searchParams.get('featured') || '',
  });

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 9,
      };

      if (filters.search) params.search = filters.search;
      if (filters.city) params.city = filters.city;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.featured) params.featured = filters.featured;

      const res = await api.get('/hotels', { params });
      if (res.data?.success) {
        setHotels(res.data.hotels || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load hotels:', err);
      setError(err.response?.data?.message || 'Could not fetch hotel catalog.');
    } finally {
      setLoading(false);
    }
  };

  // Synchronize URL parameters with filter state
  useEffect(() => {
    fetchHotels();
  }, [page, filters]);

  const handleFilterChange = (key, value) => {
    setPage(1); // Reset to first page upon filter change
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      // Update query parameters in URL
      const newParams = new URLSearchParams();
      Object.entries(updated).forEach(([k, v]) => {
        if (v) newParams.set(k, v);
      });
      setSearchParams(newParams);
      return updated;
    });
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      search: '',
      city: '',
      minRating: '',
      minPrice: '',
      maxPrice: '',
      featured: '',
    };
    setPage(1);
    setFilters(emptyFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      {/* Page Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          World-Class Accommodations
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Luxury Stays & Sanctuaries
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Discover handpicked resorts, bespoke suites, and premier urban retreats around the world.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filter Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <HotelFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              cities={CITIES}
            />
          </div>
        </div>

        {/* Right Column: Hotel Catalog Grid */}
        <div className="lg:col-span-3 space-y-8">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <span>
              Showing <strong className="text-slate-900">{hotels.length}</strong> of{' '}
              <strong className="text-slate-900">{total}</strong> hotels found
            </span>
            {filters.city && (
              <span className="font-medium text-brand-600">Location: {filters.city}</span>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-slate-200 p-4 space-y-4 animate-pulse"
                >
                  <div className="h-48 bg-slate-200 rounded-2xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-10 text-center space-y-3">
              <h3 className="text-base font-bold text-rose-700">Unable to Load Catalog</h3>
              <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
              <button
                onClick={fetchHotels}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Try Again
              </button>
            </div>
          ) : hotels.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Hotels Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                We couldn't find any hotels matching your current search or filter criteria. Try adjusting your price range, destination, or rating.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Hotel Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                    p === page
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
