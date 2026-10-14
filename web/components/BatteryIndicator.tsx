interface BatteryIndicatorProps {
  level: number;
  health: string;
}

export function BatteryIndicator({ level, health }: BatteryIndicatorProps) {
  const percentage = Math.max(0, Math.min(100, level));
  const isCritical = percentage <= 10 || health === "BATTERY_HEALTH_CRITICAL";
  const isWarning = percentage <= 20 || health === "BATTERY_HEALTH_WARNING";

  const barColor = isCritical
    ? "bg-red-500"
    : isWarning
      ? "bg-amber-500"
      : "bg-emerald-500";

  const textColor = isCritical
    ? "text-red-400"
    : isWarning
      ? "text-amber-400"
      : "text-emerald-400";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Nivel de Batería</span>
        <span className={`font-mono font-semibold ${textColor}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
