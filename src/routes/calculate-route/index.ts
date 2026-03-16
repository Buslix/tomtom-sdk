import type { Point } from '../../types';
import type { CalculateRouteOptions, CalculateRoutePostBody } from './types';
import { assertPointValid, pointToLocationString } from '../shared';

const CONTENT_TYPE = 'json';

const ROUTE_CONTEXT = 'Calculate route';

/** Keys that are sent in the POST body only (not query params). */
const BODY_KEYS: ReadonlyArray<keyof CalculateRoutePostBody> = [
  'supportingPoints',
  'encodedPolyline',
  'encodedPolylinePrecision',
  'pointWaypoints',
  'avoidVignette',
  'reassessmentParameterSets',
  'legs',
];

/** Maximum number of waypoints allowed by the TomTom Calculate Route API. */
const MAX_WAYPOINTS = 150;

/**
 * Builds the routePlanningLocations path segment: origin:waypoint1:...:destination.
 * Call only after validating from, to, and waypoints.
 *
 * @param from - Origin point.
 * @param to - Destination point.
 * @param waypoints - Optional waypoints (already validated count).
 * @returns Colon-delimited location string for the path.
 */
function buildRoutePlanningLocations(
  from: Point,
  to: Point,
  waypoints?: Point[],
): string {
  const all = [from, ...(waypoints ?? []), to];

  return all.map(pointToLocationString).join(':');
}

/** Query parameter keys that accept multiple values (repeated params). */
const MULTI_VALUE_KEYS = new Set([
  'sectionType',
  'avoid',
  'extendedRouteRepresentation',
  'vehicleLoadType',
]);

/**
 * Builds the POST body object from options. Only includes keys that are defined.
 *
 * @param options - Full options (may contain body fields).
 * @returns Body object or undefined if no body fields are set.
 */
function buildBody(
  options: CalculateRouteOptions,
): CalculateRoutePostBody | undefined {
  let hasBody = false;

  const body: CalculateRoutePostBody = {};

  for (const key of BODY_KEYS) {
    const value = options[key];

    if (value !== undefined && value !== null) {
      (body as Record<string, unknown>)[key] = value;
      hasBody = true;
    }
  }

  return hasBody ? body : undefined;
}

/**
 * Returns options with from, to, waypoints, and body keys omitted (query params only).
 */
function getQueryParamsOnly(
  options: CalculateRouteOptions,
): Omit<CalculateRouteOptions, 'from' | 'to' | 'waypoints'> {
  const { from, to, waypoints, ...rest } = options;

  const bodyKeySet = new Set(BODY_KEYS);

  const queryOnly: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (!bodyKeySet.has(key as keyof CalculateRoutePostBody)) {
      queryOnly[key] = value;
    }
  }

  return queryOnly as Omit<CalculateRouteOptions, 'from' | 'to' | 'waypoints'>;
}

/**
 * Serializes query params. Multi-value keys are appended as repeated params; other arrays are joined with commas.
 *
 * @param options - Query params only (no from, to, waypoints, or body keys).
 * @returns Query string with leading '?' or empty string.
 */
function buildQueryString(
  options: Omit<CalculateRouteOptions, 'from' | 'to' | 'waypoints'>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value === undefined || value === null) continue;

    if (MULTI_VALUE_KEYS.has(key) && Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
    } else if (Array.isArray(value)) {
      params.append(key, value.map(String).join(','));
    } else {
      params.append(key, String(value));
    }
  }

  const str = params.toString();

  return str ? `?${str}` : '';
}

export interface BuildCalculateRouteRequestResult {
  /** Path including routePlanningLocations and contentType. */
  path: string;
  /** Query string including leading '?' or empty string. */
  queryString: string;
  /** POST body when body was provided in options; undefined for GET. */
  body?: CalculateRoutePostBody;
}

/**
 * Builds the Calculate Route request: path, query string, and optional POST body.
 * Validates inputs first (fail early). Use GET when body is omitted; use POST when body is provided.
 *
 * @param options - Route options (from, to, optional waypoints and body).
 * @returns Path, query string, and optional body for the request.
 * @throws {Error} When from/to are missing or invalid, or when waypoints exceed MAX_WAYPOINTS.
 */
export function buildCalculateRouteRequest(
  options: CalculateRouteOptions,
): BuildCalculateRouteRequestResult {
  if (options == null || typeof options !== 'object') {
    throw new Error(`${ROUTE_CONTEXT}: options must be a non-null object.`);
  }

  const { from, to, waypoints } = options;

  assertPointValid(from, 'from', ROUTE_CONTEXT);
  assertPointValid(to, 'to', ROUTE_CONTEXT);

  if (waypoints != null) {
    if (!Array.isArray(waypoints)) {
      throw new Error(`${ROUTE_CONTEXT}: waypoints must be an array.`);
    }

    if (waypoints.length > MAX_WAYPOINTS) {
      throw new Error(
        `${ROUTE_CONTEXT}: waypoints length must be at most ${MAX_WAYPOINTS}, got ${waypoints.length}.`,
      );
    }

    waypoints.forEach((p, i) =>
      assertPointValid(p, `waypoint ${i}`, ROUTE_CONTEXT),
    );
  }

  const body = buildBody(options);

  const queryParams = getQueryParamsOnly(options);

  const routePlanningLocations = buildRoutePlanningLocations(
    from,
    to,
    waypoints,
  );

  const path = `/calculateRoute/${routePlanningLocations}/${CONTENT_TYPE}`;

  const queryString = buildQueryString(queryParams);

  return {
    path,
    queryString,
    body,
  };
}
