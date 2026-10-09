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
  const res = await fetch('/api/services?active=true');
  if (!res.ok) throw new Error('Failed to fetch services');
  return (await res.json()) as Service[];
}

export async function fetchConsultants(): Promise<Consultant[]> {
  const res = await fetch('/api/consultants');
  if (!res.ok) throw new Error('Failed to fetch consultants');
  return (await res.json()) as Consultant[];
}

export async function fetchAllServices(): Promise<Service[]> {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to fetch services');
  return (await res.json()) as Service[];
}

export async function fetchAllConsultants(): Promise<Consultant[]> {
  const res = await fetch('/api/consultants');
  if (!res.ok) throw new Error('Failed to fetch consultants');
  return (await res.json()) as Consultant[];
}

export async function fetchBookings(): Promise<Booking[]> {
  const res = await fetch('/api/bookings');
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return (await res.json()) as Booking[];
}

export async function fetchBookedSlots(date: string): Promise<string[]> {
  const res = await fetch(`/api/booked-slots?date=${encodeURIComponent(date)}`);
  if (!res.ok) throw new Error('Failed to fetch booked slots');
  return (await res.json()) as string[];
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

export async function createBooking(params: {
  reference_id: string;
  service_id: string | null;
  consultant_id: string | null;
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
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      status: 'confirmed',
    }),
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return (await res.json()) as Booking;
}

export async function updateBookingStatus(id: string, status: string): Promise<void> {
  const res = await fetch('/api/bookings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
  if (!res.ok) throw new Error('Failed to update booking');
}

export async function rescheduleBooking(id: string, newDate: string, newSlot: string): Promise<void> {
  const res = await fetch('/api/bookings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, booking_date: newDate, time_slot: newSlot }),
  });
  if (!res.ok) throw new Error('Failed to update booking');
}

export async function deleteBooking(id: string): Promise<void> {
  const res = await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete booking');
}

export async function createService(service: Omit<Service, 'id' | 'created_at' | 'active'>): Promise<Service> {
  const res = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...service, active: true }),
  });
  if (!res.ok) throw new Error('Failed to create service');
  return (await res.json()) as Service;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<void> {
  const res = await fetch('/api/services', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error('Failed to update service');
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`/api/services?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete service');
}

export async function createConsultant(consultant: Omit<Consultant, 'id' | 'created_at'>): Promise<Consultant> {
  const res = await fetch('/api/consultants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consultant),
  });
  if (!res.ok) throw new Error('Failed to create consultant');
  return (await res.json()) as Consultant;
}

export async function updateConsultant(id: string, updates: Partial<Consultant>): Promise<void> {
  const res = await fetch('/api/consultants', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error('Failed to update consultant');
}

export async function deleteConsultant(id: string): Promise<void> {
  const res = await fetch(`/api/consultants?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete consultant');
}

export async function generateInvoice(booking: Booking): Promise<Blob> {
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .invoice-details { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
          .total { text-align: right; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Apex Consulting</h1>
          <p>Invoice</p>
        </div>
        <div class="invoice-details">
          <p><strong>Invoice ID:</strong> ${booking.reference_id}</p>
          <p><strong>Date:</strong> ${new Date(booking.created_at).toLocaleDateString()}</p>
          <p><strong>Client:</strong> ${booking.client_name}</p>
          <p><strong>Email:</strong> ${booking.client_email}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Consultant</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${booking.service_name}</td>
              <td>${booking.consultant}</td>
              <td>${booking.booking_date}</td>
              <td>${booking.time_slot}</td>
              <td>${booking.duration} min</td>
              <td>$${booking.price}</td>
            </tr>
          </tbody>
        </table>
        <div class="total">
          <p>Total: $${booking.price}</p>
        </div>
      </body>
    </html>
  `;
  return new Blob([html], { type: 'text/html' });
}

export function downloadInvoice(booking: Booking): void {
  generateInvoice(booking).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${booking.reference_id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

export async function generateICS(booking: Booking): Promise<string> {
  const startDate = new Date(`${booking.booking_date}T${booking.time_slot}:00`);
  const endDate = new Date(startDate.getTime() + booking.duration * 60000);
  
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apex Consulting//EN
BEGIN:VEVENT
UID:${booking.reference_id}@apexconsulting.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${booking.service_name}
DESCRIPTION:Consultation with ${booking.consultant}
LOCATION:Online
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
  
  return ics;
}

export function downloadICS(booking: Booking): void {
  generateICS(booking).then((ics) => {
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointment-${booking.reference_id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

export async function uploadBriefFile(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('briefs')
    .upload(filePath, file);

  if (error) throw error;
  if (!data) throw new Error('No data returned from upload');

  const { data: urlData } = supabase.storage
    .from('briefs')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}