import * as grpc from "@grpc/grpc-js";
import { DroneTelemetryManager } from "../../domain/services/DroneTelemetryManager";
import { Command } from "../../domain/value-objects/Command";
import { TelemetryData } from "../../domain/value-objects/TelemetryData";
import { ProtoCommand, ProtoTelemetryData, TelemetryMapper } from "./mappers/TelemetryMapper";

export type BidirectionalStream = grpc.ServerDuplexStream<ProtoTelemetryData, ProtoCommand>;

export class TelemetryStreamHandler {
  private readonly _call: BidirectionalStream;
  private readonly _manager: DroneTelemetryManager;
  private _telemetryCount: number;
  private _commandCount: number;

  public constructor(call: BidirectionalStream, manager: DroneTelemetryManager) {
    this._call = call;
    this._manager = manager;
    this._telemetryCount = 0;
    this._commandCount = 0;
  }

  public get telemetryCount(): number {
    return this._telemetryCount;
  }

  public get commandCount(): number {
    return this._commandCount;
  }

  public handle(): void {
    this._call.on("data", (message: ProtoTelemetryData) => this.handleTelemetry(message));
    this._call.on("error", (error: Error) => this.handleError(error));
    this._call.on("end", () => this.handleEnd());
    this._call.on("cancelled", () => this.handleCancelled());
  }

  private handleTelemetry(message: ProtoTelemetryData): void {
    try {
      const telemetry: TelemetryData = TelemetryMapper.toDomainTelemetry(message);
      this._telemetryCount++;
      const command: Command | null = this._manager.collect(telemetry);
      if (command) {
        this.sendCommand(command);
      }
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private sendCommand(command: Command): void {
    const protoCommand: ProtoCommand = TelemetryMapper.toProtoCommand(command);
    this._call.write(protoCommand);
    this._commandCount++;
  }

  private handleError(error: Error): void {
    console.error(`[TelemetryStreamHandler] stream error: ${error.message}`);
  }

  private handleEnd(): void {
    console.log(
      `[TelemetryStreamHandler] stream ended. telemetry=${this._telemetryCount}, commands=${this._commandCount}`,
    );
    this._call.end();
  }

  private handleCancelled(): void {
    console.log("[TelemetryStreamHandler] stream cancelled by client.");
  }
}
