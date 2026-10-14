export type DroneStatus =
  | "DRONE_STATUS_IDLE"
  | "DRONE_STATUS_TAKEOFF"
  | "DRONE_STATUS_FLYING"
  | "DRONE_STATUS_HOVERING"
  | "DRONE_STATUS_LANDING"
  | "DRONE_STATUS_RETURN_TO_BASE"
  | "DRONE_STATUS_EMERGENCY";

export type BatteryHealth =
  | "BATTERY_HEALTH_GOOD"
  | "BATTERY_HEALTH_WARNING"
  | "BATTERY_HEALTH_CRITICAL";

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
}

export interface Battery {
  level: number;
  voltage: number;
  current: number;
  temperature: number;
  cycles: number;
  health: BatteryHealth;
}

export interface TelemetryData {
  droneId: string;
  droneName: string;
  timestamp: number;
  coordinates: Coordinates;
  battery: Battery;
  status: DroneStatus;
  groundSpeed: number;
  signalStrength: number;
  missionId: string | null;
}

export interface DroneSnapshot {
  id: string;
  name: string;
  status: DroneStatus;
  connected: boolean;
  lastTelemetry: TelemetryData | null;
}

export interface TelemetryListener {
  (telemetry: TelemetryData): void;
}
