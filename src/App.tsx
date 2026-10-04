import { useState } from 'react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ServicesSection, AvailabilitySection, IntegrationSection, ContactSection, Footer } from '@/components/Sections';
import { BookingEngine } from '@/components/BookingEngine';
import { ProviderView } from '@/components/ProviderView';
import { ToastProvider } from '@/components/Toast';
import { LayoutDashboard } from 'lucide-react';

function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('EN');

  const openBooking = () => setBookingOpen(true);
  const closeBooking = () => setBookingOpen(false);
  const openProvider = () => setProviderOpen(true);
  const closeProvider = () => setProviderOpen(false);

  return (
    <ToastProvider>
      <AnimatedBackground />

      <Navbar
        onBookClick={openBooking}
        currency={currency}
        setCurrency={setCurrency}
        language={language}
        setLanguage={setLanguage}
      />

      <main>
        <Hero onStartBooking={openBooking} onViewDemo={openProvider} />

        <ServicesSection onBookClick={openBooking} />

        <AvailabilitySection />

        <IntegrationSection />

        <ContactSection />
      </main>

      <Footer />

      {/* Floating Provider View toggle */}
      <button
        onClick={openProvider}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-[#0A1411]/80 backdrop-blur-2xl px-4 py-3 text-sm font-semibold text-white shadow-2xl hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all group"
      >
        <LayoutDashboard className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Switch to Provider View</span>
        <span className="sm:hidden">Provider</span>
      </button>

      {/* Modals */}
      <BookingEngine open={bookingOpen} onClose={closeBooking} onComplete={closeBooking} />
      <ProviderView open={providerOpen} onClose={closeProvider} />
    </ToastProvider>
  );
}

export default App;
