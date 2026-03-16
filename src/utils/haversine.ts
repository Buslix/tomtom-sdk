import type { Point } from '../types';

/** Earth radius in meters (WGS84). */
const EARTH_RADIUS_M = 6_371_000;

/**
 * Haversine distance between two points on Earth (great-circle distance).
 *
 * @param a - First point (lat, lng in degrees).
 * @param b - Second point (lat, lng in degrees).
 * @param unit - Return value in `'m'` (meters) or `'km'` (kilometers). Default `'m'`.
 * @returns Distance in the requested unit.
 *
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */
export function haversineDistance(
  a: Point,
  b: Point,
  unit: 'm' | 'km' = 'm',
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const lat1Rad = toRad(a.lat);

  const lat2Rad = toRad(b.lat);

  const deltaLatRad = toRad(b.lat - a.lat);

  const deltaLngRad = toRad(b.lng - a.lng);

  const sinHalfDeltaLat = Math.sin(deltaLatRad / 2);

  const sinHalfDeltaLng = Math.sin(deltaLngRad / 2);

  const haversineA =
    sinHalfDeltaLat * sinHalfDeltaLat +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * sinHalfDeltaLng * sinHalfDeltaLng;

  const centralAngleRad =
    2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

  const radius = unit === 'km' ? EARTH_RADIUS_M / 1000 : EARTH_RADIUS_M;

  return radius * centralAngleRad;
}
