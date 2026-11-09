import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import {
  CalendarCheck,
  Search,
  Filter,
  Building2,
  DollarSign,
  User,
  Clock,
  CheckCircle2,
  Ban,
  Loader2,
  Shield,
  CreditCard,
  Bed,
} from 'lucide-react';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const { addToast } = useToast();

  const fetchBookingsAndStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [bookingsRes, statsRes] = await Promise.all([
        api.get('/bookings/admin/all', { params }),
        api.get('/bookings/admin/stats'),
      ]);

      if (bookingsRes.data?.success) {
        setBookings(bookingsRes.data.bookings || []);
      }
      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      addToast('Failed to load reservations data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndStats();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookingsAndStats();
  };

  const executeStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await api.put(`/bookings/admin/${bookingId}/status`, {
        bookingStatus: newStatus,
      });
      if (res.data?.success) {
        addToast(res.data.message || 'Status updated.', 'success');
        fetchBookingsAndStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusSelect = (bookingId, newStatus) => {
    if (newStatus === 'Cancelled') {
      setPendingStatusUpdate({ bookingId, newStatus });
      setConfirmModalOpen(true);
    } else {
      executeStatusChange(bookingId, newStatus);
    }
  };

  const handleConfirmCancel = () => {
    if (pendingStatusUpdate) {
      executeStatusChange(pendingStatusUpdate.bookingId, pendingStatusUpdate.newStatus);
    }
    setConfirmModalOpen(false);
    setPendingStatusUpdate(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Confirmed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
            <Ban className="w-3 h-3" />
            Cancelled
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Master Reservation Oversight</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor customer bookings, update itinerary states, and audit simulated transaction totals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/hotels"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            Hotels
          </Link>
          <Link
            to="/admin/rooms"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Bed className="w-4 h-4" />
            Rooms
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                Total Bookings
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats.totalBookings}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Platform Lifetime</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                Confirmed
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {stats.confirmedBookings}
              </h3>
              <p className="text-[10px] text-emerald-600/80 font-medium mt-0.5">
                Active Itineraries
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                Cancelled
              </p>
              <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
                {stats.cancelledBookings}
              </h3>
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">
                Simulated Refunded
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                Simulated Revenue
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                ${stats.totalRevenue}
              </h3>
              <p className="text-[10px] text-purple-600 font-medium mt-0.5">
                From Confirmed Stays
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-8 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, email, or hotel..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="mt-6 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading master bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Reservations Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No customer bookings match your search query or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Reference & Guest</th>
                  <th className="py-4 px-6">Hotel & Room</th>
                  <th className="py-4 px-6">Dates & Nights</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Status Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{b.user?.name || 'Guest'}</div>
                      <div className="text-[11px] text-slate-400">{b.user?.email}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-1">
                        ID: {b._id}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{b.hotel?.name}</div>
                      <div className="text-[11px] text-brand-700 font-semibold">
                        {b.room?.roomType} • Room {b.room?.roomNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">{b.hotel?.city}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">
                        {new Date(b.checkInDate).toLocaleDateString()} –{' '}
                        {new Date(b.checkOutDate).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {b.totalNights} nights • {b.guestsCount} guests
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-black text-slate-900 text-sm">
                        ${b.totalPrice}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          b.paymentStatus === 'Refunded'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(b.bookingStatus)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {updatingId === b._id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-brand-600 inline-block" />
                      ) : (
                        <select
                          value={b.bookingStatus}
                          onChange={(e) => handleStatusSelect(b._id, e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPendingStatusUpdate(null);
        }}
        onConfirm={handleConfirmCancel}
        title="Confirm Cancellation Override"
        message="Are you sure you want to cancel this customer reservation? This will mark the booking as Cancelled, update the payment status to Refunded, and release the suite back to the available catalog."
        confirmText="Yes, Cancel Booking"
        confirmVariant="danger"
      />
    </div>
  );
}
