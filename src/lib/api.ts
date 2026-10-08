import { supabase, type Service, type Consultant, type Booking } from '@/lib/supabase';

export interface TimeSlot {
  time: string;
  label: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  status: 'available' | 'booked' | 'recommended';
}

const baseSlots = [
  { time: '08:00', label: '8:00 AM', period: 'Morning' as const },
  { time: '09:00', label: '9:00 AM', period: 'Morning' as const },
  { time: '10:00', label: '10:00 AM', period: 'Morning' as const },
  { time: '11:00', label: '11:00 AM', period: 'Morning' as const },
  { time: '12:00', label: '12:00 PM', period: 'Afternoon' as const },
  { time: '13:00', label: '1:00 PM', period: 'Afternoon' as const },
  { time: '14:00', label: '2:00 PM', period: 'Afternoon' as const },
  { time: '15:00', label: '3:00 PM', period: 'Afternoon' as const },
  { time: '16:00', label: '4:00 PM', period: 'Afternoon' as const },
  { time: '17:00', label: '5:00 PM', period: 'Evening' as const },
  { time: '18:00', label: '6:00 PM', period: 'Evening' as const },
  { time: '19:00', label: '7:00 PM', period: 'Evening' as const },
];

export const commonTimezones = [
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

export const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'AED', symbol: 'AED' },
];

export const languages = [
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Espanol' },
  { code: 'FR', label: 'Francais' },
  { code: 'AR', label: 'Arabic' },
];

export function generateReferenceId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `APX-${num}`;
}

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as Service[]) || [];
}

export async function fetchConsultants(): Promise<Consultant[]> {
  const { data, error } = await supabase
    .from('consultants')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as Consultant[]) || [];
}

export async function fetchAllServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as Service[]) || [];
}

export async function fetchAllConsultants(): Promise<Consultant[]> {
  const { data, error } = await supabase
    .from('consultants')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as Consultant[]) || [];
}

export async function fetchBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Booking[]) || [];
}

export async function fetchBookedSlots(date: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('booking_date', date)
    .neq('status', 'cancelled');
  if (error) throw error;
  return (data || []).map((b: { time_slot: string }) => b.time_slot);
}

export async function getAvailabilityForDate(date: Date): Promise<TimeSlot[]> {
  const dateStr = date.toISOString().split('T')[0];
  const bookedSlots = await fetchBookedSlots(dateStr);

  return baseSlots.map((slot) => {
    const isBooked = bookedSlots.includes(slot.label);
    let status: TimeSlot['status'] = 'available';
    if (isBooked) {
      status = 'booked';
    } else if (slot.period === 'Morning' && slot.time === '10:00') {
      status = 'recommended';
    } else if (slot.period === 'Afternoon' && slot.time === '14:00') {
      status = 'recommended';
    }
    return { ...slot, status };
  });
}

export async function uploadBriefFile(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const { error } = await supabase.storage
    .from('briefs')
    .upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from('briefs')
    .getPublicUrl(fileName);
  return urlData.publicUrl;
}

export async function createBooking(params: {
  reference_id: string;
  service_id: string;
  consultant_id: string;
  service_name: string;
  consultant: string;
  duration: number;
  price: number;
  booking_date: string;
  time_slot: string;
  timezone: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  project_requirements: string | null;
  file_url: string | null;
  payment_method: string;
}): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      reference_id: params.reference_id,
      service_id: params.service_id,
      consultant_id: params.consultant_id,
      service_name: params.service_name,
      consultant: params.consultant,
      duration: params.duration,
      price: params.price,
      booking_date: params.booking_date,
      time_slot: params.time_slot,
      timezone: params.timezone,
      client_name: params.client_name,
      client_email: params.client_email,
      client_phone: params.client_phone,
      project_requirements: params.project_requirements,
      file_url: params.file_url,
      payment_method: params.payment_method,
      status: 'confirmed',
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Booking;
}

export async function updateBookingStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function rescheduleBooking(id: string, newDate: string, newSlot: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ booking_date: newDate, time_slot: newSlot })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw error;
}

