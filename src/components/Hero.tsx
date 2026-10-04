import { Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface HeroProps {
  onStartBooking: () => void;
  onViewDemo: () => void;
}

export function Hero({ onStartBooking, onViewDemo }: HeroProps) {
  return (
    <section id="top" className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold tracking-wide text-emerald-300 uppercase">
                Premium Concierge Scheduling
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Seamless Scheduling for{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                High-Ticket Services
              </span>
            </h1>

            <p className="mt-6 text-lg text-white/60 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Automate consultations, streamline client onboarding, and deliver instant digital
              receipts with zero friction.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onStartBooking}
                className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 text-sm font-semibold text-[#060D0B] shadow-xl shadow-emerald-500/25 transition-all hover:shadow-emerald-500/50 hover:scale-[1.03] active:scale-95"
              >
                <Calendar className="h-4 w-4" />
                Start Booking Flow
              </button>
              <button
                onClick={onViewDemo}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 backdrop-blur-xl px-6 py-3.5 text-sm font-semibold text-white hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
              >
                View Agency Integration Demo
              </button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              {[
                { value: '2,400+', label: 'Sessions Booked' },
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '< 3s', label: 'Avg. Response' },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating 3D Glass Booking Card */}
          <div className="relative flex items-center justify-center">
            <FloatingBookingCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingBookingCard() {
  return (
    <div className="relative animate-float-3d" style={{ perspective: '1000px' }}>
      {/* Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent blur-2xl" />

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-3xl border border-white/10 backdrop-blur-2xl p-7 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05), rgba(255,255,255,0.02))',
          transform: 'rotateY(-8deg) rotateX(4deg)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-medium text-white/40 uppercase tracking-wide">Next Available</div>
            <div className="text-lg font-bold text-white mt-0.5">Executive Strategy Audit</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30">
            <Calendar className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Live status */}
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 mb-5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-sm font-semibold text-emerald-300">12 Slots Open Today</span>
        </div>

        {/* Mini slots */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '4:45 PM', '6:15 PM'].map((time, i) => (
            <div
              key={time}
              className={`rounded-lg px-2 py-2.5 text-center text-xs font-medium transition-all ${
                i === 1
                  ? 'bg-emerald-400 text-[#060D0B] shadow-lg shadow-emerald-500/30'
                  : i === 4
                  ? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                  : 'border border-white/10 bg-white/5 text-white/50'
              }`}
            >
              {time}
            </div>
          ))}
        </div>

        {/* Details row */}
        <div className="flex items-center justify-between border-t border-white/10 pt-5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/40" />
            <span className="text-sm text-white/60">45 min</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">$250/hr</span>
          </div>
        </div>

        {/* Consultant row */}
        <div className="flex items-center gap-3 mt-5 rounded-xl bg-white/5 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-bold text-white">
            MC
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Marcus Chen</div>
            <div className="text-xs text-white/40">Senior Strategy Partner</div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-xs font-medium text-white/60">4.9</span>
          </div>
        </div>
      </div>
    </div>
  );
}
