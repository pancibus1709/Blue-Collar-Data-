"use client";

import {
  MapPin,
  Clock,
  Shield,
  Zap,
  ChevronRight,
  DollarSign,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SecurityClearance, ShiftSchedule, TradeType } from "@/types/database";

// ---------- Props ----------

export interface JobCardProps {
  /** Gig ID */
  id: string;
  /** Name of the data center site */
  siteName: string;
  /** Trade required */
  trade: TradeType;
  /** $/hr offered */
  hourlyRate: number;
  /** Day / Night / Swing */
  shift: ShiftSchedule;
  /** Distance from the worker in miles (pre-calculated) */
  distanceMiles: number;
  /** Site security clearance requirement */
  securityLevel: SecurityClearance;
  /** Workers still needed */
  spotsLeft: number;
  /** ISO date string */
  startDate: string;
  /** Callback when worker taps "Quick Apply" */
  onApply?: (gigId: string) => void;
}

// ---------- Helpers ----------

const CLEARANCE_CONFIG: Record<
  SecurityClearance,
  { label: string; color: string; icon: typeof Shield }
> = {
  None: { label: "No Clearance", color: "bg-dc-slate-600 text-dc-slate-200", icon: Shield },
  "Public Trust": { label: "Public Trust", color: "bg-amber-600 text-white", icon: Shield },
  Secret: { label: "SECRET", color: "bg-red-700 text-white", icon: Shield },
};

const SHIFT_LABEL: Record<ShiftSchedule, string> = {
  Day: "Day Shift",
  Night: "Night Shift",
  Swing: "Swing Shift",
};

function formatRate(rate: number) {
  return `$${rate.toFixed(0)}`;
}

function formatDistance(miles: number) {
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`;
  return `${miles.toFixed(1)} mi`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ---------- Component ----------

export function JobCard({
  id,
  siteName,
  trade,
  hourlyRate,
  shift,
  distanceMiles: distance,
  securityLevel,
  spotsLeft,
  startDate,
  onApply,
}: JobCardProps) {
  const clearance = CLEARANCE_CONFIG[securityLevel];

  return (
    <Card className="group relative overflow-hidden border-2 border-dc-slate-700 bg-dc-slate-900 text-white shadow-lg transition-all hover:border-dc-yellow-400 hover:shadow-dc-yellow-400/20 active:scale-[0.98]">
      {/* Top accent stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-dc-yellow-400 via-dc-yellow-500 to-dc-yellow-600" />

      <CardContent className="space-y-4 p-4 sm:p-5">
        {/* Header: Site name + clearance badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">
              {siteName}
            </h3>
            <p className="mt-0.5 text-sm font-medium text-dc-yellow-400">
              {trade}
            </p>
          </div>
          <Badge
            className={`flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${clearance.color}`}
          >
            <clearance.icon className="h-3 w-3" />
            {clearance.label}
          </Badge>
        </div>

        <Separator className="bg-dc-slate-700" />

        {/* Pay rate — hero element */}
        <div className="flex items-baseline gap-1">
          <DollarSign className="h-5 w-5 text-dc-yellow-400" />
          <span className="text-3xl font-extrabold tracking-tight text-dc-yellow-400 sm:text-4xl">
            {formatRate(hourlyRate)}
          </span>
          <span className="text-sm font-medium text-dc-slate-400">/hr</span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoCell
            icon={<MapPin className="h-4 w-4 text-dc-yellow-400" />}
            label="Distance"
            value={formatDistance(distance)}
          />
          <InfoCell
            icon={<Clock className="h-4 w-4 text-dc-yellow-400" />}
            label="Shift"
            value={SHIFT_LABEL[shift]}
          />
          <InfoCell
            icon={<Zap className="h-4 w-4 text-dc-yellow-400" />}
            label="Starts"
            value={formatDate(startDate)}
          />
          <InfoCell
            icon={<Users className="h-4 w-4 text-dc-yellow-400" />}
            label="Spots Left"
            value={`${spotsLeft}`}
            highlight={spotsLeft <= 3}
          />
        </div>

        {/* CTA */}
        <Button
          onClick={() => onApply?.(id)}
          className="h-12 w-full rounded-md bg-dc-yellow-400 text-base font-bold uppercase tracking-wider text-dc-slate-900 transition-colors hover:bg-dc-yellow-300 active:bg-dc-yellow-500"
        >
          Quick Apply
          <ChevronRight className="ml-1 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------- Sub-component ----------

function InfoCell({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-dc-slate-800 px-3 py-2">
      {icon}
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-dc-slate-400">
          {label}
        </p>
        <p
          className={`truncate text-sm font-semibold ${
            highlight ? "text-red-400" : "text-white"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
