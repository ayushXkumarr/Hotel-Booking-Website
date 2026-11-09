import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

/**
 * ProtectedRoute Component
 * Guards routes against unauthenticated users and enforces role-based access.
 *
 * @param {boolean} adminOnly - If true, restricts access solely to users with role === 'admin'
 */
export default function ProtectedRoute({ adminOnly = false, children }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // If session is still verifying, display an elegant loading indicator
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Verifying session...</p>
      </div>
    );
  }

  // If user is not authenticated, redirect to /login and preserve destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route is restricted to admins and current user is not admin, show access denied view
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            This administrative area requires elevated credentials. You are currently signed in as a standard <span className="font-semibold text-slate-800">Customer</span> ({user?.email}).
          </p>
          <div className="flex flex-col gap-2">
            <Navigate to="/" replace />
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
