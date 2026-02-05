import { JobCard } from "@/components/gigs/job-card";

const SAMPLE_GIGS = [
  {
    id: "1",
    siteName: "AWS US-East Data Center — Ashburn, VA",
    trade: "Electrical" as const,
    hourlyRate: 62,
    shift: "Day" as const,
    distanceMiles: 4.2,
    securityLevel: "Public Trust" as const,
    spotsLeft: 8,
    startDate: "2026-03-01",
  },
  {
    id: "2",
    siteName: "Google Cloud Campus — The Dalles, OR",
    trade: "Fiber Optic" as const,
    hourlyRate: 75,
    shift: "Night" as const,
    distanceMiles: 12.7,
    securityLevel: "Secret" as const,
    spotsLeft: 2,
    startDate: "2026-02-15",
  },
  {
    id: "3",
    siteName: "Meta DC Expansion — Prineville, OR",
    trade: "HVAC" as const,
    hourlyRate: 58,
    shift: "Swing" as const,
    distanceMiles: 0.8,
    securityLevel: "None" as const,
    spotsLeft: 15,
    startDate: "2026-04-10",
  },
  {
    id: "4",
    siteName: "Microsoft Azure — San Antonio, TX",
    trade: "Low Voltage" as const,
    hourlyRate: 55,
    shift: "Day" as const,
    distanceMiles: 22.3,
    securityLevel: "Public Trust" as const,
    spotsLeft: 5,
    startDate: "2026-03-20",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dc-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto mb-8 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-dc-yellow-400">
            <span className="text-lg font-black text-dc-slate-900">DC</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              DC-Connect
            </h1>
            <p className="text-sm text-dc-slate-400">
              Data Center Gigs Near You
            </p>
          </div>
        </div>
      </div>

      {/* Gig feed */}
      <div className="mx-auto grid max-w-2xl gap-4 sm:gap-5">
        {SAMPLE_GIGS.map((gig) => (
          <JobCard
            key={gig.id}
            {...gig}
            onApply={(id) => console.log("Applied to gig:", id)}
          />
        ))}
      </div>
    </main>
  );
}
