export enum BatteryHealth {
  UNSPECIFIED = "BATTERY_HEALTH_UNSPECIFIED",
  GOOD = "BATTERY_HEALTH_GOOD",
  WARNING = "BATTERY_HEALTH_WARNING",
  CRITICAL = "BATTERY_HEALTH_CRITICAL",
}

export const BATTERY_HEALTH_VALUES: ReadonlySet<BatteryHealth> = new Set<BatteryHealth>(
  Object.values(BatteryHealth),
);

export function isValidBatteryHealth(value: unknown): value is BatteryHealth {
  return (
    typeof value === "string" &&
    BATTERY_HEALTH_VALUES.has(value as BatteryHealth)
  );
}
