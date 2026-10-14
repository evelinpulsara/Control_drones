import { DroneStatus } from "../enums/DroneStatus";
import { Command } from "../value-objects/Command";
import { Coordinates } from "../value-objects/Coordinates";
import { TelemetryData, TelemetryDataSnapshot } from "../value-objects/TelemetryData";

export interface DroneSnapshot {
  readonly id: string;
  readonly status: DroneStatus;
  readonly lastTelemetry: TelemetryDataSnapshot | null;
  readonly activeMissionId: string | null;
  readonly connected: boolean;
}

export class Drone {
  private readonly _id: string;
  private _status: DroneStatus;
  private _lastTelemetry: TelemetryData | null;
  private _activeMissionId: string | null;
  private _connected: boolean;

  public constructor(id: string) {
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new TypeError("Drone id must be a non-empty string.");
    }
    this._id = id;
    this._status = DroneStatus.IDLE;
    this._lastTelemetry = null;
    this._activeMissionId = null;
    this._connected = false;
  }

  public get id(): string {
    return this._id;
  }

  public get status(): DroneStatus {
    return this._status;
  }

  public get lastTelemetry(): TelemetryData | null {
    return this._lastTelemetry;
  }

  public get lastKnownCoordinates(): Coordinates | null {
    return this._lastTelemetry ? this._lastTelemetry.coordinates : null;
  }

  public get activeMissionId(): string | null {
    return this._activeMissionId;
  }

  public get connected(): boolean {
    return this._connected;
  }

  public get isInFlight(): boolean {
    return (
      this._status === DroneStatus.TAKEOFF ||
      this._status === DroneStatus.FLYING ||
      this._status === DroneStatus.HOVERING ||
      this._status === DroneStatus.LANDING ||
      this._status === DroneStatus.RETURN_TO_BASE
    );
  }

  public applyTelemetry(telemetry: TelemetryData): void {
    if (telemetry.droneId !== this._id) {
      throw new Error(
        `Telemetry drone id mismatch: expected ${this._id}, received ${telemetry.droneId}.`,
      );
    }
    if (this._lastTelemetry && telemetry.timestamp < this._lastTelemetry.timestamp) {
      throw new Error("Cannot apply older telemetry than the current latest sample.");
    }
    this._lastTelemetry = telemetry;
    this._status = telemetry.status;
    if (telemetry.missionId) {
      this._activeMissionId = telemetry.missionId;
    }
  }

  public applyCommand(command: Command): void {
    if (command.droneId !== this._id) {
      throw new Error(
        `Command drone id mismatch: expected ${this._id}, received ${command.droneId}.`,
      );
    }
    this._status = Drone.mapCommandToStatus(command.type);
  }

  public connect(): void {
    this._connected = true;
  }

  public disconnect(): void {
    this._connected = false;
  }

  public toSnapshot(): DroneSnapshot {
    return {
      id: this._id,
      status: this._status,
      lastTelemetry: this._lastTelemetry ? this._lastTelemetry.toSnapshot() : null,
      activeMissionId: this._activeMissionId,
      connected: this._connected,
    };
  }

  private static mapCommandToStatus(commandType: Command["type"]): DroneStatus {
    switch (commandType) {
      case "COMMAND_TYPE_TAKEOFF":
        return DroneStatus.TAKEOFF;
      case "COMMAND_TYPE_LAND":
        return DroneStatus.LANDING;
      case "COMMAND_TYPE_RETURN_TO_BASE":
        return DroneStatus.RETURN_TO_BASE;
      case "COMMAND_TYPE_HOVER":
        return DroneStatus.HOVERING;
      case "COMMAND_TYPE_EMERGENCY_STOP":
        return DroneStatus.EMERGENCY;
      case "COMMAND_TYPE_ADJUST_ALTITUDE":
      case "COMMAND_TYPE_WAYPOINT":
        return DroneStatus.FLYING;
      default:
        return DroneStatus.IDLE;
    }
  }
}
