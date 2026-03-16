import type { AutocompleteOptions } from './types';
import { SEARCH_AUTOCOMPLETE_VERSION } from './types';

const AUTOCOMPLETE_CONTEXT = 'Autocomplete';

const LIMIT_MIN = 1;
const LIMIT_MAX = 10;
const LIMIT_DEFAULT = 5;
const RADIUS_MIN = 0;
const RADIUS_MAX = 5_000_000;

/**
 * Builds path and query string for the Autocomplete GET request.
 * Does not include the API key (client adds it).
 *
 * @param query - Search query string (will be URL-encoded in the path).
 * @param options - language (required), limit, lat, lon, radius, countrySet, resultSet.
 * @returns { path, queryString } for GET /search/2/autocomplete/{query}.json?...
 * @throws Error if options are invalid (e.g. missing language, invalid limit/radius).
 */
export function buildAutocompleteRequest(
  query: string,
  options: AutocompleteOptions,
): { path: string; queryString: string } {
  if (options.language == null || String(options.language).trim() === '') {
    throw new Error(
      `${AUTOCOMPLETE_CONTEXT}: language is required (e.g. 'en-US').`,
    );
  }

  const limit = options.limit ?? LIMIT_DEFAULT;
  if (limit < LIMIT_MIN || limit > LIMIT_MAX) {
    throw new Error(
      `${AUTOCOMPLETE_CONTEXT}: limit must be between ${LIMIT_MIN} and ${LIMIT_MAX}, got ${limit}.`,
    );
  }

  const hasLat = options.lat !== undefined && options.lat !== null;
  const hasLon = options.lon !== undefined && options.lon !== null;
  if (hasLat !== hasLon) {
    throw new Error(
      `${AUTOCOMPLETE_CONTEXT}: lat and lon must be used together.`,
    );
  }

  if (options.radius !== undefined && options.radius !== null) {
    if (!hasLat || !hasLon) {
      throw new Error(
        `${AUTOCOMPLETE_CONTEXT}: radius must be used with lat and lon.`,
      );
    }

    const r = options.radius;
    if (r < RADIUS_MIN || r > RADIUS_MAX) {
      throw new Error(
        `${AUTOCOMPLETE_CONTEXT}: radius must be between ${RADIUS_MIN} and ${RADIUS_MAX} meters, got ${r}.`,
      );
    }
  }

  const encodedQuery = encodeURIComponent(query);
  const path = `/search/${SEARCH_AUTOCOMPLETE_VERSION}/autocomplete/${encodedQuery}.json`;

  const params = new URLSearchParams();
  params.set('language', options.language);
  params.set('limit', String(limit));
  if (options.lat != null) params.set('lat', String(options.lat));
  if (options.lon != null) params.set('lon', String(options.lon));
  if (options.radius != null) params.set('radius', String(options.radius));
  if (options.countrySet != null && options.countrySet !== '')
    params.set('countrySet', options.countrySet);
  if (options.resultSet != null && options.resultSet !== '')
    params.set('resultSet', options.resultSet);

  const queryString = params.toString();

  return {
    path,
    queryString: queryString ? `?${queryString}` : '',
  };
}
