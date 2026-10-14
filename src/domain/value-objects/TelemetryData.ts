import { DroneStatus, isValidDroneStatus } from "../enums/DroneStatus";
import { Battery, BatterySnapshot } from "./Battery";
import { Coordinates, CoordinatesSnapshot } from "./Coordinates";

export interface TelemetryDataSnapshot {
  readonly droneId: string;
  readonly timestamp: number;
  readonly coordinates: CoordinatesSnapshot;
  readonly battery: BatterySnapshot;
  readonly status: DroneStatus;
  readonly groundSpeed: number;
  readonly signalStrength: number;
  readonly missionId: string | null;
}

export class TelemetryData {
  private readonly _droneId: string;
  private readonly _timestamp: number;
  private readonly _coordinates: Coordinates;
  private readonly _battery: Battery;
  private readonly _status: DroneStatus;
  private readonly _groundSpeed: number;
  private readonly _signalStrength: number;
  private readonly _missionId: string | null;

  private constructor(
    droneId: string,
    timestamp: number,
    coordinates: Coordinates,
    battery: Battery,
    status: DroneStatus,
    groundSpeed: number,
    signalStrength: number,
    missionId: string | null,
  ) {
    this._droneId = droneId;
    this._timestamp = timestamp;
    this._coordinates = coordinates;
    this._battery = battery;
    this._status = status;
    this._groundSpeed = groundSpeed;
    this._signalStrength = signalStrength;
    this._missionId = missionId;
  }

  public static create(
    droneId: string,
    timestamp: number,
    coordinates: Coordinates,
    battery: Battery,
    status: DroneStatus,
    groundSpeed: number,
    signalStrength: number,
    missionId?: string | null,
  ): TelemetryData {
    TelemetryData.validate(droneId, timestamp, coordinates, battery, status, groundSpeed, signalStrength);
    return new TelemetryData(
      droneId,
      timestamp,
      coordinates,
      battery,
      status,
      groundSpeed,
      signalStrength,
      missionId ?? null,
    );
  }

  public static fromSnapshot(snapshot: TelemetryDataSnapshot): TelemetryData {
    return TelemetryData.create(
      snapshot.droneId,
      snapshot.timestamp,
      Coordinates.fromSnapshot(snapshot.coordinates),
      Battery.fromSnapshot(snapshot.battery),
      snapshot.status,
      snapshot.groundSpeed,
      snapshot.signalStrength,
      snapshot.missionId,
    );
  }

  public get droneId(): string {
    return this._droneId;
  }

  public get timestamp(): number {
    return this._timestamp;
  }

  public get coordinates(): Coordinates {
    return this._coordinates;
  }

  public get battery(): Battery {
    return this._battery;
  }

  public get status(): DroneStatus {
    return this._status;
  }

  public get groundSpeed(): number {
    return this._groundSpeed;
  }

  public get signalStrength(): number {
    return this._signalStrength;
  }

  public get missionId(): string | null {
    return this._missionId;
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

  public get needsEmergencyAttention(): boolean {
    return (
      this._status === DroneStatus.EMERGENCY ||
      this._battery.isCritical() ||
      this._battery.isOverheating()
    );
  }

  public toSnapshot(): TelemetryDataSnapshot {
    return {
      droneId: this._droneId,
      timestamp: this._timestamp,
      coordinates: this._coordinates.toSnapshot(),
      battery: this._battery.toSnapshot(),
      status: this._status,
      groundSpeed: this._groundSpeed,
      signalStrength: this._signalStrength,
      missionId: this._missionId,
    };
  }

  public equals(other: TelemetryData): boolean {
    return this._droneId === other._droneId && this._timestamp === other._timestamp;
  }

  private static validate(
    droneId: string,
    timestamp: number,
    coordinates: Coordinates,
    battery: Battery,
    status: DroneStatus,
    groundSpeed: number,
    signalStrength: number,
  ): void {
    if (typeof droneId !== "string" || droneId.trim().length === 0) {
      throw new TypeError("Drone id must be a non-empty string.");
    }
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      throw new RangeError(`Timestamp must be a non-negative finite number, received ${timestamp}.`);
    }
    if (!(coordinates instanceof Coordinates)) {
      throw new TypeError("Coordinates must be a Coordinates instance.");
    }
    if (!(battery instanceof Battery)) {
      throw new TypeError("Battery must be a Battery instance.");
    }
    if (!isValidDroneStatus(status)) {
      throw new TypeError(`Invalid drone status: ${String(status)}`);
    }
    if (!Number.isFinite(groundSpeed) || groundSpeed < 0) {
      throw new RangeError(`Ground speed must be a non-negative finite number, received ${groundSpeed}.`);
    }
    if (!Number.isFinite(signalStrength)) {
      throw new RangeError(`Signal strength must be a finite number, received ${signalStrength}.`);
    }
  }
}
