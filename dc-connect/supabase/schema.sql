-- ============================================================
-- DC-Connect: Complete PostgreSQL Schema for Supabase
-- ============================================================
-- Run this in the Supabase SQL Editor to bootstrap the database.
-- Requires: pgcrypto (enabled by default), PostGIS optional for
--           advanced geo queries later.
-- ============================================================

-- ---------- ENUMS ----------

CREATE TYPE user_role AS ENUM ('worker', 'builder');

CREATE TYPE trade_type AS ENUM (
  'Electrical',
  'HVAC',
  'Low Voltage',
  'Fiber Optic',
  'Concrete',
  'General Labor'
);

CREATE TYPE security_clearance AS ENUM (
  'None',
  'Public Trust',
  'Secret'
);

CREATE TYPE shift_schedule AS ENUM ('Day', 'Night', 'Swing');

CREATE TYPE application_status AS ENUM (
  'applied',
  'vetting',
  'accepted',
  'rejected'
);

CREATE TYPE checkin_status AS ENUM (
  'pending',
  'checked_in',
  'checked_out'
);

-- ---------- USERS ----------

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE NOT NULL,           -- maps to supabase auth.users.id
  role          user_role NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,                            -- critical for workers
  avatar_url    TEXT,
  full_name     TEXT NOT NULL,
  profile_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_auth_id ON users (auth_id);

-- ---------- WORKER PROFILES ----------

CREATE TABLE worker_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trade_type        trade_type NOT NULL,
  security_clearance_level security_clearance NOT NULL DEFAULT 'None',
  certifications    JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- certifications schema: [{ "name": "OSHA 30", "url": "...", "expires_at": "..." }]
  hourly_rate       NUMERIC(8,2) NOT NULL DEFAULT 0,
  years_experience  INTEGER NOT NULL DEFAULT 0,
  bio               TEXT,
  geo_lat           DOUBLE PRECISION,
  geo_lng           DOUBLE PRECISION,
  available         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_worker_profiles_trade ON worker_profiles (trade_type);
CREATE INDEX idx_worker_profiles_clearance ON worker_profiles (security_clearance_level);
CREATE INDEX idx_worker_profiles_geo ON worker_profiles (geo_lat, geo_lng);

-- ---------- PROJECTS ----------

CREATE TABLE projects (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_name             TEXT NOT NULL,
  site_address          TEXT,
  security_level_required security_clearance NOT NULL DEFAULT 'None',
  geo_lat               DOUBLE PRECISION NOT NULL,
  geo_lng               DOUBLE PRECISION NOT NULL,
  geofence_radius_m     INTEGER NOT NULL DEFAULT 200,  -- meters for clock-in geofence
  start_date            DATE NOT NULL,
  end_date              DATE,
  description           TEXT,
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_builder ON projects (builder_id);
CREATE INDEX idx_projects_active ON projects (active) WHERE active = TRUE;

-- ---------- GIGS ----------

CREATE TABLE gigs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  trade_needed      trade_type NOT NULL,
  count_needed      INTEGER NOT NULL DEFAULT 1,
  hourly_rate_offered NUMERIC(8,2) NOT NULL,
  shift_schedule    shift_schedule NOT NULL DEFAULT 'Day',
  description       TEXT,
  filled            BOOLEAN NOT NULL DEFAULT FALSE,
  start_date        DATE NOT NULL,
  end_date          DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gigs_project ON gigs (project_id);
CREATE INDEX idx_gigs_trade ON gigs (trade_needed);
CREATE INDEX idx_gigs_filled ON gigs (filled) WHERE filled = FALSE;

-- ---------- APPLICATIONS ----------

CREATE TABLE applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gig_id          UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  status          application_status NOT NULL DEFAULT 'applied',
  checkin_status  checkin_status NOT NULL DEFAULT 'pending',
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, gig_id)   -- one application per worker per gig
);

CREATE INDEX idx_applications_worker ON applications (worker_id);
CREATE INDEX idx_applications_gig ON applications (gig_id);
CREATE INDEX idx_applications_status ON applications (status);

-- ---------- UPDATED_AT TRIGGER ----------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_worker_profiles_updated_at
  BEFORE UPDATE ON worker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_gigs_updated_at
  BEFORE UPDATE ON gigs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------- ROW LEVEL SECURITY ----------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users can read their own row; builders can read worker profiles
CREATE POLICY "Users read own" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users update own" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Workers can read/update their own profile
CREATE POLICY "Worker read own profile" ON worker_profiles
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Worker update own profile" ON worker_profiles
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Builders can view worker profiles (for matching)
CREATE POLICY "Builder read worker profiles" ON worker_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'builder')
  );

-- Gigs are publicly readable (workers need to browse)
CREATE POLICY "Gigs public read" ON gigs
  FOR SELECT USING (TRUE);

-- Only builders can insert/update their own project's gigs
CREATE POLICY "Builder manage gigs" ON gigs
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.id = p.builder_id
      WHERE u.auth_id = auth.uid()
    )
  );

-- Projects are publicly readable
CREATE POLICY "Projects public read" ON projects
  FOR SELECT USING (TRUE);

-- Builders manage their own projects
CREATE POLICY "Builder manage projects" ON projects
  FOR ALL USING (
    builder_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Workers manage their own applications
CREATE POLICY "Worker manage applications" ON applications
  FOR ALL USING (
    worker_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Builders can view applications for their gigs
CREATE POLICY "Builder read applications" ON applications
  FOR SELECT USING (
    gig_id IN (
      SELECT g.id FROM gigs g
      JOIN projects p ON p.id = g.project_id
      JOIN users u ON u.id = p.builder_id
      WHERE u.auth_id = auth.uid()
    )
  );
