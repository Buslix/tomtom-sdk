import type { Point } from '../../types';
import { LAT_RANGE, LNG_RANGE } from './constants';

/**
 * Validates a point's coordinates. Throws if invalid (fail early).
 *
 * @param point - The point to validate.
 * @param label - Label for the point in error messages (e.g. "from", "to", "origin").
 * @param context - Prefix for error messages (e.g. "Calculate route", "Calculate reachable range").
 * @throws {Error} When lat or lng are out of valid WGS84 range.
 */
export function assertPointValid(
  point: Point,
  label: string,
  context: string,
): void {
  if (point == null) {
    throw new Error(`${context}: ${label} is required.`);
  }

  const { lat, lng } = point;

  if (typeof lat !== 'number' || lat < LAT_RANGE.min || lat > LAT_RANGE.max) {
    throw new Error(
      `${context}: ${label}.lat must be a number between ${LAT_RANGE.min} and ${LAT_RANGE.max}, got ${lat}.`,
    );
  }

  if (typeof lng !== 'number' || lng < LNG_RANGE.min || lng > LNG_RANGE.max) {
    throw new Error(
      `${context}: ${label}.lng must be a number between ${LNG_RANGE.min} and ${LNG_RANGE.max}, got ${lng}.`,
    );
  }
}

/**
 * Converts a Point (lat, lng) to the API location string format "lat,lng".
 *
 * @param point - Point (validated separately if required).
 * @returns Location string for the API path.
 */
export function pointToLocationString(point: Point): string {
  return `${point.lat},${point.lng}`;
}
