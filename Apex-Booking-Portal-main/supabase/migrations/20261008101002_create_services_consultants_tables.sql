/*
# Create services and consultants tables, add file_url to bookings, seed data

## Summary
Turns APEX RESERVE from a demo with hardcoded data into a fully functional app.
Services and consultants now live in the database and can be managed from the
Provider Dashboard. Bookings store an optional uploaded file URL. Data is seeded
from the existing hardcoded values so the app works immediately.

## New Tables
1. `services` — consultation services offered (name, description, duration, price, category, features array)
2. `consultants` — specialists (name, title, avatar gradient, initials, specialties array, availability, rating)

## Modified Tables
- `bookings` — adds `service_id` (FK to services), `consultant_id` (FK to consultants), `file_url` (text, nullable)

## Security
- RLS enabled on services and consultants, anon+authenticated CRUD (single-tenant, no auth)
- bookings policies already exist from previous migration; the new nullable columns
  don't require policy changes (RLS is row-level, not column-level)

## Seed Data
- 6 services matching the previous hardcoded values
- 6 consultants matching the previous hardcoded values
*/

-- ─── Services table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  duration int NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE
TO anon, authenticated USING (true);

-- ─── Consultants table ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS consultants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  avatar_gradient text NOT NULL DEFAULT 'from-emerald-400 to-teal-600',
  initials text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  available boolean NOT NULL DEFAULT true,
  rating numeric(2,1) NOT NULL DEFAULT 5.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_consultants" ON consultants;
CREATE POLICY "anon_select_consultants" ON consultants FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_consultants" ON consultants;
CREATE POLICY "anon_insert_consultants" ON consultants FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_consultants" ON consultants;
CREATE POLICY "anon_update_consultants" ON consultants FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_consultants" ON consultants;
CREATE POLICY "anon_delete_consultants" ON consultants FOR DELETE
TO anon, authenticated USING (true);

-- ─── Add columns to bookings ─────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'service_id') THEN
    ALTER TABLE bookings ADD COLUMN service_id uuid REFERENCES services(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'consultant_id') THEN
    ALTER TABLE bookings ADD COLUMN consultant_id uuid REFERENCES consultants(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'file_url') THEN
    ALTER TABLE bookings ADD COLUMN file_url text;
  END IF;
END $$;

-- ─── Seed services (only if table is empty) ──────────────────────────────

INSERT INTO services (name, description, duration, price, category, features)
SELECT * FROM (VALUES
  ('Executive Strategy Audit', 'Deep-dive analysis of your business strategy, market positioning, and growth roadmap with a senior partner.', 45, 250.00, 'Strategy', ARRAY['Market analysis','Growth roadmap','Competitor intelligence','90-day action plan']),
  ('AI Automation Consultation', 'Identify automation opportunities in your workflows and design an AI implementation blueprint.', 60, 350.00, 'AI & Automation', ARRAY['Workflow audit','AI opportunity map','Tool stack recommendations','Implementation timeline']),
  ('Full-Stack Architecture Review', 'Comprehensive technical architecture assessment covering scalability, security, and performance.', 90, 500.00, 'Engineering', ARRAY['System audit','Scalability assessment','Security review','Architecture blueprint']),
  ('Premium Brand Positioning', 'Craft a luxury brand narrative and positioning strategy that commands premium pricing.', 45, 300.00, 'Branding', ARRAY['Brand audit','Positioning framework','Voice & tone guide','Premium pricing strategy']),
  ('Growth Acceleration Session', 'Unlock exponential growth channels with a data-driven customer acquisition strategy.', 60, 400.00, 'Growth', ARRAY['Channel analysis','CAC optimization','Funnel design','Growth experiments']),
  ('Executive Coaching Session', 'One-on-one leadership coaching for C-suite executives navigating scaling challenges.', 50, 280.00, 'Leadership', ARRAY['Leadership assessment','Scaling strategy','Team dynamics','Personal roadmap'])
) AS t(name, description, duration, price, category, features)
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

-- ─── Seed consultants (only if table is empty) ───────────────────────────

INSERT INTO consultants (name, title, avatar_gradient, initials, specialties, available, rating)
SELECT * FROM (VALUES
  ('Marcus Chen', 'Senior Strategy Partner', 'from-emerald-400 to-teal-600', 'MC', ARRAY['Strategy','Growth'], true, 4.9),
  ('Sofia Almeida', 'AI & Automation Lead', 'from-cyan-400 to-blue-600', 'SA', ARRAY['AI & Automation','Engineering'], true, 5.0),
  ('James Whitfield', 'Principal Architect', 'from-teal-400 to-emerald-700', 'JW', ARRAY['Engineering'], false, 4.8),
  ('Amara Okonkwo', 'Brand Director', 'from-green-400 to-cyan-600', 'AO', ARRAY['Branding'], true, 4.9),
  ('David Reyes', 'Growth Partner', 'from-emerald-500 to-green-700', 'DR', ARRAY['Growth','Strategy'], true, 4.7),
  ('Elena Vossberg', 'Executive Coach', 'from-cyan-500 to-teal-700', 'EV', ARRAY['Leadership'], true, 5.0)
) AS t(name, title, avatar_gradient, initials, specialties, available, rating)
WHERE NOT EXISTS (SELECT 1 FROM consultants LIMIT 1);

-- ─── Indexes ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_consultant_id ON bookings(consultant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
