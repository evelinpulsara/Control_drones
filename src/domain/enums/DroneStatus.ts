export enum DroneStatus {
  UNSPECIFIED = "DRONE_STATUS_UNSPECIFIED",
  IDLE = "DRONE_STATUS_IDLE",
  TAKEOFF = "DRONE_STATUS_TAKEOFF",
  FLYING = "DRONE_STATUS_FLYING",
  HOVERING = "DRONE_STATUS_HOVERING",
  LANDING = "DRONE_STATUS_LANDING",
  RETURN_TO_BASE = "DRONE_STATUS_RETURN_TO_BASE",
  EMERGENCY = "DRONE_STATUS_EMERGENCY",
}

export const DRONE_STATUS_VALUES: ReadonlySet<DroneStatus> = new Set<DroneStatus>(
  Object.values(DroneStatus),
);

export function isValidDroneStatus(value: unknown): value is DroneStatus {
  return typeof value === "string" && DRONE_STATUS_VALUES.has(value as DroneStatus);
}
