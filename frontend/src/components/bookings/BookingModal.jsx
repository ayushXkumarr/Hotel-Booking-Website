import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Sparkles,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function BookingModal({ room, hotel, isOpen, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Helper to get formatted tomorrow date string YYYY-MM-DD
  const getDefaultDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 2);

    return {
      checkIn: tomorrow.toISOString().split('T')[0],
      checkOut: dayAfter.toISOString().split('T')[0],
    };
  };

  const initialDates = getDefaultDates();
  const [checkInDate, setCheckInDate] = useState(initialDates.checkIn);
  const [checkOutDate, setCheckOutDate] = useState(initialDates.checkOut);
  const [guestsCount, setGuestsCount] = useState(1);

  // Availability State
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [availabilityError, setAvailabilityError] = useState(null);

  // Booking Execution State
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Reset state when modal opens or room changes
  useEffect(() => {
    if (isOpen) {
      setAvailabilityResult(null);
      setAvailabilityError(null);
      setBookingSuccess(null);
      checkLiveAvailability(initialDates.checkIn, initialDates.checkOut, 1);
    }
  }, [isOpen, room]);

  const checkLiveAvailability = async (inDate, outDate, guests) => {
    if (!room || !inDate || !outDate) return;

    if (new Date(outDate) <= new Date(inDate)) {
      setAvailabilityError('Check-out date must be after check-in date.');
      setAvailabilityResult(null);
      return;
    }

    setIsChecking(true);
    setAvailabilityError(null);

    try {
      const res = await api.post('/bookings/check-availability', {
        roomId: room._id,
        checkInDate: inDate,
        checkOutDate: outDate,
        guestsCount: guests,
      });

      if (res.data?.success) {
        setAvailabilityResult(res.data);
      }
    } catch (err) {
      setAvailabilityError(
        err.response?.data?.message || 'Failed to verify room availability.'
      );
      setAvailabilityResult(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDateChange = (type, value) => {
    let newIn = checkInDate;
    let newOut = checkOutDate;

    if (type === 'checkIn') {
      newIn = value;
      setCheckInDate(value);
    } else {
      newOut = value;
      setCheckOutDate(value);
    }

    checkLiveAvailability(newIn, newOut, guestsCount);
  };

  const handleGuestsChange = (e) => {
    const val = parseInt(e.target.value, 10) || 1;
    setGuestsCount(val);
    checkLiveAvailability(checkInDate, checkOutDate, val);
  };

  const handleConfirmReservation = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to complete your reservation.', 'warning');
      navigate('/login', { state: { from: `/hotels/${hotel._id}` } });
      return;
    }

    if (!availabilityResult?.isAvailable) {
      addToast('Room is not available for the selected dates.', 'error');
      return;
    }

    setIsBooking(true);

    try {
      const payload = {
        roomId: room._id,
        checkInDate,
        checkOutDate,
        guestsCount,
      };

      const res = await api.post('/bookings', payload);

      if (res.data?.success) {
        setBookingSuccess(res.data.booking);
        addToast('Reservation confirmed successfully!', 'success');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to confirm reservation.';
      addToast(errorMsg, 'error');
      setAvailabilityError(errorMsg);
    } finally {
      setIsBooking(false);
    }
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {room.roomType}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              Reserve Room {room.roomNumber}
            </h3>
            <p className="text-xs text-slate-500">{hotel?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookingSuccess ? (
          /* Success Screen */
          <div className="py-6 space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-extrabold text-slate-900">
                Reservation Confirmed!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Your luxury stay has been scheduled and recorded in the database.
              </p>
            </div>

            {/* Booking Summary Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Booking Reference:</span>
                <span className="font-mono font-bold text-slate-800">
                  {bookingSuccess._id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guest Name:</span>
                <span className="font-semibold text-slate-800">
                  {user?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-semibold text-slate-800">
                  {bookingSuccess.totalNights} Nights (
                  {new Date(bookingSuccess.checkInDate).toLocaleDateString()} –{' '}
                  {new Date(bookingSuccess.checkOutDate).toLocaleDateString()})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Price:</span>
                <span className="text-sm font-extrabold text-slate-900">
                  ${bookingSuccess.totalPrice}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-400">Payment Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                  Simulated_Paid
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/my-bookings');
                }}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-2"
              >
                View in My Bookings
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Reservation Form */
          <div className="space-y-5 mt-5">
            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Check-In Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange('checkIn', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Check-Out Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => handleDateChange('checkOut', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Guests Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Number of Guests
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={guestsCount}
                  onChange={handleGuestsChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition cursor-pointer"
                >
                  {Array.from({ length: room.maxGuests || 2 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Adult' : 'Adults'} (Room max: {room.maxGuests})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Availability & Pricing Feedback */}
            {isChecking ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span>Checking date availability on the server...</span>
              </div>
            ) : availabilityError ? (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Reservation Unavailable</strong>
                  <span>{availabilityError}</span>
                </div>
              </div>
            ) : availabilityResult && !availabilityResult.isAvailable ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Dates Already Reserved</strong>
                  <span>{availabilityResult.message}</span>
                </div>
              </div>
            ) : availabilityResult?.isAvailable ? (
              /* Price Breakdown Box */
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>
                    ${availabilityResult.pricePerNight} × {availabilityResult.totalNights}{' '}
                    {availabilityResult.totalNights === 1 ? 'night' : 'nights'}
                  </span>
                  <span className="font-semibold text-slate-900">
                    ${availabilityResult.totalPrice}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Simulated Service Fee (0%)</span>
                  <span className="text-emerald-600 font-semibold">$0.00</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-900">Total Price:</span>
                  <span className="text-xl font-extrabold text-brand-700">
                    ${availabilityResult.totalPrice}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Instant Confirmation & Demo Notice */}
            <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-4 text-[11px] text-teal-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-teal-900">
                <CreditCard className="w-3.5 h-3.5 text-teal-700" />
                <span>Instant Confirmation & Demo Reservation</span>
              </div>
              <p className="text-teal-800 leading-relaxed">
                Your reservation will be processed securely and confirmed immediately. Demo Booking: No real payment required for this reservation.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isBooking}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReservation}
                disabled={
                  isChecking ||
                  isBooking ||
                  !availabilityResult?.isAvailable
                }
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition flex items-center gap-2"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Reservation...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Confirm & Reserve Suite
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
