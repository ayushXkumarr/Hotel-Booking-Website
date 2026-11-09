import React from 'react';
import { Bed, Users, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export default function RoomCard({ room, onSelectRoom }) {
  const defaultImage =
    room.images && room.images.length > 0
      ? room.images[0]
      : 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';

  const categoryColors = {
    Standard: 'bg-slate-100 text-slate-700 border-slate-200',
    Deluxe: 'bg-teal-50 text-teal-700 border-teal-200',
    'Executive Suite': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Presidential Suite': 'bg-purple-50 text-purple-700 border-purple-200',
  }[room.roomType] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row gap-6 p-6">
      {/* Room Photo */}
      <div className="w-full md:w-64 h-52 md:min-h-[14rem] rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
        <img
          src={defaultImage}
          alt={`Room ${room.roomNumber} - ${room.roomType}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
          Room {room.roomNumber}
        </div>
      </div>

      {/* Room Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${categoryColors}`}
            >
              {room.roomType}
            </span>

            {room.isAvailable ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Available Now
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                <AlertCircle className="w-3.5 h-3.5" />
                Currently Unavailable
              </span>
            )}
          </div>

          <h4 className="text-lg font-bold text-slate-900 mb-1">
            {room.roomType} • Room {room.roomNumber}
          </h4>

          {room.description && (
            <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Key Specs */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 mb-4 py-2 border-y border-slate-100">
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Up to {room.maxGuests} Guests</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Bed className="w-4 h-4 text-brand-600" />
              <span>{room.bedType || 'King Bed'}</span>
            </div>
          </div>

          {/* Room Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"
                >
                  <CheckCircle2 className="w-3 h-3 text-brand-600" />
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing and Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Rate per night
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              ${room.pricePerNight}{' '}
              <span className="text-xs font-normal text-slate-500">/ night</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!room.isAvailable}
            onClick={() => onSelectRoom && onSelectRoom(room)}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
          >
            Reserve Room
          </button>
        </div>
      </div>
    </div>
  );
}
