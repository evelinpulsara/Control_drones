import { BatteryHealth, isValidBatteryHealth } from "../enums/BatteryHealth";

export interface BatterySnapshot {
  readonly level: number;
  readonly voltage: number;
  readonly current: number;
  readonly temperature: number;
  readonly cycles: number;
  readonly health: BatteryHealth;
}

export class Battery {
  private readonly _level: number;
  private readonly _voltage: number;
  private readonly _current: number;
  private readonly _temperature: number;
  private readonly _cycles: number;
  private readonly _health: BatteryHealth;

  private constructor(
    level: number,
    voltage: number,
    current: number,
    temperature: number,
    cycles: number,
    health: BatteryHealth,
  ) {
    this._level = level;
    this._voltage = voltage;
    this._current = current;
    this._temperature = temperature;
    this._cycles = cycles;
    this._health = health;
  }

  public static create(
    level: number,
    voltage: number,
    current: number,
    temperature: number,
    cycles: number,
    health?: BatteryHealth,
  ): Battery {
    Battery.validate(level, voltage, current, temperature, cycles);
    const resolvedHealth = health ?? Battery.deriveHealth(level, temperature);
    return new Battery(level, voltage, current, temperature, cycles, resolvedHealth);
  }

  public static fromSnapshot(snapshot: BatterySnapshot): Battery {
    if (!isValidBatteryHealth(snapshot.health)) {
      throw new TypeError(`Invalid battery health value: ${String(snapshot.health)}`);
    }
    return Battery.create(
      snapshot.level,
      snapshot.voltage,
      snapshot.current,
      snapshot.temperature,
      snapshot.cycles,
      snapshot.health,
    );
  }

  public get level(): number {
    return this._level;
  }

  public get voltage(): number {
    return this._voltage;
  }

  public get current(): number {
    return this._current;
  }

  public get temperature(): number {
    return this._temperature;
  }

  public get cycles(): number {
    return this._cycles;
  }

  public get health(): BatteryHealth {
    return this._health;
  }

  public toSnapshot(): BatterySnapshot {
    return {
      level: this._level,
      voltage: this._voltage,
      current: this._current,
      temperature: this._temperature,
      cycles: this._cycles,
      health: this._health,
    };
  }

  public isLow(threshold: number = 20): boolean {
    return this._level <= threshold;
  }

  public isCritical(threshold: number = 10): boolean {
    return this._level <= threshold;
  }

  public isCharging(): boolean {
    return this._current < 0;
  }

  public isOverheating(maxTemperature: number = 60): boolean {
    return this._temperature >= maxTemperature;
  }

  public withLevel(level: number): Battery {
    return Battery.create(level, this._voltage, this._current, this._temperature, this._cycles);
  }

  public equals(other: Battery): boolean {
    return (
      this._level === other._level &&
      this._voltage === other._voltage &&
      this._current === other._current &&
      this._temperature === other._temperature &&
      this._cycles === other._cycles &&
      this._health === other._health
    );
  }

  private static deriveHealth(level: number, temperature: number): BatteryHealth {
    if (level <= 10 || temperature >= 60) {
      return BatteryHealth.CRITICAL;
    }
    if (level <= 20 || temperature >= 50) {
      return BatteryHealth.WARNING;
    }
    return BatteryHealth.GOOD;
  }

  private static validate(
    level: number,
    voltage: number,
    current: number,
    temperature: number,
    cycles: number,
  ): void {
    if (!Number.isFinite(level) || level < 0 || level > 100) {
      throw new RangeError(`Battery level must be between 0 and 100, received ${level}.`);
    }
    if (!Number.isFinite(voltage) || voltage < 0) {
      throw new RangeError(`Battery voltage must be a non-negative finite number, received ${voltage}.`);
    }
    if (!Number.isFinite(current)) {
      throw new RangeError(`Battery current must be a finite number, received ${current}.`);
    }
    if (!Number.isFinite(temperature)) {
      throw new RangeError(`Battery temperature must be a finite number, received ${temperature}.`);
    }
    if (!Number.isInteger(cycles) || cycles < 0) {
      throw new RangeError(`Battery cycles must be a non-negative integer, received ${cycles}.`);
    }
  }
}
