import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  CalendarCheck,
  Building2,
  Calendar,
  Users,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Ban,
  ArrowRight,
  Loader2,
  Shield,
} from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const { addToast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch reservations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancelModal = (booking) => {
    setSelectedBookingToCancel(booking);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    setCancelling(true);

    try {
      const res = await api.put(`/bookings/${selectedBookingToCancel._id}/cancel`);
      if (res.data?.success) {
        addToast(res.data.message || 'Reservation cancelled successfully.', 'success');
        setSelectedBookingToCancel(null);
        fetchBookings();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel reservation.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const isEligibleForCancellation = (booking) => {
    if (booking.bookingStatus !== 'Confirmed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    return today < checkIn;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Confirmed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3 h-3" />
            Cancelled
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            Guest Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your itinerary, dates, payments, and reservation statuses.
          </p>
        </div>

        <Link
          to="/hotels"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Building2 className="w-4 h-4" />
          Book Another Stay
        </Link>
      </div>

      {/* Content */}
      <div className="mt-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading your itineraries...</p>
          </div>
        ) : bookings.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Reservations Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              You haven't made any hotel reservations yet. Browse our curated collection of luxury sanctuaries and suites to plan your first stay.
            </p>
            <Link
              to="/hotels"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Explore Hotels
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-6">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col lg:flex-row"
              >
                {/* Hotel Thumbnail */}
                <div className="lg:w-72 h-56 lg:h-auto bg-slate-100 shrink-0 relative">
                  <img
                    src={
                      b.hotel?.images?.[0] ||
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={b.hotel?.name || 'Hotel'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(b.bookingStatus)}
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>
                          {b.hotel?.city}, {b.hotel?.country}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        Ref: {b._id}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900">
                      {b.hotel?.name}
                    </h3>
                    <p className="text-xs font-semibold text-brand-700 mt-0.5">
                      {b.room?.roomType} • Room {b.room?.roomNumber}
                    </p>

                    {/* Key Itinerary Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-slate-400">
                          Check-In
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {new Date(b.checkInDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-slate-400">
                          Check-Out
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {new Date(b.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-slate-400">
                          Duration
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {b.totalNights} {b.totalNights === 1 ? 'Night' : 'Nights'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-slate-400">
                          Guests
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {b.guestsCount} {b.guestsCount === 1 ? 'Guest' : 'Guests'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing, Payment & Cancellation Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Total Price Paid
                        </span>
                        <span className="text-2xl font-black text-slate-900">
                          ${b.totalPrice}
                        </span>
                      </div>
                      <div className="pl-3 border-l border-slate-200">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Payment Mode
                        </span>
                        <span
                          className={`text-xs font-bold inline-block px-2 py-0.5 rounded-full ${
                            b.paymentStatus === 'Refunded'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isEligibleForCancellation(b) ? (
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(b)}
                          className="px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                        >
                          Cancel Booking
                        </button>
                      ) : b.bookingStatus === 'Confirmed' ? (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Non-refundable (Check-in reached)
                        </span>
                      ) : null}

                      <Link
                        to={`/hotels/${b.hotel?._id}`}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                      >
                        Property Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedBookingToCancel}
        title="Cancel Reservation?"
        message={`Are you sure you want to cancel your reservation for "${selectedBookingToCancel?.hotel?.name}" (Room ${selectedBookingToCancel?.room?.roomNumber}) from ${new Date(selectedBookingToCancel?.checkInDate).toLocaleDateString()} to ${new Date(selectedBookingToCancel?.checkOutDate).toLocaleDateString()}? Per our policy, your payment of $${selectedBookingToCancel?.totalPrice} will be refunded.`}
        confirmText="Confirm Cancellation"
        isDanger={true}
        isLoading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setSelectedBookingToCancel(null)}
      />
    </div>
  );
}
