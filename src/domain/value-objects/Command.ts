import { CommandType, isValidCommandType } from "../enums/CommandType";

export interface CommandSnapshot {
  readonly droneId: string;
  readonly type: CommandType;
  readonly payload: string;
  readonly timestamp: number;
  readonly commandId: string;
}

export class Command {
  private readonly _droneId: string;
  private readonly _type: CommandType;
  private readonly _payload: string;
  private readonly _timestamp: number;
  private readonly _commandId: string;

  private constructor(
    droneId: string,
    type: CommandType,
    payload: string,
    timestamp: number,
    commandId: string,
  ) {
    this._droneId = droneId;
    this._type = type;
    this._payload = payload;
    this._timestamp = timestamp;
    this._commandId = commandId;
  }

  public static create(
    droneId: string,
    type: CommandType,
    payload: string,
    timestamp?: number,
    commandId?: string,
  ): Command {
    Command.validate(droneId, type, payload);
    const resolvedTimestamp = timestamp ?? Date.now();
    const resolvedCommandId = commandId ?? Command.generateId();
    return new Command(droneId, type, payload, resolvedTimestamp, resolvedCommandId);
  }

  public static fromSnapshot(snapshot: CommandSnapshot): Command {
    if (!isValidCommandType(snapshot.type)) {
      throw new TypeError(`Invalid command type value: ${String(snapshot.type)}`);
    }
    return new Command(
      snapshot.droneId,
      snapshot.type,
      snapshot.payload,
      snapshot.timestamp,
      snapshot.commandId,
    );
  }

  public get droneId(): string {
    return this._droneId;
  }

  public get type(): CommandType {
    return this._type;
  }

  public get payload(): string {
    return this._payload;
  }

  public get timestamp(): number {
    return this._timestamp;
  }

  public get commandId(): string {
    return this._commandId;
  }

  public toSnapshot(): CommandSnapshot {
    return {
      droneId: this._droneId,
      type: this._type,
      payload: this._payload,
      timestamp: this._timestamp,
      commandId: this._commandId,
    };
  }

  public equals(other: Command): boolean {
    return this._commandId === other._commandId;
  }

  private static generateId(): string {
    return `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private static validate(droneId: string, type: CommandType, payload: string): void {
    if (typeof droneId !== "string" || droneId.trim().length === 0) {
      throw new TypeError("Drone id must be a non-empty string.");
    }
    if (!isValidCommandType(type)) {
      throw new TypeError(`Invalid command type: ${String(type)}`);
    }
    if (typeof payload !== "string") {
      throw new TypeError("Command payload must be a string.");
    }
  }
}
