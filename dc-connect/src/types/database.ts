// ============================================================
// DC-Connect: Core TypeScript types matching the Supabase schema
// ============================================================

export type UserRole = "worker" | "builder";

export type TradeType =
  | "Electrical"
  | "HVAC"
  | "Low Voltage"
  | "Fiber Optic"
  | "Concrete"
  | "General Labor";

export type SecurityClearance = "None" | "Public Trust" | "Secret";

export type ShiftSchedule = "Day" | "Night" | "Swing";

export type ApplicationStatus = "applied" | "vetting" | "accepted" | "rejected";

export type CheckinStatus = "pending" | "checked_in" | "checked_out";

// ---------- Row Types ----------

export interface User {
  id: string;
  auth_id: string;
  role: UserRole;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  full_name: string;
  profile_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  trade_type: TradeType;
  security_clearance_level: SecurityClearance;
  certifications: Certification[];
  hourly_rate: number;
  years_experience: number;
  bio: string | null;
  geo_lat: number | null;
  geo_lng: number | null;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  name: string;
  url: string;
  expires_at: string | null;
}

export interface Project {
  id: string;
  builder_id: string;
  site_name: string;
  site_address: string | null;
  security_level_required: SecurityClearance;
  geo_lat: number;
  geo_lng: number;
  geofence_radius_m: number;
  start_date: string;
  end_date: string | null;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Gig {
  id: string;
  project_id: string;
  trade_needed: TradeType;
  count_needed: number;
  hourly_rate_offered: number;
  shift_schedule: ShiftSchedule;
  description: string | null;
  filled: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  worker_id: string;
  gig_id: string;
  status: ApplicationStatus;
  checkin_status: CheckinStatus;
  applied_at: string;
  updated_at: string;
}

// ---------- Joined / View Types ----------

/** Gig with its parent project data — used for the worker marketplace feed. */
export interface GigWithProject extends Gig {
  project: Pick<
    Project,
    | "site_name"
    | "site_address"
    | "security_level_required"
    | "geo_lat"
    | "geo_lng"
    | "builder_id"
  >;
}