export async function createService(service: Omit<Service, 'id' | 'created_at' | 'active'>): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert({ ...service, active: true })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Service;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<void> {
  const { error } = await supabase.from('services').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

export async function createConsultant(consultant: Omit<Consultant, 'id' | 'created_at'>): Promise<Consultant> {
  const { data, error } = await supabase
    .from('consultants')
    .insert(consultant)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Consultant;
}

export async function updateConsultant(id: string, updates: Partial<Consultant>): Promise<void> {
  const { error } = await supabase.from('consultants').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteConsultant(id: string): Promise<void> {
  const { error } = await supabase.from('consultants').delete().eq('id', id);
  if (error) throw error;
}

export function generateICSFile(booking: {
  reference_id: string;
  service_name: string;
  consultant: string;
  booking_date: string;
  time_slot: string;
  duration: number;
  timezone: string;
  client_name: string;
}): string {
  const dateStr = booking.booking_date;
  const timeMatch = booking.time_slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hour = 9;
  let minute = 0;
  if (timeMatch) {
    hour = parseInt(timeMatch[1]);
    minute = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
  }

  const startDate = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
  const endDate = new Date(startDate.getTime() + booking.duration * 60000);

  const formatICS = (d: Date) =>
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0') +
    'T' +
    String(d.getUTCHours()).padStart(2, '0') +
    String(d.getUTCMinutes()).padStart(2, '0') +
    '00Z';

  const dtStart = formatICS(startDate);
  const dtEnd = formatICS(endDate);
  const dtStamp = formatICS(new Date());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//APEX RESERVE//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.reference_id}@apexreserve.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${booking.service_name} with ${booking.consultant}`,
    `DESCRIPTION:Booking ${booking.reference_id}\\nClient: ${booking.client_name}\\nTimezone: ${booking.timezone}`,
    'LOCATION:Online Session',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function generateInvoicePDF(booking: {
  reference_id: string;
  service_name: string;
  consultant: string;
  booking_date: string;
  time_slot: string;
  timezone: string;
  duration: number;
  price: number;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  payment_method: string;
}): string {
  const date = new Date(booking.booking_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${booking.reference_id}</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #060D0B; color: #fff; padding: 40px; }
  .invoice { max-width: 600px; margin: 0 auto; background: #0A1411; border: 1px solid #10B981; border-radius: 16px; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 30px; }
  .logo { font-size: 22px; font-weight: bold; color: #10B981; }
  .ref { font-family: monospace; font-size: 14px; color: #999; }
  h1 { font-size: 28px; margin: 0 0 10px; }
  .subtitle { color: #888; font-size: 14px; margin-bottom: 30px; }
  .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
  .label { color: #888; }
  .value { color: #fff; font-weight: 500; text-align: right; max-width: 60%; }
  .total-section { margin-top: 24px; padding-top: 20px; border-top: 2px solid #10B981; }
  .total-row { display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; }
  .total-row .price { color: #10B981; }
  .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  .badge { display: inline-block; background: #10B981; color: #060D0B; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div class="logo">APEX RESERVE</div>
    <div class="ref">Invoice #${booking.reference_id}</div>
  </div>
  <h1>Booking Confirmation</h1>
  <p class="subtitle"><span class="badge">CONFIRMED</span> &nbsp; Thank you for your booking!</p>
  <div class="row"><span class="label">Service</span><span class="value">${booking.service_name}</span></div>
  <div class="row"><span class="label">Specialist</span><span class="value">${booking.consultant}</span></div>
  <div class="row"><span class="label">Date</span><span class="value">${date}</span></div>
  <div class="row"><span class="label">Time</span><span class="value">${booking.time_slot} (${booking.timezone})</span></div>
  <div class="row"><span class="label">Duration</span><span class="value">${booking.duration} minutes</span></div>
  <div class="row"><span class="label">Client</span><span class="value">${booking.client_name}</span></div>
  <div class="row"><span class="label">Email</span><span class="value">${booking.client_email}</span></div>
  ${booking.client_phone ? `<div class="row"><span class="label">Phone</span><span class="value">${booking.client_phone}</span></div>` : ''}
  <div class="row"><span class="label">Payment Method</span><span class="value">${booking.payment_method}</span></div>
  <div class="total-section">
    <div class="row"><span class="label">Session Fee</span><span class="value">$${booking.price.toFixed(2)}</span></div>
    <div class="row"><span class="label">Tax</span><span class="value">$0.00</span></div>
    <div class="total-row"><span>Total</span><span class="price">$${booking.price.toFixed(2)}</span></div>
  </div>
  <div class="footer">
    APEX RESERVE - Premium Concierge Scheduling<br/>
    Generated on ${new Date().toLocaleString()}<br/>
    This is a digitally generated invoice.
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
