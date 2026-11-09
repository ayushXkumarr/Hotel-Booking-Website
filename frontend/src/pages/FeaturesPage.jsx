import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  CalendarCheck,
  DollarSign,
  Clock,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Star,
  Bed,
} from 'lucide-react';

export default function FeaturesPage() {
  const experiences = [
    {
      title: 'Discover Exceptional Stays',
      subtitle: 'Curated World-Class Sanctuaries',
      description:
        'Immerse yourself in our handpicked portfolio of architectural landmarks, beachfront resorts, historic palaces, and serene urban retreats in premier world destinations.',
      icon: <Building2 className="w-6 h-6 text-brand-600" />,
      tag: 'Bespoke Stays',
      highlight: '6 Global Capitals',
    },
    {
      title: 'Easy and Secure Reservations',
      subtitle: 'Streamlined One-Click Booking',
      description:
        'Experience an effortless reservation journey designed for peace of mind. Authenticated guest sessions, strict privacy protocols, and instant digital confirmation.',
      icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
      tag: 'Secure & Verified',
      highlight: 'Instant Confirmation',
    },
    {
      title: 'Real-Time Room Availability',
      subtitle: 'Zero Double-Booking Guarantee',
      description:
        'Live inventory synchronization ensures you always see accurate room statuses. Turnovers on checkout days are seamlessly accommodated without date collisions.',
      icon: <CalendarCheck className="w-6 h-6 text-indigo-600" />,
      tag: 'Live Engine',
      highlight: '100% Conflict-Free',
    },
    {
      title: 'Transparent Pricing',
      subtitle: 'Guaranteed Nightly Snapshots',
      description:
        'What you see is what you pay. Every booking locks in an immutable price snapshot at reservation time, protecting your rate from retroactive administrative adjustments.',
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      tag: 'Best Rate',
      highlight: 'Zero Hidden Surcharges',
    },
    {
      title: 'Flexible Booking Management',
      subtitle: 'Self-Service Itinerary Control',
      description:
        'Manage, review, or cancel upcoming stays right from your personal dashboard. Cancellations made prior to check-in instantly release inventory and trigger status refunds.',
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      tag: 'Guest Freedom',
      highlight: 'Instant Self-Service',
    },
    {
      title: 'Personalized Customer Experience',
      subtitle: 'Tailored Luxury From Arrival to Departure',
      description:
        'Choose from customized bed preferences, private balconies, spa access, and signature dining suites designed to exceed your travel expectations.',
      icon: <HeartHandshake className="w-6 h-6 text-rose-600" />,
      tag: 'VIP Care',
      highlight: 'Dedicated Concierge',
    },
  ];

  return (
    <div className="flex-1 bg-slate-50">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-b from-slate-900 via-navy-900 to-slate-950 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Signature Hospitality
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-teal-300 to-indigo-300">GrandStay Experience</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Elevating the art of travel with handpicked luxury properties, verified availability, and an uncompromising commitment to guest convenience.
          </p>
        </div>
      </section>

      {/* Main Experience Pillars Grid */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Why Travelers Choose GrandStay
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            Engineered for Flawless Getaways
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every feature on our platform is built around delivering an effortless, premium hospitality experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {exp.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                    {exp.tag}
                  </span>
                </div>

                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-1">
                  {exp.subtitle}
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-3">
                  {exp.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {exp.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {exp.highlight}
                </span>
                <Link
                  to="/hotels"
                  className="font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition"
                >
                  Explore Stays
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Standards Strip */}
      <section className="py-14 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-slate-900">100%</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Properties</div>
              <p className="text-xs text-slate-400">All suites inspected for luxury standards</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-slate-900">0</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Double Bookings</div>
              <p className="text-xs text-slate-400">Transactional reservation locking</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-slate-900">24/7</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Guest Support</div>
              <p className="text-xs text-slate-400">Instant reservation access anytime</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-slate-900">4.9 ★</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Rating</div>
              <p className="text-xs text-slate-400">Loved by international travelers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 text-white rounded-3xl p-10 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
              Ready For An Unforgettable Stay?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Book Your Sanctuary Today
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Browse our premier catalog of hotels across Paris, New York, Kyoto, Dubai, London, and Bali with live availability and guaranteed nightly rates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/hotels"
              className="w-full sm:w-auto px-7 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-brand-600/30 transition text-center"
            >
              Browse All Stays
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition text-center border border-white/10"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
