import { DroneTelemetryManager } from "../../domain/services/DroneTelemetryManager";
import { ProtoCommand, ProtoTelemetryData } from "./mappers/TelemetryMapper";
import { BidirectionalStream, TelemetryStreamHandler } from "./TelemetryStreamHandler";

export class MonitoreoFlotaService {
  private readonly _manager: DroneTelemetryManager;

  public constructor(manager: DroneTelemetryManager) {
    this._manager = manager;
  }

  public get manager(): DroneTelemetryManager {
    return this._manager;
  }

  public streamTelemetry(call: BidirectionalStream): void {
    const handler = new TelemetryStreamHandler(call, this._manager);
    handler.handle();
  }

  public toServiceImplementation(): Record<
    string,
    (call: BidirectionalStream) => void
  > {
    return {
      StreamTelemetry: (call: BidirectionalStream): void => this.streamTelemetry(call),
    };
  }
}
