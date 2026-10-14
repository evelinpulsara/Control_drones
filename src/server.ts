import * as path from "path";
import { Drone } from "./domain/entities/Drone";
import { DroneTelemetryManager } from "./domain/services/DroneTelemetryManager";
import { GrpcServer } from "./infrastructure/grpc/GrpcServer";

const PROTO_PATH = path.resolve(__dirname, "..", "protos", "drone_telemetria.proto");
const PORT = process.env.GRPC_PORT ?? "0.0.0.0:50051";

async function bootstrap(): Promise<void> {
  const manager = new DroneTelemetryManager();

  const droneA = new Drone("drone-alpha-001");
  const droneB = new Drone("drone-beta-002");
  manager.registerDrone(droneA);
  manager.registerDrone(droneB);

  manager.start();

  const server = new GrpcServer(PROTO_PATH, manager, PORT);

  try {
    await server.start();
    console.log(`gRPC MonitoreoFlota server listening on ${server.boundPort}`);
    console.log(`Fleet size: ${manager.getFleetSize()} drone(s)`);
  } catch (error) {
    console.error("Failed to start gRPC server:", error);
    process.exit(1);
  }

  const shutdown = async (): Promise<void> => {
    console.log("\nShutting down gRPC server...");
    await server.stop();
    manager.stop();
    console.log("Server stopped.");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void bootstrap();
