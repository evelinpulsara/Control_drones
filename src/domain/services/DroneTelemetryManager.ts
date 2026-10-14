import { CommandType } from "../enums/CommandType";
import { Drone, DroneSnapshot } from "../entities/Drone";
import { Command } from "../value-objects/Command";
import { TelemetryData } from "../value-objects/TelemetryData";
import { TelemetryCollector } from "./TelemetryCollector";

export class DroneTelemetryManager extends TelemetryCollector {
  private readonly _drones: Map<string, Drone>;

  public constructor() {
    super();
    this._drones = new Map<string, Drone>();
  }

  public registerDrone(drone: Drone): void {
    if (this._drones.has(drone.id)) {
      throw new Error(`Drone with id ${drone.id} is already registered.`);
    }
    this._drones.set(drone.id, drone);
  }

  public removeDrone(droneId: string): void {
    this._drones.delete(droneId);
  }

  public getDrone(droneId: string): Drone | undefined {
    return this._drones.get(droneId);
  }

  public hasDrone(droneId: string): boolean {
    return this._drones.has(droneId);
  }

  public getFleetSize(): number {
    return this._drones.size;
  }

  public getFleetSnapshots(): ReadonlyArray<DroneSnapshot> {
    return Array.from(this._drones.values()).map((drone) => drone.toSnapshot());
  }

  protected override validate(telemetry: TelemetryData): TelemetryData {
    const drone = this._drones.get(telemetry.droneId);
    if (!drone) {
      throw new Error(`Unknown drone id: ${telemetry.droneId}`);
    }
    return telemetry;
  }

  protected override onTelemetry(telemetry: TelemetryData): void {
    const drone = this._drones.get(telemetry.droneId);
    if (drone) {
      drone.applyTelemetry(telemetry);
    }
  }

  protected override decideCommand(telemetry: TelemetryData): Command | null {
    const drone = this._drones.get(telemetry.droneId);
    if (!drone) {
      return null;
    }

    if (telemetry.battery.isCritical() && drone.isInFlight) {
      return Command.create(
        drone.id,
        CommandType.RETURN_TO_BASE,
        JSON.stringify({ reason: "critical_battery" }),
      );
    }

    if (telemetry.battery.isOverheating()) {
      return Command.create(
        drone.id,
        CommandType.EMERGENCY_STOP,
        JSON.stringify({ reason: "battery_overheating" }),
      );
    }

    if (telemetry.status === "DRONE_STATUS_EMERGENCY") {
      return Command.create(
        drone.id,
        CommandType.EMERGENCY_STOP,
        JSON.stringify({ reason: "emergency_status" }),
      );
    }

    return null;
  }

  protected override onStart(): void {
    for (const drone of this._drones.values()) {
      drone.connect();
    }
  }

  protected override onStop(): void {
    for (const drone of this._drones.values()) {
      drone.disconnect();
    }
  }
}
