import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../services/api';

/**
 * HealthBadge Component
 * Connects to GET /api/health to dynamically check backend and MongoDB connectivity.
 */
export default function HealthBadge() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (err) {
      setError(err.message || 'Cannot reach API server');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Periodically re-check every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-xl p-4 text-xs text-slate-300 shadow-xl max-w-md w-full">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-slate-100 tracking-wide uppercase text-[11px]">System Status</span>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
          title="Refresh Health Status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-400' : ''}`} />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {/* Backend API status */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Backend API:</span>
          {loading && !health && !error ? (
            <span className="text-slate-400 animate-pulse">Checking...</span>
          ) : error ? (
            <span className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-800/40 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Offline ({error})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {health?.status || 'Online'}
            </span>
          )}
        </div>

        {/* MongoDB Database status */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Database (MongoDB):</span>
          {health ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-medium ${
                health.database?.connected
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                  : 'text-amber-400 bg-amber-950/40 border-amber-800/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  health.database?.connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
              {health.database?.status || 'Unknown'}
            </span>
          ) : (
            <span className="text-slate-500">Awaiting backend</span>
          )}
        </div>

        {health && (
          <div className="pt-2 border-t border-slate-800/70 text-[10px] text-slate-500 flex justify-between">
            <span>Uptime: {health.uptime}</span>
            <span>v{health.version}</span>
          </div>
        )}
      </div>
    </div>
  );
}
