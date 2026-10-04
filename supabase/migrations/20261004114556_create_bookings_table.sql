/*
# Create bookings table for APEX RESERVE (single-tenant, no auth)

1. New Tables
- `bookings`
  - `id` (uuid, primary key)
  - `reference_id` (text, unique — human-readable booking ref like #APX-9842)
  - `service_name` (text — e.g. "Executive Strategy Audit")
  - `consultant` (text — consultant name)
  - `duration` (int — minutes)
  - `price` (numeric — session price)
  - `booking_date` (date — selected date)
  - `time_slot` (text — e.g. "10:00 AM")
  - `timezone` (text — user timezone)
  - `client_name` (text)
  - `client_email` (text)
  - `client_phone` (text)
  - `project_requirements` (text)
  - `payment_method` (text — "Credit Card" | "Instant Invoice" | "Crypto Payment")
  - `status` (text — "confirmed" | "pending" | "cancelled")
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `bookings`.
- Allow anon + authenticated CRUD — this is a single-tenant demo app with no sign-in,
  so all data is intentionally public/shared.
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text UNIQUE NOT NULL,
  service_name text NOT NULL,
  consultant text NOT NULL,
  duration int NOT NULL,
  price numeric(10,2) NOT NULL,
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  timezone text NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  project_requirements text,
  payment_method text NOT NULL DEFAULT 'Instant Invoice',
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference_id);
