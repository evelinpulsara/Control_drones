import { BatteryHealth, DroneStatus } from "./types";

export const STATUS_LABELS: Record<DroneStatus, string> = {
  DRONE_STATUS_IDLE: "En Espera",
  DRONE_STATUS_TAKEOFF: "Despegando",
  DRONE_STATUS_FLYING: "En Vuelo",
  DRONE_STATUS_HOVERING: "En Suspensión",
  DRONE_STATUS_LANDING: "Aterrizando",
  DRONE_STATUS_RETURN_TO_BASE: "Regresando",
  DRONE_STATUS_EMERGENCY: "Emergencia",
};

export const BATTERY_HEALTH_LABELS: Record<BatteryHealth, string> = {
  BATTERY_HEALTH_GOOD: "Óptimo",
  BATTERY_HEALTH_WARNING: "Atención",
  BATTERY_HEALTH_CRITICAL: "Crítico",
};

export function formatCoordinate(value: number, decimals: number = 6): string {
  return value.toFixed(decimals);
}

export function formatAltitude(meters: number): string {
  return `${meters.toFixed(1)} m`;
}

export function formatSpeed(kmh: number): string {
  return `${kmh.toFixed(1)} km/h`;
}

export function formatSignal(dbm: number): string {
  return `${dbm} dBm`;
}

export function formatTemperature(celsius: number): string {
  return `${celsius.toFixed(1)} °C`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
