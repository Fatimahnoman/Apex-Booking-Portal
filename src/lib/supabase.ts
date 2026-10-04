import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Booking {
  id: string;
  reference_id: string;
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
  payment_method: string;
  status: string;
  created_at: string;
}
