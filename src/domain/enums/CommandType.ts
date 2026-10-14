export enum CommandType {
  UNSPECIFIED = "COMMAND_TYPE_UNSPECIFIED",
  TAKEOFF = "COMMAND_TYPE_TAKEOFF",
  LAND = "COMMAND_TYPE_LAND",
  RETURN_TO_BASE = "COMMAND_TYPE_RETURN_TO_BASE",
  ADJUST_ALTITUDE = "COMMAND_TYPE_ADJUST_ALTITUDE",
  EMERGENCY_STOP = "COMMAND_TYPE_EMERGENCY_STOP",
  HOVER = "COMMAND_TYPE_HOVER",
  WAYPOINT = "COMMAND_TYPE_WAYPOINT",
}

export const COMMAND_TYPE_VALUES: ReadonlySet<CommandType> = new Set<CommandType>(
  Object.values(CommandType),
);

export function isValidCommandType(value: unknown): value is CommandType {
  return (
    typeof value === "string" &&
    COMMAND_TYPE_VALUES.has(value as CommandType)
  );
}
