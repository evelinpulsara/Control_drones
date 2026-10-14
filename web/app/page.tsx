"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DroneCard } from "../components/DroneCard";
import { MissionControls } from "../components/MissionControls";
import { SimulatedTelemetryStream } from "../lib/simulated-stream";
import { TelemetryData } from "../lib/types";

interface FleetStats {
  totalDrones: number;
  inFlight: number;
  averageBattery: number;
  criticalCount: number;
}

const MAX_HISTORY_POINTS = 30;

export default function DashboardPage() {
  const [telemetryMap, setTelemetryMap] = useState<Map<string, TelemetryData>>(new Map());
  const [batteryHistory, setBatteryHistory] = useState<Map<string, number[]>>(new Map());
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<SimulatedTelemetryStream | null>(null);

  useEffect(() => {
    streamRef.current = SimulatedTelemetryStream.getInstance();
    const stream = streamRef.current;

    const unsubscribe = stream.subscribe((telemetry: TelemetryData) => {
      setTelemetryMap((prev) => {
        const next = new Map(prev);
        next.set(telemetry.droneId, telemetry);
        return next;
      });

      setBatteryHistory((prev) => {
        const next = new Map(prev);
        const history = next.get(telemetry.droneId) ?? [];
        const updated = [...history, telemetry.battery.level].slice(-MAX_HISTORY_POINTS);
        next.set(telemetry.droneId, updated);
        return next;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleStream = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) {
      return;
    }

    if (isStreaming) {
      stream.stop();
      setIsStreaming(false);
    } else {
      stream.start();
      setIsStreaming(true);
    }
  }, [isStreaming]);

  const stats: FleetStats = useMemo(() => {
    const drones = Array.from(telemetryMap.values());
    const inFlight = drones.filter(
      (d) =>
        d.status === "DRONE_STATUS_FLYING" ||
        d.status === "DRONE_STATUS_HOVERING" ||
        d.status === "DRONE_STATUS_TAKEOFF",
    ).length;
    const totalBattery = drones.reduce((sum, d) => sum + d.battery.level, 0);
    const averageBattery = drones.length > 0 ? totalBattery / drones.length : 0;
    const criticalCount = drones.filter(
      (d) => d.battery.health === "BATTERY_HEALTH_CRITICAL",
    ).length;

    return {
      totalDrones: drones.length,
      inFlight,
      averageBattery,
      criticalCount,
    };
  }, [telemetryMap]);

  const drones = useMemo(
    () => Array.from(telemetryMap.values()).sort((a, b) => a.droneName.localeCompare(b.droneName)),
    [telemetryMap],
  );

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 animate-blur-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-500/80">
              Agricultura de Precisión
            </p>
            <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
              Panel de Control de Drones
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Telemetría en tiempo real de la flota agrícola
            </p>
          </div>
          <MissionControls
            isStreaming={isStreaming}
            onToggleStream={handleToggleStream}
            droneCount={stats.totalDrones}
          />
        </div>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Resumen de flota">
        <StatCard
          label="Drones Totales"
          value={stats.totalDrones}
          accent="text-slate-100"
        />
        <StatCard
          label="En Vuelo"
          value={stats.inFlight}
          accent="text-emerald-400"
        />
        <StatCard
          label="Batería Promedio"
          value={`${stats.averageBattery.toFixed(0)}%`}
          accent="text-amber-400"
        />
        <StatCard
          label="Críticos"
          value={stats.criticalCount}
          accent={stats.criticalCount > 0 ? "text-red-400" : "text-slate-400"}
        />
      </section>

      <section aria-label="Telemetría de drones">
        {drones.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-800/20 p-8 text-center">
            <div className="mb-3 animate-float-slow">
              <svg
                className="h-12 w-12 text-slate-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">
              Presione <span className="text-emerald-400">Iniciar Misión</span> para recibir telemetría
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {drones.map((telemetry, index) => (
              <div
                key={telemetry.droneId}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
              >
                <DroneCard
                  telemetry={telemetry}
                  batteryHistory={batteryHistory.get(telemetry.droneId) ?? []}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-12 border-t border-slate-800 pt-6 text-center">
        <p className="text-xs text-slate-600">
          AgriDrone Telemetría · Monitoreo de Flota Agrícola
        </p>
      </footer>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
