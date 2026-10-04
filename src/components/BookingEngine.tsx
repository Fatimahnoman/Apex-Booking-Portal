import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Link2,
  Mail,
  Phone,
  Upload,
  User,
  Bitcoin,
  Building2,
} from 'lucide-react';
import { services, consultants, generateTimeSlots, generateReferenceId, type Service, type Consultant } from '@/lib/data';
import { supabase, type Booking } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

interface BookingEngineProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type PaymentMethod = 'Credit Card' | 'Instant Invoice' | 'Crypto Payment';

const steps = ['Service', 'Date & Time', 'Details', 'Confirmation'];

export function BookingEngine({ open, onClose, onComplete }: BookingEngineProps) {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>(typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [requirements, setRequirements] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Instant Invoice');
  const [bookingRef, setBookingRef] = useState('');
  const [savedBooking, setSavedBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { notify } = useToast();

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    const seed = selectedDate.getDate() + selectedDate.getMonth() * 31;
    return generateTimeSlots(seed);
  }, [selectedDate]);

  if (!open) return null;

  const reset = () => {
    setStep(0);
    setSelectedService(null);
    setSelectedConsultant(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setRequirements('');
    setFileName(null);
    setPaymentMethod('Instant Invoice');
    setBookingRef('');
    setSavedBooking(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canProceed = () => {
    if (step === 0) return selectedService && selectedConsultant;
    if (step === 1) return selectedDate && selectedSlot;
    if (step === 2) return clientName && clientEmail;
    return true;
  };

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    if (step === 2) {
      setSubmitting(true);
      const ref = generateReferenceId();
      setBookingRef(ref);
      notify('Calendar Event Syncing...', 'info');

      const bookingDateStr = selectedDate!.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          reference_id: ref,
          service_name: selectedService!.name,
          consultant: selectedConsultant!.name,
          duration: selectedService!.duration,
          price: selectedService!.price,
          booking_date: bookingDateStr,
          time_slot: selectedSlot!,
          timezone,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone || null,
          project_requirements: requirements || null,
          payment_method: paymentMethod,
          status: 'confirmed',
        })
        .select()
        .maybeSingle();

      if (error) {
        notify('Booking failed — please try again', 'error');
        setSubmitting(false);
        return;
      }

      setSavedBooking(data as Booking);
      notify('Slot Reserved for 10 minutes', 'success');
      setTimeout(() => notify('Invoice Generated', 'success'), 800);
      setTimeout(() => notify('Calendar Event Synced', 'success'), 1600);
      setStep(3);
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-emerald-500/20 bg-[#0A1411]/95 backdrop-blur-2xl shadow-2xl animate-modal-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0A1411]/90 backdrop-blur-xl px-6 py-4 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Executive Booking Engine</h2>
              <p className="text-xs text-white/40">Reserve your consultation in 4 steps</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg border border-white/10 p-2 text-white/60 hover:text-white hover:border-emerald-500/30 transition-all"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 ${
                      i < step
                        ? 'bg-emerald-400 text-[#060D0B] shadow-lg shadow-emerald-500/30'
                        : i === step
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-[#060D0B] shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/20'
                        : 'border border-white/15 bg-white/5 text-white/40'
                    }`}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${i <= step ? 'text-white/80' : 'text-white/30'}`}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                      style={{ width: i < step ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div key={step} className="animate-step-slide">
            {step === 0 && (
              <Step1Service
                services={services}
                consultants={consultants}
                selectedService={selectedService}
                setSelectedService={setSelectedService}
                selectedConsultant={selectedConsultant}
                setSelectedConsultant={setSelectedConsultant}
              />
            )}
            {step === 1 && (
              <Step2DateTime
                calendarMonth={calendarMonth}
                setCalendarMonth={setCalendarMonth}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                slots={slots}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                timezone={timezone}
                setTimezone={setTimezone}
              />
            )}
            {step === 2 && (
              <Step3Details
                clientName={clientName}
                setClientName={setClientName}
                clientEmail={clientEmail}
                setClientEmail={setClientEmail}
                clientPhone={clientPhone}
                setClientPhone={setClientPhone}
                requirements={requirements}
                setRequirements={setRequirements}
                fileName={fileName}
                setFileName={setFileName}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
            )}
            {step === 3 && savedBooking && (
              <Step4Confirmation
                booking={savedBooking}
                service={selectedService!}
                consultant={selectedConsultant!}
                date={selectedDate!}
                slot={selectedSlot!}
                timezone={timezone}
                paymentMethod={paymentMethod}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        {step < 3 && (
          <div className="sticky bottom-0 flex items-center justify-between border-t border-white/10 bg-[#0A1411]/90 backdrop-blur-xl px-6 py-4 rounded-b-3xl">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                step === 0
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-white/70 hover:text-white border border-white/10 hover:border-emerald-500/30'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || submitting}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                canProceed() && !submitting
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-[#060D0B] shadow-lg shadow-emerald-500/25 hover:scale-[1.03] active:scale-95'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-[#060D0B]/30 border-t-[#060D0B] rounded-full animate-spin" />
                  Processing...
                </>
              ) : step === 2 ? (
                <>
                  Confirm & Generate Invoice
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="sticky bottom-0 flex items-center justify-center gap-3 border-t border-white/10 bg-[#0A1411]/90 backdrop-blur-xl px-6 py-4 rounded-b-3xl">
            <button
              onClick={() => { onComplete(); reset(); }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-2.5 text-sm font-semibold text-[#060D0B] shadow-lg shadow-emerald-500/25 hover:scale-[1.03] active:scale-95 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              Done
            </button>
            <button
              onClick={() => { reset(); }}
              className="flex items-center gap-2 rounded-xl border border-white/15 px-6 py-2.5 text-sm font-semibold text-white hover:border-emerald-500/30 transition-all"
            >
              Book Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const commonTimezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Moscow',
  'Africa/Lagos',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
];

// ─── Step 1 ──────────────────────────────────────────────────────────────

function Step1Service({
  services,
  consultants,
  selectedService,
  setSelectedService,
  selectedConsultant,
  setSelectedConsultant,
}: {
  services: Service[];
  consultants: Consultant[];
  selectedService: Service | null;
  setSelectedService: (s: Service) => void;
  selectedConsultant: Consultant | null;
  setSelectedConsultant: (c: Consultant) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-1">Select Your Service</h3>
      <p className="text-sm text-white/40 mb-5">Choose a consultation type to begin</p>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;
          return (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`group text-left rounded-2xl border p-4 transition-all duration-300 ${
                isSelected
                  ? 'border-emerald-400/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                  : 'border-white/10 bg-white/5 hover:border-emerald-500/30 hover:bg-white/8'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs font-medium text-emerald-400 mb-1">{service.category}</div>
                  <div className="text-sm font-bold text-white">{service.name}</div>
                </div>
                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400">
                    <Check className="h-3 w-3 text-[#060D0B]" />
                  </div>
                )}
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-3">{service.description}</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <Clock className="h-3 w-3" /> {service.duration} min
                </span>
                <span className="text-xs font-bold text-emerald-400">${service.price}</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedService && (
        <div className="animate-fade-in">
          <h4 className="text-sm font-bold text-white mb-3">Choose Your Specialist</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {consultants.map((consultant) => {
              const isSelected = selectedConsultant?.id === consultant.id;
              const compatible = consultant.specialties.includes(selectedService.category);
              if (!compatible) return null;
              return (
                <button
                  key={consultant.id}
                  onClick={() => setSelectedConsultant(consultant)}
                  disabled={!consultant.available}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300 ${
                    isSelected
                      ? 'border-emerald-400/50 bg-emerald-500/10'
                      : consultant.available
                      ? 'border-white/10 bg-white/5 hover:border-emerald-500/30'
                      : 'border-white/5 bg-white/3 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${consultant.avatarGradient} text-sm font-bold text-white shrink-0`}>
                    {consultant.initials}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{consultant.name}</div>
                    <div className="text-xs text-white/40 truncate">{consultant.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-amber-400 text-xs">★ {consultant.rating}</span>
                      <span className={`text-xs ${consultant.available ? 'text-emerald-400' : 'text-white/30'}`}>
                        {consultant.available ? 'Available now' : 'Booked'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2 ──────────────────────────────────────────────────────────────

function Step2DateTime({
  calendarMonth,
  setCalendarMonth,
  selectedDate,
  setSelectedDate,
  slots,
  selectedSlot,
  setSelectedSlot,
  timezone,
  setTimezone,
}: {
  calendarMonth: Date;
  setCalendarMonth: (d: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (d: Date) => void;
  slots: ReturnType<typeof generateTimeSlots>;
  selectedSlot: string | null;
  setSelectedSlot: (s: string) => void;
  timezone: string;
  setTimezone: (s: string) => void;
}) {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthName = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  const isDateAvailable = (date: Date) => {
    const past = date < today;
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    return !past && !weekend;
  };

  const periods: Array<'Morning' | 'Afternoon' | 'Evening'> = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-1">Pick Date & Time</h3>
      <p className="text-sm text-white/40 mb-5">Select an available slot from the calendar</p>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Calendar */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
              className="rounded-lg border border-white/10 p-1.5 text-white/60 hover:text-white hover:border-emerald-500/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-white">{monthName}</span>
            <button
              onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
              className="rounded-lg border border-white/10 p-1.5 text-white/60 hover:text-white hover:border-emerald-500/30 transition-all"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs font-medium text-white/30 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              if (!date) return <div key={i} />;
              const available = isDateAvailable(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday = today.toDateString() === date.toDateString();
              return (
                <button
                  key={i}
                  disabled={!available}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-[#060D0B] shadow-lg shadow-emerald-500/30'
                      : available
                      ? 'text-white/70 hover:bg-emerald-500/15 hover:text-white border border-white/5'
                      : 'text-white/15 cursor-not-allowed'
                  } ${isToday && !isSelected ? 'ring-1 ring-cyan-500/40' : ''}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Timezone */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <label className="text-xs font-medium text-white/40 mb-1.5 block">Timezone (auto-detected)</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0A1411] px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
            >
              {commonTimezones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Time slots */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          {selectedDate ? (
            <>
              <div className="mb-4">
                <div className="text-xs font-medium text-white/40 uppercase">Available Times</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {periods.map((period) => {
                  const periodSlots = slots.filter((s) => s.period === period);
                  if (periodSlots.length === 0) return null;
                  return (
                    <div key={period}>
                      <div className="text-xs font-medium text-white/40 uppercase mb-2">{period}</div>
                      <div className="grid grid-cols-3 gap-2">
                        {periodSlots.map((slot) => {
                          const isSelected = selectedSlot === slot.label;
                          const isBooked = slot.status === 'booked';
                          const isRecommended = slot.status === 'recommended';
                          return (
                            <button
                              key={slot.label}
                              disabled={isBooked}
                              onClick={() => setSelectedSlot(slot.label)}
                              className={`relative rounded-lg px-2 py-2.5 text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-emerald-400 text-[#060D0B] shadow-lg shadow-emerald-500/30'
                                  : isBooked
                                  ? 'bg-white/3 text-white/20 cursor-not-allowed line-through'
                                  : isRecommended
                                  ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                                  : 'border border-white/10 bg-white/5 text-white/70 hover:border-emerald-500/30 hover:bg-emerald-500/10'
                              }`}
                            >
                              {slot.label}
                              {isRecommended && !isSelected && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                                  <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
                                  <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Calendar className="h-10 w-10 text-white/20 mb-3" />
              <p className="text-sm text-white/40">Select a date from the calendar to view available time slots</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 ──────────────────────────────────────────────────────────────

function Step3Details({
  clientName,
  setClientName,
  clientEmail,
  setClientEmail,
  clientPhone,
  setClientPhone,
  requirements,
  setRequirements,
  fileName,
  setFileName,
  paymentMethod,
  setPaymentMethod,
}: {
  clientName: string;
  setClientName: (s: string) => void;
  clientEmail: string;
  setClientEmail: (s: string) => void;
  clientPhone: string;
  setClientPhone: (s: string) => void;
  requirements: string;
  setRequirements: (s: string) => void;
  fileName: string | null;
  setFileName: (s: string | null) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
}) {
  const payments: { method: PaymentMethod; icon: typeof CreditCard; label: string }[] = [
    { method: 'Credit Card', icon: CreditCard, label: 'Credit Card' },
    { method: 'Instant Invoice', icon: FileText, label: 'Instant Invoice' },
    { method: 'Crypto Payment', icon: Bitcoin, label: 'Crypto Payment' },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-1">Your Details</h3>
      <p className="text-sm text-white/40 mb-5">Tell us about you and your project</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-white/50 mb-1.5 block">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 mb-1.5 block">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="john@company.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-white/50 mb-1.5 block">Phone / WhatsApp</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-white/50 mb-1.5 block">Project Requirements</label>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={3}
          placeholder="Brief description of what you'd like to discuss..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors resize-none"
        />
      </div>

      <div className="mb-5">
        <label className="text-xs font-medium text-white/50 mb-1.5 block">Attach File / Brief</label>
        <label className="flex items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-3 cursor-pointer hover:border-emerald-500/30 transition-colors">
          <Upload className="h-4 w-4 text-white/40" />
          <span className="text-sm text-white/50 flex-1">
            {fileName || 'Click to upload a brief or document'}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
          />
        </label>
      </div>

      <div>
        <label className="text-xs font-medium text-white/50 mb-2 block">Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          {payments.map(({ method, icon: Icon, label }) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                paymentMethod === method
                  ? 'border-emerald-400/50 bg-emerald-500/10 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-emerald-500/30'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 ──────────────────────────────────────────────────────────────

function Step4Confirmation({
  booking,
  service,
  consultant,
  date,
  slot,
  timezone,
  paymentMethod,
}: {
  booking: Booking;
  service: Service;
  consultant: Consultant;
  date: Date;
  slot: string;
  timezone: string;
  paymentMethod: PaymentMethod;
}) {
  const total = service.price;
  const tax = total * 0.0;
  const grandTotal = total + tax;

  return (
    <div>
      {/* Confetti */}
      <ConfettiBurst />

      {/* Checkmark */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/40 animate-bounce-in">
          <Check className="h-10 w-10 text-[#060D0B]" strokeWidth={3} />
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl animate-pulse" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Booking Confirmed!</h3>
        <p className="text-sm text-white/40 mt-1">
          Reference ID: <span className="font-mono font-bold text-emerald-400">#{booking.reference_id}</span>
        </p>
      </div>

      {/* Digital Receipt */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">Digital Receipt</span>
          </div>
          <span className="text-xs font-mono text-white/40">#{booking.reference_id}</span>
        </div>

        <div className="space-y-2.5 text-sm">
          <ReceiptRow label="Service" value={service.name} />
          <ReceiptRow label="Specialist" value={consultant.name} />
          <ReceiptRow label="Date" value={date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} />
          <ReceiptRow label="Time" value={`${slot} (${timezone})`} />
          <ReceiptRow label="Duration" value={`${service.duration} minutes`} />
          <ReceiptRow label="Payment" value={paymentMethod} />
        </div>

        <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Session Fee</span>
            <span className="text-white font-medium">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Tax</span>
            <span className="text-white font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10">
            <span className="text-white">Total</span>
            <span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Calendar buttons */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
          <Calendar className="h-4 w-4 text-emerald-400" />
          Add to Google Calendar
        </button>
        <button className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
          <Link2 className="h-4 w-4 text-cyan-400" />
          Add to Outlook
        </button>
      </div>

      {/* Download invoice */}
      <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 text-sm font-semibold text-[#060D0B] shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all">
        <Download className="h-4 w-4" />
        Download Invoice PDF
      </button>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/50">{label}</span>
      <span className="text-white font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

// ─── Confetti ────────────────────────────────────────────────────────────

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1 + Math.random() * 1.5,
        rotation: Math.random() * 360,
        color: ['#10B981', '#06B6D4', '#34D399', '#2DD4BF', '#FBBF24'][i % 5],
        size: 4 + Math.random() * 6,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[160] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: p.id % 2 === 0 ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
