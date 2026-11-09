import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

export default function HotelCard({ hotel }) {
  // Use first image or luxury fallback
  const mainImage =
    hotel.images && hotel.images.length > 0
      ? hotel.images[0]
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full group">
      {/* Thumbnail Banner */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100 shrink-0">
        <img
          src={mainImage}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Featured Badge */}
        {hotel.featured && (
          <div className="absolute top-3 left-3 bg-brand-600/95 backdrop-blur text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Featured Sanctuary
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{Number(hotel.rating).toFixed(1)}</span>
        </div>
      </div>

      {/* Hotel Details Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate">{hotel.city}, {hotel.country}</span>
          </div>

          {/* Hotel Name (Strict 2-line height for clean grid alignment) */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[3rem] leading-snug">
            {hotel.name}
          </h3>

          {/* Short Description (Strict 2-line height) */}
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {hotel.description}
          </p>

          {/* Key Amenities Preview */}
          <div className="mt-4 flex flex-wrap gap-1.5 min-h-[1.75rem]">
            {hotel.amenities && hotel.amenities.length > 0 && (
              <>
                {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600"
                  >
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 3 && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-400">
                    +{hotel.amenities.length - 3} more
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Starting from
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {hotel.startingPrice > 0 ? (
                <>
                  {formatINR(hotel.startingPrice)}{' '}
                  <span className="text-xs font-normal text-slate-500">/ night</span>
                </>
              ) : (
                <span className="text-xs font-medium text-slate-500">Check availability</span>
              )}
            </div>
          </div>

          <Link
            to={`/hotels/${hotel._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Explore
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
