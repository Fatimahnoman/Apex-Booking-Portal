import { useEffect, useMemo, useState } from 'react';
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
  Loader2,
  Mail,
  Phone,
  Upload,
  User,
  Bitcoin,
  Building2,
  X,
} from 'lucide-react';
import {
  type Service,
  type Consultant,
  type Booking,
} from '@/lib/supabase';
import {
  fetchServices,
  fetchConsultants,
  getAvailabilityForDate,
  uploadBriefFile,
  createBooking,
  generateReferenceId,
  generateICS,
  downloadICS,
  generateInvoice,
  downloadInvoice,
  commonTimezones,
  type TimeSlot,
} from '@/lib/api';
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
  const [services, setServices] = useState<Service[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>(
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
  );
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [requirements, setRequirements] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Instant Invoice');
  const [savedBooking, setSavedBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { notify } = useToast();

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoadingData(true);
      try {
        const [svc, cons] = await Promise.all([fetchServices(), fetchConsultants()]);
        setServices(svc);
        setConsultants(cons);
      } catch {
        notify('Failed to load services', 'error');
      }
      setLoadingData(false);
    })();
  }, [open, notify]);

  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    let cancelled = false;
    (async () => {
      try {
        const result = await getAvailabilityForDate(selectedDate);
        if (!cancelled) setSlots(result);
      } catch {
        if (!cancelled) notify('Failed to load availability', 'error');
      }
      if (!cancelled) setLoadingSlots(false);
    })();
    return () => { cancelled = true; };
  }, [selectedDate, notify]);

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
    setSelectedFile(null);
    setPaymentMethod('Instant Invoice');
    setSavedBooking(null);
    setSlots([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canProceed = () => {
    if (step === 0) return selectedService && selectedConsultant;
    if (step === 1) return selectedDate && selectedSlot;
    if (step === 2) return clientName.trim() && clientEmail.trim();
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
      notify('Reserving your slot...', 'info');

      const bookingDateStr = selectedDate!.toISOString().split('T')[0];

      let fileUrl: string | null = null;
      if (selectedFile) {
        try {
          fileUrl = await uploadBriefFile(selectedFile);
          notify('File uploaded', 'success');
        } catch {
          notify('File upload failed — continuing without attachment', 'warning');
        }
      }

      try {
        const booking = await createBooking({
          reference_id: ref,
          service_id: selectedService!.id,
          consultant_id: selectedConsultant!.id,
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
          file_url: fileUrl,
          payment_method: paymentMethod,
        });

        setSavedBooking(booking);
        notify('Slot Reserved successfully', 'success');
        setTimeout(() => notify('Invoice Generated', 'success'), 600);
        setTimeout(() => notify('Calendar Event Ready', 'success'), 1200);
        setStep(3);
      } catch {
        notify('Booking failed — please try again', 'error');
      }
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleDownloadICS = () => {
    if (!savedBooking) return;
    downloadICS(savedBooking);
    notify('Calendar file downloaded', 'success');
  };

  const handleDownloadInvoice = () => {
    if (!savedBooking) return;
    downloadInvoice(savedBooking);
    notify('Invoice downloaded', 'success');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" onClick={handleClose} />

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
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress */}
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
          {loadingData && step === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-sm text-white/40">Loading services...</p>
            </div>
          ) : (
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
                  loadingSlots={loadingSlots}
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
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
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
                  onDownloadICS={handleDownloadICS}
                  onDownloadInvoice={handleDownloadInvoice}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 3 && !loadingData && (
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
                  <Loader2 className="h-4 w-4 animate-spin" />
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
              onClick={() => reset()}
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

// ─── Step 1: Service & Specialist ─────────────────────────────────────────

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

      <div className="grid sm:grid-cols-2 gap-3 mb-6 max-h-[280px] overflow-y-auto pr-1">
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
              <p className="text-xs text-white/50 leading-relaxed mb-3 line-clamp-2">{service.description}</p>
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
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${consultant.avatar_gradient} text-sm font-bold text-white shrink-0`}>
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
            {consultants.filter((c) => c.specialties.includes(selectedService.category)).length === 0 && (
              <p className="text-sm text-white/40 col-span-2">No specialists available for this category yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Date & Time ──────────────────────────────────────────────────

function Step2DateTime({
  calendarMonth,
  setCalendarMonth,
  selectedDate,
  setSelectedDate,
  slots,
  loadingSlots,
  selectedSlot,
  setSelectedSlot,
  timezone,
  setTimezone,
}: {
  calendarMonth: Date;
  setCalendarMonth: (d: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (d: Date) => void;
  slots: TimeSlot[];
  loadingSlots: boolean;
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
      <p className="text-sm text-white/40 mb-5">Select an available slot — booked times are shown in real-time</p>

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
            loadingSlots ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <Loader2 className="h-6 w-6 text-emerald-400 animate-spin mb-2" />
                <p className="text-xs text-white/40">Loading real-time availability...</p>
              </div>
            ) : (
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
            )
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

// ─── Step 3: Details ──────────────────────────────────────────────────────

function Step3Details({
  clientName,
  setClientName,
  clientEmail,
  setClientEmail,
  clientPhone,
  setClientPhone,
  requirements,
  setRequirements,
  selectedFile,
  setSelectedFile,
  paymentMethod,
  setPaymentMethod,
  selectedService,
  selectedDate,
  selectedSlot,
}: {
  clientName: string;
  setClientName: (s: string) => void;
  clientEmail: string;
  setClientEmail: (s: string) => void;
  clientPhone: string;
  setClientPhone: (s: string) => void;
  requirements: string;
  setRequirements: (s: string) => void;
  selectedFile: File | null;
  setSelectedFile: (f: File | null) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedSlot: string | null;
}) {
  const payments: { method: PaymentMethod; icon: typeof CreditCard; label: string }[] = [
    { method: 'Credit Card', icon: CreditCard, label: 'Credit Card' },
    { method: 'Instant Invoice', icon: FileText, label: 'Instant Invoice' },
    { method: 'Crypto Payment', icon: Bitcoin, label: 'Crypto' },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-1">Your Details</h3>
      <p className="text-sm text-white/40 mb-5">Tell us about you and your project</p>

      {/* Summary */}
      {selectedService && selectedDate && selectedSlot && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 mb-4 flex items-center gap-3 text-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-white/70">
            <span className="font-semibold text-white">{selectedService.name}</span> — {' '}
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedSlot} — {' '}
            <span className="text-emerald-400 font-bold">${selectedService.price}</span>
          </span>
        </div>
      )}

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
          <span className="text-sm text-white/50 flex-1 truncate">
            {selectedFile ? selectedFile.name : 'Click to upload a brief or document (PDF, DOC, images)'}
          </span>
          {selectedFile && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
              className="text-white/40 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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

// ─── Step 4: Confirmation ─────────────────────────────────────────────────

function Step4Confirmation({
  booking,
  service,
  consultant,
  date,
  slot,
  timezone,
  paymentMethod,
  onDownloadICS,
  onDownloadInvoice,
}: {
  booking: Booking;
  service: Service;
  consultant: Consultant;
  date: Date;
  slot: string;
  timezone: string;
  paymentMethod: PaymentMethod;
  onDownloadICS: () => void;
  onDownloadInvoice: () => void;
}) {
  const total = Number(booking.price);

  return (
    <div>
      <ConfettiBurst />

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
          {booking.file_url && <ReceiptRow label="Attachment" value="Uploaded" />}
        </div>

        <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Session Fee</span>
            <span className="text-white font-medium">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Tax</span>
            <span className="text-white font-medium">$0.00</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10">
            <span className="text-white">Total</span>
            <span className="text-emerald-400">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Calendar download buttons */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          onClick={onDownloadICS}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
        >
          <Calendar className="h-4 w-4 text-emerald-400" />
          Download .ics File
        </button>
        <button
          onClick={onDownloadICS}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
        >
          <Link2 className="h-4 w-4 text-cyan-400" />
          Add to Calendar
        </button>
      </div>

      <button
        onClick={onDownloadInvoice}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 text-sm font-semibold text-[#060D0B] shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all"
      >
        <Download className="h-4 w-4" />
        Download Invoice
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
