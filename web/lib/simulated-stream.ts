import { BatteryHealth, Coordinates, DroneStatus, TelemetryData, TelemetryListener } from "./types";

interface DroneSimState {
  id: string;
  name: string;
  status: DroneStatus;
  coordinates: Coordinates;
  battery: number;
  batteryHealth: BatteryHealth;
  voltage: number;
  current: number;
  temperature: number;
  cycles: number;
  groundSpeed: number;
  signalStrength: number;
  missionId: string | null;
  heading: number;
}

const DRONE_SEEDS: Array<{ id: string; name: string; lat: number; lon: number; mission: string }> = [
  { id: "drone-alpha-001", name: "Alfa", lat: 40.4168, lon: -3.7038, mission: "mision-riego-01" },
  { id: "drone-beta-002", name: "Beta", lat: 40.4182, lon: -3.7055, mission: "mision-fumigado-02" },
  { id: "drone-gamma-003", name: "Gamma", lat: 40.4155, lon: -3.7021, mission: "mision-reconocer-03" },
];

export class SimulatedTelemetryStream {
  private static instance: SimulatedTelemetryStream;
  private drones: Map<string, DroneSimState>;
  private listeners: Set<TelemetryListener>;
  private intervalId: ReturnType<typeof setInterval> | null;
  private readonly intervalMs: number;

  private constructor(intervalMs: number = 1200) {
    this.drones = new Map<string, DroneSimState>();
    this.listeners = new Set<TelemetryListener>();
    this.intervalId = null;
    this.intervalMs = intervalMs;
    this.seedDrones();
  }

  public static getInstance(): SimulatedTelemetryStream {
    if (!SimulatedTelemetryStream.instance) {
      SimulatedTelemetryStream.instance = new SimulatedTelemetryStream();
    }
    return SimulatedTelemetryStream.instance;
  }

