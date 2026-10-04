import { ArrowRight, Calendar, Clock, Sparkles, Users, Zap, Shield, Globe, Bell, FileText, CreditCard } from 'lucide-react';
import { services, consultants } from '@/lib/data';

interface SectionsProps {
  onBookClick: () => void;
}

export function ServicesSection({ onBookClick }: SectionsProps) {
  return (
    <section id="services" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide text-emerald-300 uppercase">Premium Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Curated Consultation Experiences</h2>
          <p className="mt-3 text-white/50 max-w-2xl mx-auto">
            Every session is led by a vetted senior partner, with automated scheduling and instant confirmation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
            >
              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-500" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-full px-3 py-1">
                    {service.category}
                  </span>
                  <span className="text-lg font-bold text-white">${service.price}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-4">{service.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-3.5 w-3.5 text-white/40" />
                  <span className="text-xs text-white/50">{service.duration} minutes</span>
                </div>

                <ul className="space-y-1.5 mb-5">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-white/60">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onBookClick}
                  className="flex items-center gap-2 text-sm font-semibold text-emerald-400 group-hover:gap-3 transition-all"
                >
                  Book this session
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AvailabilitySection() {
  return (
    <section id="availability" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 mb-4">
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">Our Specialists</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Meet the Executive Team</h2>
          <p className="mt-3 text-white/50 max-w-2xl mx-auto">
            Senior partners with decades of combined experience across strategy, AI, and engineering.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {consultants.map((consultant) => (
            <div
              key={consultant.id}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/8"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${consultant.avatarGradient} text-lg font-bold text-white shrink-0`}>
                  {consultant.initials}
                  {consultant.available && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400 border-2 border-[#0A1411]" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{consultant.name}</h3>
                  <p className="text-xs text-white/40 truncate">{consultant.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-xs font-medium text-white/60">{consultant.rating}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className={`text-xs ${consultant.available ? 'text-emerald-400' : 'text-white/30'}`}>
                      {consultant.available ? 'Available' : 'Fully booked'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {consultant.specialties.map((spec) => (
                  <span key={spec} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/50">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IntegrationSection() {
  const integrations = [
    { icon: Calendar, name: 'Google Calendar', desc: 'Two-way sync with automatic event creation' },
    { icon: Bell, name: 'Outlook 365', desc: 'Seamless integration with Microsoft suite' },
    { icon: CreditCard, name: 'Stripe Payments', desc: 'Instant payment processing and invoicing' },
    { icon: FileText, name: 'PDF Receipts', desc: 'Branded digital receipts generated automatically' },
    { icon: Globe, name: 'Timezone Detection', desc: 'Auto-detects client timezone for accurate scheduling' },
    { icon: Shield, name: 'Bank-Grade Security', desc: 'End-to-end encryption for all client data' },
  ];

  return (
    <section id="integration" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 mb-4">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide text-emerald-300 uppercase">Integration Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything Connected, Zero Friction</h2>
          <p className="mt-3 text-white/50 max-w-2xl mx-auto">
            Our booking engine integrates with the tools you already use, automating the entire scheduling lifecycle.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 border border-emerald-500/20 shrink-0 transition-transform group-hover:scale-110">
                <integration.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{integration.name}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{integration.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white mb-5 text-center">Automated Booking Flow</h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {['Client Selects Service', 'Picks Date & Time', 'Enters Details', 'Pays & Receives Invoice'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 flex-1 sm:flex-none">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-[#060D0B]">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-white/80">{step}</span>
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-emerald-400/50 hidden sm:block rotate-90 sm:rotate-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="relative py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent p-8 sm:p-12 text-center backdrop-blur-xl overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Elevate Your Scheduling?</h2>
            <p className="text-white/60 max-w-xl mx-auto mb-8">
              Join 2,400+ executives who've streamlined their consultation workflow with APEX RESERVE.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 text-sm font-semibold text-[#060D0B] shadow-xl shadow-emerald-500/25 hover:scale-[1.03] active:scale-95 transition-all"
              >
                <Calendar className="h-4 w-4" />
                Start Booking Flow
              </button>
              <a
                href="mailto:concierge@apexreserve.com"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 backdrop-blur-xl px-6 py-3.5 text-sm font-semibold text-white hover:border-emerald-500/40 transition-all"
              >
                Contact Concierge
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600">
              <Zap className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="text-sm font-bold text-white">APEX <span className="text-emerald-400">RESERVE</span></span>
          </div>
          <p className="text-xs text-white/40">
            © 2026 APEX RESERVE. Premium concierge scheduling for executive services.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Security'].map((link) => (
              <a key={link} href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
