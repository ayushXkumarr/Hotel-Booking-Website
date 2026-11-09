import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatINR, formatCurrency } from '../../utils/formatCurrency';
import {
  Shield,
  Building2,
  Bed,
  CalendarCheck,
  Users,
  IndianRupee,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    hotelsCount: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    totalRevenueINR: 0,
    totalRevenueUSD: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [hotelRes, bookingStatsRes] = await Promise.all([
          api.get('/hotels?limit=50'),
          api.get('/bookings/admin/stats').catch(() => ({ data: { stats: {} } })),
        ]);

        const totalHotels = hotelRes.data?.total || 0;
        const bStats = bookingStatsRes.data?.stats || {};

        setStats({
          hotelsCount: totalHotels,
          totalBookings: bStats.totalBookings || 0,
          confirmedBookings: bStats.confirmedBookings || 0,
          totalRevenue: bStats.totalRevenueINR ?? bStats.totalRevenue ?? 0,
          totalRevenueINR: bStats.totalRevenueINR ?? bStats.totalRevenue ?? 0,
          totalRevenueUSD: bStats.totalRevenueUSD || 0,
          loading: false,
        });
      } catch (err) {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 mb-2">
            <Shield className="w-3.5 h-3.5" />
            Hotel Operations & Reservation Management
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span>. Oversee platform inventories, hotels, and reservations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/bookings"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            Manage Bookings
          </Link>
          <Link
            to="/admin/hotels"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
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

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Active Hotels</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.loading ? '...' : stats.hotelsCount}
            </h3>
            <p className="text-[11px] text-brand-600 font-medium mt-1">Properties in Catalog</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Total Reservations</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.loading ? '...' : stats.totalBookings}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats.confirmedBookings} Confirmed
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Gross Revenue</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {formatINR(stats.totalRevenueINR || stats.totalRevenue)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Confirmed Stays
              {stats.totalRevenueUSD > 0 && (
                <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                  (+ {formatCurrency(stats.totalRevenueUSD, 'USD')} legacy)
                </span>
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">System Status</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">Operational</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">All Services Online</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Reservations Oversight</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Track customer bookings in real time, view guest details, verify date ranges, and update booking states.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              {stats.totalBookings} total bookings
            </span>
            <Link
              to="/admin/bookings"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition"
            >
              Open
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hotel Properties</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Create and edit hotel profiles, descriptions, amenities, ratings, and locations across destinations.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              {stats.hotelsCount} properties
            </span>
            <Link
              to="/admin/hotels"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition"
            >
              Open
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Bed className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Suites & Rooms</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Manage room numbers, suite categories, max guest capacities, nightly rates, and availability.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Multi-hotel sync</span>
            <Link
              to="/admin/rooms"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition"
            >
              Open
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
