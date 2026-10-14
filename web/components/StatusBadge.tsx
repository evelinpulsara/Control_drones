import { DroneStatus } from "../lib/types";
import { STATUS_LABELS } from "../lib/format";

interface StatusBadgeProps {
  status: DroneStatus;
}

const STATUS_STYLES: Record<DroneStatus, string> = {
  DRONE_STATUS_IDLE: "bg-slate-700/70 text-slate-300 ring-slate-500/40",
  DRONE_STATUS_TAKEOFF: "bg-sky-900/60 text-sky-300 ring-sky-400/40",
  DRONE_STATUS_FLYING: "bg-emerald-900/60 text-emerald-300 ring-emerald-400/40",
  DRONE_STATUS_HOVERING: "bg-teal-900/60 text-teal-300 ring-teal-400/40",
  DRONE_STATUS_LANDING: "bg-amber-900/60 text-amber-300 ring-amber-400/40",
  DRONE_STATUS_RETURN_TO_BASE: "bg-indigo-900/60 text-indigo-300 ring-indigo-400/40",
  DRONE_STATUS_EMERGENCY: "bg-red-900/60 text-red-300 ring-red-400/40",
};

const STATUS_PULSE: Record<DroneStatus, boolean> = {
  DRONE_STATUS_IDLE: false,
  DRONE_STATUS_TAKEOFF: true,
  DRONE_STATUS_FLYING: true,
  DRONE_STATUS_HOVERING: false,
  DRONE_STATUS_LANDING: true,
  DRONE_STATUS_RETURN_TO_BASE: true,
  DRONE_STATUS_EMERGENCY: true,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = STATUS_LABELS[status];
  const pulse = STATUS_PULSE[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? "animate-pulse-soft" : ""}`}
      />
      {label}
    </span>
  );
}
