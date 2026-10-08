import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  features: string[];
  active: boolean;
  created_at: string;
}

export interface Consultant {
  id: string;
  name: string;
  title: string;
  avatar_gradient: string;
  initials: string;
  specialties: string[];
  available: boolean;
  rating: number;
  created_at: string;
}

export interface Booking {
  id: string;
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
  status: string;
  created_at: string;
}
