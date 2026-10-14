import { Command } from "../value-objects/Command";
import { TelemetryData } from "../value-objects/TelemetryData";

export interface ITelemetrySink {
  ingest(telemetry: TelemetryData): void;
}

export interface ICommandEmitter {
  emit(command: Command): void;
}

export interface IBidirectionalStream extends ITelemetrySink, ICommandEmitter {
  readonly isOpen: boolean;
  close(): void;
}

export interface ITelemetryStreamHandler {
  handleTelemetry(telemetry: TelemetryData): Command | null;
  handleError(error: Error): void;
  handleComplete(): void;
}
