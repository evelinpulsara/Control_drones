import { TelemetryData } from "../lib/types";
import {
  formatAltitude,
  formatCoordinate,
  formatSignal,
  formatSpeed,
  formatTemperature,
  formatTime,
} from "../lib/format";
import { BatteryIndicator } from "./BatteryIndicator";
import { StatusBadge } from "./StatusBadge";
import { TelemetrySparkline } from "./TelemetrySparkline";

interface DroneCardProps {
  telemetry: TelemetryData;
  batteryHistory: number[];
}

function TelemetryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-mono text-sm text-slate-200">{value}</p>
    </div>
  );
}

export function DroneCard({ telemetry, batteryHistory }: DroneCardProps) {
  const { droneName, timestamp, coordinates, battery, status, groundSpeed, signalStrength, missionId } =
    telemetry;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 shadow-xl backdrop-blur-sm transition-all duration-500 hover:border-emerald-500/40 hover:bg-slate-800/60">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl transition-opacity duration-500 group-hover:bg-emerald-500/10" />

      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-100">Drone {droneName}</span>
          </div>
          <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
            {missionId ?? "Sin misión"}
          </p>
        </div>
        <StatusBadge status={status} />
      </header>

      <div className="mb-4">
        <BatteryIndicator level={battery.level} health={battery.health} />
        <div className="mt-2">
          <TelemetrySparkline data={batteryHistory} color="#34d399" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TelemetryStat
          label="Latitud"
          value={formatCoordinate(coordinates.latitude)}
        />
        <TelemetryStat
          label="Longitud"
          value={formatCoordinate(coordinates.longitude)}
        />
        <TelemetryStat label="Altitud" value={formatAltitude(coordinates.altitude)} />
        <TelemetryStat label="Velocidad" value={formatSpeed(groundSpeed)} />
        <TelemetryStat
          label="Temperatura"
          value={formatTemperature(battery.temperature)}
        />
        <TelemetryStat label="Señal" value={formatSignal(signalStrength)} />
      </div>

      <footer className="mt-4 flex items-center justify-between border-t border-slate-700/40 pt-3">
        <span className="text-[10px] uppercase tracking-wider text-slate-600">
          Actualizado
        </span>
        <span className="font-mono text-xs text-slate-400">{formatTime(timestamp)}</span>
      </footer>
    </article>
  );
}
