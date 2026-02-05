# CLAUDE.md — DC-Connect

This file provides guidance for AI assistants (Claude, Copilot, etc.) working in this repository.

## Project Overview

**DC-Connect** is a specialized gig-marketplace web application connecting skilled blue-collar workers (electricians, HVAC techs, fiber optic splicers, general labor) with **Data Center Construction Projects**. It removes the middleman, allowing Data Center Project Managers to instantly source vetted labor, and workers to find high-paying industrial gigs.

**Design ethos:** Industrial, high-contrast, robust, extremely fast. "Uber for Construction" meets "military-grade logistics." Must feel trustworthy to a PM at Google/AWS and accessible to a tradesman on a job site.

## Tech Stack (Strict — do not deviate)

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Framework        | Next.js 14 (App Router)             |
| Language         | TypeScript (strict mode)            |
| Styling          | Tailwind CSS + Shadcn/UI            |
| Backend/Auth/DB  | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| State Management | Zustand                             |
| Maps/Location    | Mapbox GL JS (or Leaflet for MVP)   |
| Icons            | Lucide React                        |

## Codebase Structure

```
Blue-Collar-Data-/
├── CLAUDE.md                          # AI assistant guidance (this file)
└── dc-connect/                        # Next.js application root
    ├── .env.local.example             # Supabase env template
    ├── components.json                # Shadcn/UI configuration
    ├── next.config.mjs
    ├── package.json
    ├── tailwind.config.ts             # Includes dc-yellow / dc-slate palette
    ├── tsconfig.json
    ├── supabase/
    │   └── schema.sql                 # Full PostgreSQL schema (run in Supabase SQL Editor)
    └── src/
        ├── middleware.ts              # Supabase auth session refresh
        ├── app/
        │   ├── globals.css            # Tailwind + Shadcn CSS variables
        │   ├── layout.tsx             # Root layout
        │   └── page.tsx               # Home page (worker gig feed)
        ├── components/
        │   ├── ui/                    # Shadcn primitives (button, card, badge, etc.)
        │   └── gigs/
        │       └── job-card.tsx       # Mobile-first gig card (industrial theme)
        ├── lib/
        │   ├── utils.ts              # Shadcn cn() helper
        │   ├── geo.ts                # Haversine distance calculation
        │   └── supabase/
        │       ├── client.ts         # Browser Supabase client
        │       ├── server.ts         # Server Component Supabase client
        │       └── middleware.ts      # Session refresh logic
        └── types/
            └── database.ts           # TypeScript types mirroring Supabase schema
```

## Core Data Models

These are the canonical models. All code generation must respect this schema.

- **Users** — `id`, `auth_id`, `role` (worker | builder), `email`, `phone`, `full_name`, `profile_verified`
- **Worker Profiles** — `user_id`, `trade_type` (Electrical, HVAC, Low Voltage, Fiber Optic, Concrete, General Labor), `security_clearance_level` (None, Public Trust, Secret), `certifications` (JSONB), `hourly_rate`, `geo_lat/lng`, `available`
- **Projects** — `builder_id`, `site_name`, `security_level_required`, `geo_lat/lng`, `geofence_radius_m`, `start_date`, `end_date`
- **Gigs** — `project_id`, `trade_needed`, `count_needed`, `hourly_rate_offered`, `shift_schedule` (Day/Night/Swing)
- **Applications** — `worker_id`, `gig_id`, `status` (applied, vetting, accepted, rejected), `checkin_status` (pending, checked_in, checked_out)

Full SQL schema: `dc-connect/supabase/schema.sql`
TypeScript types: `dc-connect/src/types/database.ts`

## Development Workflow

### Getting Started

```bash
cd dc-connect
cp .env.local.example .env.local    # Fill in Supabase project URL + anon key
npm install
npm run dev                          # http://localhost:3000
```

### Commands

| Task        | Command            | Notes                              |
|-------------|--------------------|------------------------------------|
| Dev server  | `npm run dev`      | Hot reload on http://localhost:3000 |
| Build       | `npm run build`    | Production build                   |
| Type check  | `npx tsc --noEmit` | Strict TS — must pass cleanly      |
| Lint        | `npm run lint`     | ESLint (Next.js config)            |
| Start prod  | `npm run start`    | Serves built output                |

