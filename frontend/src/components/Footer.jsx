import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  Globe,
  Compass,
  Sparkles,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Identity & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Grand<span className="text-brand-400">Stay</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Curated world-class hotels, boutique retreats, and luxury suites. Experience unmatched hospitality, verified luxury standards, and seamless reservations.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-brand-300 font-medium bg-brand-950/70 px-3 py-1.5 rounded-full border border-brand-800/50">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Verified Luxury Collection</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-slate-800/70 px-3 py-1.5 rounded-full border border-slate-700/60">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Best Rate Guarantee</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-brand-400" />
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/hotels" className="hover:text-brand-400 transition">
                  Explore Stays
                </Link>
              </li>
              <li>
                <Link to="/hotels?featured=true" className="hover:text-brand-400 transition">
                  Featured Sanctuaries
                </Link>
              </li>
              <li>
                <Link to="/amenities" className="hover:text-brand-400 transition">
                  Hotel Amenities
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-brand-400 transition">
                  My Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Assistance */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-brand-400" />
              Assistance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/amenities" className="hover:text-brand-400 transition">
                  About GrandStay
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@grandstay.example.com"
                  className="hover:text-brand-400 transition flex items-center gap-1"
                >
                  Customer Support
                </a>
              </li>
              <li>
                <Link to="/amenities" className="hover:text-brand-400 transition">
                  FAQ & Help Center
                </Link>
              </li>
              <li className="text-[11px] text-slate-500 pt-1">
                Desk: support@grandstay.example.com
              </li>
            </ul>
          </div>

          {/* Legal & Terms (Demo) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-brand-400" />
              Policies (Demo)
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="hover:text-slate-200 transition">
                <span>Terms & Conditions (Demo)</span>
              </li>
              <li className="hover:text-slate-200 transition">
                <span>Privacy Policy (Demo)</span>
              </li>
              <li className="hover:text-slate-200 transition">
                <span>Flexible Cancellation Policy</span>
              </li>
              <li className="hover:text-slate-200 transition">
                <span>Accessibility Commitment</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 GrandStay Hospitality Group. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Luxury Hotel Management Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
