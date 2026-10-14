import { BatteryHealth } from "../../../domain/enums/BatteryHealth";
import { CommandType } from "../../../domain/enums/CommandType";
import { DroneStatus } from "../../../domain/enums/DroneStatus";
import { Battery } from "../../../domain/value-objects/Battery";
import { Command } from "../../../domain/value-objects/Command";
import { Coordinates } from "../../../domain/value-objects/Coordinates";
import { TelemetryData } from "../../../domain/value-objects/TelemetryData";

export interface ProtoCoordinates {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
}

export interface ProtoBattery {
  level: number;
  voltage: number;
  current: number;
  temperature: number;
  cycles: number;
  health: string;
}

export interface ProtoTelemetryData {
  drone_id: string;
  timestamp: string | number;
  coordinates: ProtoCoordinates;
  battery: ProtoBattery;
  status: string;
  ground_speed: number;
  signal_strength: number;
  mission_id?: string;
}

export interface ProtoCommand {
  drone_id: string;
  type: string;
  payload: string;
  timestamp: string | number;
  command_id: string;
}

export class TelemetryMapper {
  public static toDomainTelemetry(proto: ProtoTelemetryData): TelemetryData {
    const coordinates = Coordinates.create(
      proto.coordinates.latitude,
      proto.coordinates.longitude,
      proto.coordinates.altitude,
      proto.coordinates.heading,
    );

    const battery = Battery.create(
      proto.battery.level,
      proto.battery.voltage,
      proto.battery.current,
      proto.battery.temperature,
      proto.battery.cycles,
      TelemetryMapper.toBatteryHealth(proto.battery.health),
    );

    return TelemetryData.create(
      proto.drone_id,
      Number(proto.timestamp),
      coordinates,
      battery,
      TelemetryMapper.toDroneStatus(proto.status),
      proto.ground_speed,
      proto.signal_strength,
      proto.mission_id ?? null,
    );
  }

  public static toProtoCommand(command: Command): ProtoCommand {
    return {
      drone_id: command.droneId,
      type: command.type,
      payload: command.payload,
      timestamp: command.timestamp.toString(),
      command_id: command.commandId,
    };
  }

  private static toDroneStatus(value: string): DroneStatus {
    const status = value as DroneStatus;
    if (!Object.values(DroneStatus).includes(status)) {
      throw new TypeError(`Invalid drone status from proto: ${value}`);
    }
    return status;
  }

  private static toBatteryHealth(value: string): BatteryHealth {
    const health = value as BatteryHealth;
    if (!Object.values(BatteryHealth).includes(health)) {
      throw new TypeError(`Invalid battery health from proto: ${value}`);
    }
    return health;
  }

  public static toCommandType(value: string): CommandType {
    const type = value as CommandType;
    if (!Object.values(CommandType).includes(type)) {
      throw new TypeError(`Invalid command type from proto: ${value}`);
    }
    return type;
  }
}
