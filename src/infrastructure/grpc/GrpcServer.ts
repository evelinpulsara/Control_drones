import * as grpc from "@grpc/grpc-js";
import { DroneTelemetryManager } from "../../domain/services/DroneTelemetryManager";
import { MonitoreoFlotaService } from "./MonitoreoFlotaService";
import { ProtoLoader } from "./ProtoLoader";

export class GrpcServer {
  private readonly _protoLoader: ProtoLoader;
  private readonly _service: MonitoreoFlotaService;
  private readonly _server: grpc.Server;
  private readonly _port: string;
  private _boundPort: number | null;

  public constructor(
    protoPath: string,
    manager: DroneTelemetryManager,
    port: string = "0.0.0.0:50051",
  ) {
    this._protoLoader = new ProtoLoader(protoPath);
    this._service = new MonitoreoFlotaService(manager);
    this._server = new grpc.Server();
    this._port = port;
    this._boundPort = null;
  }

  public get service(): MonitoreoFlotaService {
    return this._service;
  }

  public get boundPort(): number | null {
    return this._boundPort;
  }

  public start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const serviceDefinition = this._protoLoader.getServiceDefinition();
        this._server.addService(
          serviceDefinition.service,
          this._service.toServiceImplementation(),
        );

        this._server.bindAsync(
          this._port,
          grpc.ServerCredentials.createInsecure(),
          (error: Error | null, port: number) => {
            if (error) {
              reject(error);
              return;
            }
            this._boundPort = port;
            this._server.start();
            resolve();
          },
        );
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  public stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this._boundPort === null) {
        resolve();
        return;
      }
      this._server.tryShutdown(() => {
        this._boundPort = null;
        resolve();
      });
    });
  }
}