  public start(): void {
    if (this.intervalId !== null) {
      return;
    }
    this.intervalId = setInterval(() => this.tick(), this.intervalMs);
  }

  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    this.emitAll(listener);
    return () => this.listeners.delete(listener);
  }

  public getDroneCount(): number {
    return this.drones.size;
  }

  private seedDrones(): void {
    for (const seed of DRONE_SEEDS) {
      this.drones.set(seed.id, {
        id: seed.id,
        name: seed.name,
        status: "DRONE_STATUS_IDLE",
        coordinates: {
          latitude: seed.lat,
          longitude: seed.lon,
          altitude: 0,
          heading: 0,
        },
        battery: 95,
        batteryHealth: "BATTERY_HEALTH_GOOD",
        voltage: 12.6,
        current: 0,
        temperature: 22,
        cycles: 12,
        groundSpeed: 0,
        signalStrength: -45,
        missionId: seed.mission,
        heading: 0,
      });
    }
  }

  private emitAll(listener: TelemetryListener): void {
    for (const state of this.drones.values()) {
      listener(this.toTelemetry(state));
    }
  }

  private tick(): void {
    for (const state of this.drones.values()) {
      this.evolve(state);
      const telemetry = this.toTelemetry(state);
      for (const listener of this.listeners) {
        listener(telemetry);
      }
    }
  }

  private evolve(state: DroneSimState): void {
    this.evolveStatus(state);
    this.evolveBattery(state);
    this.evolvePosition(state);
    this.evolveSignal(state);
  }

  private evolveStatus(state: DroneSimState): void {
    switch (state.status) {
      case "DRONE_STATUS_IDLE":
        if (Math.random() < 0.15) {
          state.status = "DRONE_STATUS_TAKEOFF";
        }
        break;
      case "DRONE_STATUS_TAKEOFF":
        if (state.coordinates.altitude >= 80) {
          state.status = "DRONE_STATUS_FLYING";
        }
        break;
      case "DRONE_STATUS_FLYING":
        if (Math.random() < 0.08) {
          state.status = "DRONE_STATUS_HOVERING";
        } else if (state.battery <= 15) {
          state.status = "DRONE_STATUS_RETURN_TO_BASE";
        }
        break;
      case "DRONE_STATUS_HOVERING":
        if (Math.random() < 0.1) {
          state.status = "DRONE_STATUS_FLYING";
        } else if (state.battery <= 15) {
          state.status = "DRONE_STATUS_RETURN_TO_BASE";
        }
        break;
      case "DRONE_STATUS_RETURN_TO_BASE":
        if (state.coordinates.altitude <= 2) {
          state.status = "DRONE_STATUS_LANDING";
        }
        break;
      case "DRONE_STATUS_LANDING":
        if (state.coordinates.altitude <= 0.5) {
          state.coordinates.altitude = 0;
          state.status = "DRONE_STATUS_IDLE";
        }
        break;
      case "DRONE_STATUS_EMERGENCY":
        if (Math.random() < 0.05) {
          state.status = "DRONE_STATUS_LANDING";
        }
        break;
    }

    if (state.battery <= 5 && state.coordinates.altitude > 5) {
      state.status = "DRONE_STATUS_EMERGENCY";
    }
  }

  private evolveBattery(state: DroneSimState): void {
    const inFlight =
      state.status === "DRONE_STATUS_FLYING" ||
      state.status === "DRONE_STATUS_HOVERING" ||
      state.status === "DRONE_STATUS_TAKEOFF";

    if (inFlight) {
      state.battery = Math.max(0, state.battery - 0.4 - Math.random() * 0.3);
      state.current = 8 + Math.random() * 4;
      state.temperature = 28 + Math.random() * 6;
    } else if (state.status === "DRONE_STATUS_IDLE") {
      state.current = -1.5 - Math.random() * 0.5;
      state.battery = Math.min(100, state.battery + 0.8);
      state.temperature = Math.max(20, state.temperature - 0.3);
    } else {
      state.current = 4 + Math.random() * 2;
      state.temperature = 26 + Math.random() * 4;
    }

    state.voltage = 10.5 + (state.battery / 100) * 2.1 + (Math.random() - 0.5) * 0.1;

    if (state.battery <= 10 || state.temperature >= 58) {
      state.batteryHealth = "BATTERY_HEALTH_CRITICAL";
    } else if (state.battery <= 20 || state.temperature >= 48) {
      state.batteryHealth = "BATTERY_HEALTH_WARNING";
    } else {
      state.batteryHealth = "BATTERY_HEALTH_GOOD";
    }
  }

  private evolvePosition(state: DroneSimState): void {
    const moving =
      state.status === "DRONE_STATUS_FLYING" ||
      state.status === "DRONE_STATUS_TAKEOFF" ||
      state.status === "DRONE_STATUS_RETURN_TO_BASE";

    if (moving) {
      state.heading = (state.heading + (Math.random() - 0.5) * 20 + 360) % 360;
      const speedKmh = 5 + Math.random() * 10;
      state.groundSpeed = speedKmh;
      const radians = (state.heading * Math.PI) / 180;
      const deltaLat = (Math.cos(radians) * speedKmh) / 111000;
      const deltaLon = (Math.sin(radians) * speedKmh) / (111000 * Math.cos((state.coordinates.latitude * Math.PI) / 180));
      state.coordinates.latitude += deltaLat;
      state.coordinates.longitude += deltaLon;
    } else {
      state.groundSpeed = 0;
    }

    if (state.status === "DRONE_STATUS_TAKEOFF") {
      state.coordinates.altitude = Math.min(100, state.coordinates.altitude + 4 + Math.random() * 3);
    } else if (state.status === "DRONE_STATUS_LANDING" || state.status === "DRONE_STATUS_EMERGENCY") {
      state.coordinates.altitude = Math.max(0, state.coordinates.altitude - 5);
    } else if (state.status === "DRONE_STATUS_RETURN_TO_BASE") {
      state.coordinates.altitude = Math.max(10, state.coordinates.altitude - 2);
    } else if (state.status === "DRONE_STATUS_HOVERING") {
      state.coordinates.altitude += (Math.random() - 0.5) * 0.5;
    }
  }

  private evolveSignal(state: DroneSimState): void {
    const base = state.coordinates.altitude > 0 ? -50 : -40;
    state.signalStrength = base + (Math.random() - 0.5) * 20;
  }

  private toTelemetry(state: DroneSimState): TelemetryData {
    return {
      droneId: state.id,
      droneName: state.name,
      timestamp: Date.now(),
      coordinates: { ...state.coordinates },
      battery: {
        level: Math.round(state.battery * 10) / 10,
        voltage: Math.round(state.voltage * 100) / 100,
        current: Math.round(state.current * 10) / 10,
        temperature: Math.round(state.temperature * 10) / 10,
        cycles: state.cycles,
        health: state.batteryHealth,
      },
      status: state.status,
      groundSpeed: Math.round(state.groundSpeed * 10) / 10,
      signalStrength: Math.round(state.signalStrength),
      missionId: state.missionId,
    };
  }
}
