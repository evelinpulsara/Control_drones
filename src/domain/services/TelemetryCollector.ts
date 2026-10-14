import { Command } from "../value-objects/Command";
import { TelemetryData } from "../value-objects/TelemetryData";

export abstract class TelemetryCollector {
  private _isCollecting: boolean;

  protected constructor() {
    this._isCollecting = false;
  }

  public get isCollecting(): boolean {
    return this._isCollecting;
  }

  public start(): void {
    if (this._isCollecting) {
      return;
    }
    this._isCollecting = true;
    this.onStart();
  }

  public stop(): void {
    if (!this._isCollecting) {
      return;
    }
    this._isCollecting = false;
    this.onStop();
  }

  public collect(telemetry: TelemetryData): Command | null {
    if (!this._isCollecting) {
      throw new Error("TelemetryCollector is not started.");
    }
    const validated = this.validate(telemetry);
    this.onTelemetry(validated);
    return this.decideCommand(validated);
  }

  protected abstract validate(telemetry: TelemetryData): TelemetryData;

  protected abstract onTelemetry(telemetry: TelemetryData): void;

  protected abstract decideCommand(telemetry: TelemetryData): Command | null;

  protected abstract onStart(): void;

  protected abstract onStop(): void;
}
