export interface CoordinatesSnapshot {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude: number;
  readonly heading: number;
}

export class Coordinates {
  private readonly _latitude: number;
  private readonly _longitude: number;
  private readonly _altitude: number;
  private readonly _heading: number;

  private constructor(latitude: number, longitude: number, altitude: number, heading: number) {
    this._latitude = latitude;
    this._longitude = longitude;
    this._altitude = altitude;
    this._heading = heading;
  }

  public static create(
    latitude: number,
    longitude: number,
    altitude: number,
    heading: number,
  ): Coordinates {
    Coordinates.validate(latitude, longitude, altitude, heading);
    return new Coordinates(latitude, longitude, altitude, heading);
  }

  public static fromSnapshot(snapshot: CoordinatesSnapshot): Coordinates {
    return Coordinates.create(
      snapshot.latitude,
      snapshot.longitude,
      snapshot.altitude,
      snapshot.heading,
    );
  }

  public get latitude(): number {
    return this._latitude;
  }

  public get longitude(): number {
    return this._longitude;
  }

  public get altitude(): number {
    return this._altitude;
  }

  public get heading(): number {
    return this._heading;
  }

  public toSnapshot(): CoordinatesSnapshot {
    return {
      latitude: this._latitude,
      longitude: this._longitude,
      altitude: this._altitude,
      heading: this._heading,
    };
  }

  public withAltitude(altitude: number): Coordinates {
    return Coordinates.create(this._latitude, this._longitude, altitude, this._heading);
  }

  public withHeading(heading: number): Coordinates {
    return Coordinates.create(this._latitude, this._longitude, this._altitude, heading);
  }

  public equals(other: Coordinates): boolean {
    return (
      this._latitude === other._latitude &&
      this._longitude === other._longitude &&
      this._altitude === other._altitude &&
      this._heading === other._heading
    );
  }

  public distanceTo(other: Coordinates): number {
    const earthRadiusKm = 6371;
    const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

    const dLat = toRadians(other._latitude - this._latitude);
    const dLon = toRadians(other._longitude - this._longitude);
    const lat1 = toRadians(this._latitude);
    const lat2 = toRadians(other._latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c * 1000;
  }

  private static validate(
    latitude: number,
    longitude: number,
    altitude: number,
    heading: number,
  ): void {
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new RangeError(`Latitude must be between -90 and 90, received ${latitude}.`);
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new RangeError(`Longitude must be between -180 and 180, received ${longitude}.`);
    }
    if (!Number.isFinite(altitude)) {
      throw new RangeError(`Altitude must be a finite number, received ${altitude}.`);
    }
    if (!Number.isFinite(heading) || heading < 0 || heading >= 360) {
      throw new RangeError(`Heading must be between 0 (inclusive) and 360 (exclusive), received ${heading}.`);
    }
  }
}
