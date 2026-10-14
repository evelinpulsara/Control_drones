import * as fs from "fs";
import * as path from "path";
import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";

export interface MonitoreoFlotaPackage {
  MonitoreoFlota: grpc.ServiceClientConstructor;
}

export interface ProtoPackage {
  agridrone: {
    telemetria: MonitoreoFlotaPackage;
  };
}

export class ProtoLoader {
  private readonly _protoPath: string;
  private readonly _options: protoLoader.Options;

  public constructor(protoPath: string, options?: protoLoader.Options) {
    if (!fs.existsSync(protoPath)) {
      throw new Error(`Proto file not found: ${protoPath}`);
    }
    this._protoPath = path.resolve(protoPath);
    this._options = {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      ...options,
    };
  }

  public get protoPath(): string {
    return this._protoPath;
  }

  public loadPackageDefinition(): ProtoPackage {
    const packageDefinition = protoLoader.loadSync(this._protoPath, this._options);
    return grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoPackage;
  }

  public getServiceDefinition(): grpc.ServiceClientConstructor {
    const packageDefinition = this.loadPackageDefinition();
    return packageDefinition.agridrone.telemetria.MonitoreoFlota;
  }
}
