import { useEffect, useState } from 'react';
import { Calendar, ChevronDown, Clock, Globe, Menu, X, Zap } from 'lucide-react';

interface NavbarProps {
  onBookClick: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  language: string;
  setLanguage: (l: string) => void;
}

export function Navbar({ onBookClick, currency, setCurrency, language, setLanguage }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showLang, setShowLang] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Services', href: '#services' },
    { label: 'Availability', href: '#availability' },
    { label: 'Integration Showcase', href: '#integration' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
            scrolled
              ? 'border border-emerald-500/15 bg-[#060D0B]/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
              : 'border border-transparent bg-transparent'
          }`}
        >
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110">
              <Zap className="h-5 w-5 text-white" fill="white" />
              <div className="absolute inset-0 rounded-xl bg-emerald-400/30 blur-md -z-10" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              APEX <span className="text-emerald-400">RESERVE</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Currency toggle */}
            <div className="relative hidden md:block">
              <button
                onClick={() => { setShowCurrency(!showCurrency); setShowLang(false); }}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:border-emerald-500/30 transition-all"
              >
                <span>{currency}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showCurrency && (
                <div className="absolute right-0 top-full mt-2 w-32 rounded-xl border border-white/10 bg-[#0A1411]/95 backdrop-blur-xl py-1 shadow-2xl animate-fade-in">
                  {['USD $', 'EUR €', 'GBP £', 'AED'].map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCurrency(c.split(' ')[0]); setShowCurrency(false); }}
                      className="flex w-full items-center px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-emerald-500/10 transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language toggle */}
            <div className="relative hidden md:block">
              <button
                onClick={() => { setShowLang(!showLang); setShowCurrency(false); }}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:border-emerald-500/30 transition-all"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{language}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showLang && (
                <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-white/10 bg-[#0A1411]/95 backdrop-blur-xl py-1 shadow-2xl animate-fade-in">
                  {['English', 'Español', 'Français', 'العربية'].map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        const codes: Record<string, string> = { English: 'EN', Español: 'ES', Français: 'FR', 'العربية': 'AR' };
                        setLanguage(codes[l]); setShowLang(false);
                      }}
                      className="flex w-full items-center px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-emerald-500/10 transition-colors"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={onBookClick}
              className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2.5 text-sm font-semibold text-[#060D0B] shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-95"
            >
              <Calendar className="h-4 w-4" />
              Book Executive Slot
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden rounded-lg border border-white/10 p-2 text-white"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-3 rounded-2xl border border-emerald-500/15 bg-[#0A1411]/95 backdrop-blur-2xl p-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => { onBookClick(); setMobileOpen(false); }}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 text-sm font-semibold text-[#060D0B]"
              >
                <Calendar className="h-4 w-4" />
                Book Executive Slot
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
