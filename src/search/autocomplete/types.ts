/**
 * Options for the Autocomplete API.
 * @see https://docs.tomtom.com/search-api/documentation/autocomplete-service/autocomplete
 */
export interface AutocompleteOptions {
  /**
   * Language for results (required by the API).
   * Use a TomTom IETF supported language tag (e.g. en-US).
   */
  language: string;

  /**
   * Maximum number of results.
   * @default 5
   * @min 1
   * @max 10
   */
  limit?: number;

  /**
   * Latitude to bias results. Must be used with lon.
   */
  lat?: number;

  /**
   * Longitude to bias results. Must be used with lat.
   */
  lon?: number;

  /**
   * Radius in meters (0–5000000). Use with lat and lon to constrain results to an area.
   */
  radius?: number;

  /**
   * Comma-separated country codes (e.g. FR,ES) to limit results.
   */
  countrySet?: string;

  /**
   * Comma-separated segment types to restrict results (e.g. category,brand).
   */
  resultSet?: string;
}

/** Match of a segment to the input query. */
export interface AutocompleteMatch {
  offset: number;
  length: number;
}

/** Segment in an autocomplete result (brand, category, or plaintext). */
export interface AutocompleteSegment {
  type: 'brand' | 'category' | 'plaintext' | string;
  value: string;
  matches: {
    inputQuery: AutocompleteMatch[];
  };
  /** Category ID (category segment only). */
  id?: string;
  /** Matched alternative name (category segment only). */
  matchedAlternativeName?: string;
}

/** Single autocomplete result (list of segments). */
export interface AutocompleteResult {
  segments: AutocompleteSegment[];
}

/** Geo bias in the response context. */
export interface AutocompleteGeoBias {
  position: { lat: number; lon: number };
  radius?: number;
}

/** Successful Autocomplete API response. */
export interface AutocompleteResponse {
  context: {
    inputQuery: string;
    geoBias?: AutocompleteGeoBias;
  };
  results: AutocompleteResult[];
}

/** Search API version for Autocomplete (fixed at 2). */
export const SEARCH_AUTOCOMPLETE_VERSION = '2';