### Adding Shadcn Components

```bash
npx shadcn@latest add <component-name>
```

Components land in `src/components/ui/`. Do not manually edit generated Shadcn files.

## Design System

### Color Palette

The industrial theme uses two custom Tailwind color scales defined in `tailwind.config.ts`:

- **`dc-yellow-*`** (50–700) — Primary accent, CTAs, highlights. Based on #FACC15.
- **`dc-slate-*`** (50–950) — Backgrounds, text, cards. Based on #1E293B.

Standard Tailwind colors (`red`, `amber`, `white`) are also available.

### Styling Rules

1. Use Tailwind utility classes. No custom CSS unless absolutely necessary.
2. Mobile-first — always design for small screens, then `sm:`, `md:`, `lg:` breakpoints.
3. Dark backgrounds (`dc-slate-900/950`) with light text and yellow accents.
4. Shadcn components for all interactive UI. Extend via `className` prop — don't fork.
5. Use `lucide-react` for icons exclusively.

## Conventions for AI Assistants

### General Rules

1. **Read before writing.** Always read a file before proposing edits.
2. **Minimal changes.** Only modify what is necessary to complete the task.
3. **No guessing.** If information is missing, ask rather than assume.
4. **Security first.** Never introduce secrets, credentials, or known vulnerability patterns. All Supabase env vars go in `.env.local` (gitignored).
5. **Keep it simple.** Prefer the simplest solution. No premature abstractions.
6. **Respect the schema.** The SQL schema and TypeScript types in `database.ts` are the source of truth. If you need to change the data model, update both.
7. **App Router only.** Use Next.js App Router patterns (Server Components by default, `"use client"` only when needed). No Pages Router.
8. **Supabase patterns.** Use `createClient()` (browser) or `createServerSupabaseClient()` (server) from `src/lib/supabase/`. Never instantiate Supabase clients ad-hoc.

### File Placement

| What                          | Where                                |
|-------------------------------|--------------------------------------|
| Pages / routes                | `src/app/<route>/page.tsx`           |
| Layouts                       | `src/app/<route>/layout.tsx`         |
| Server actions                | `src/app/<route>/actions.ts`         |
| Reusable UI components        | `src/components/<domain>/`           |
| Shadcn primitives             | `src/components/ui/` (auto-generated)|
| Shared utilities              | `src/lib/`                           |
| TypeScript types              | `src/types/`                         |
| Zustand stores                | `src/stores/`                        |
| Supabase SQL migrations       | `supabase/`                          |

### Commit Messages

- Imperative mood ("Add feature" not "Added feature")
- Subject line under 72 characters
- Reference issue numbers when applicable

### Code Style

- TypeScript strict mode — no `any`, no `@ts-ignore`
- Double quotes for strings in TypeScript
- 2-space indentation
- Trailing commas in multi-line structures
- Named exports preferred over default (except page/layout files)

## Product Roadmap (Build Phases)

### Phase 1: Trust Layer (Onboarding)
- Worker: Mobile-first sign-up, upload OSHA cards/licenses, fast verification flow
- Builder: Company email verification, project creation wizard with security level toggles

### Phase 2: Marketplace ("The Match")
- Matching algorithm: Distance + Trade Match + Clearance Level
- Worker UI: Tinder-style quick apply (swipe cards)
- Builder UI: Roster View (Kanban board of applicants per gig)

### Phase 3: Logistics (Day-to-Day)
- Geofenced clock-in: GPS must match data center site coordinates
- QR Code badge: App generates daily QR code for site security access

## Key Decisions Log

| Date       | Decision                         | Rationale                                                  |
|------------|----------------------------------|------------------------------------------------------------|
| 2026-02-05 | Created CLAUDE.md                | Establish AI assistant guidance from project inception      |
| 2026-02-05 | Next.js 14 + Supabase + Shadcn  | Speed, type safety, integrated auth/realtime, accessible UI |
| 2026-02-05 | Industrial palette (yellow/slate)| High-visibility, trustworthy aesthetic for both PMs and trades |
| 2026-02-05 | RLS policies on all tables       | Security by default — row-level access control in Supabase |

---

*Last updated: 2026-02-05*
