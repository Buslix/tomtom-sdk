import type {
  CalculateRouteOptions,
  CalculateRouteResponseFor,
  CalculateRouteErrorResponse,
} from '../routes/calculate-route/types';
import { TomTomRoutingError } from '../routes/calculate-route/types';
import { buildCalculateRouteRequest } from '../routes/calculate-route';
import type {
  CalculateReachableRangeOptions,
  CalculateReachableRangeResponse,
  CalculateReachableRangeErrorResponse,
} from '../routes/calculate-reachable-range/types';
import { buildCalculateReachableRangeRequest } from '../routes/calculate-reachable-range';
import type {
  SyncBatchItemRequest,
  SyncBatchResponse,
} from '../routes/batch/sync';
import { buildSyncBatchRequest } from '../routes/batch/sync';
import type {
  AsyncBatchItemRequest,
  SubmitAsyncBatchOptions,
  SubmitAsyncBatchResult,
  FetchBatchResultsOptions,
} from '../routes/batch/async';
import { buildAsyncBatchRequest } from '../routes/batch/async';
import type {
  AutocompleteOptions,
  AutocompleteResponse,
} from '../search/autocomplete';
import { buildAutocompleteRequest } from '../search/autocomplete';

function isErrorResponse(
  data: unknown,
): data is CalculateRouteErrorResponse | CalculateReachableRangeErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'detailedError' in data &&
    typeof (data as { detailedError: unknown }).detailedError === 'object'
  );
}

/**
 * TomTom Routing API client.
 * @see https://developer.tomtom.com/routing-api/documentation/tomtom-maps/calculate-route
 */
class TomTom {
  public baseUrl = 'https://api.tomtom.com';

  /**
   * @param apiKey - Your TomTom API key.
   * @param versionNumber - Routing API version (default: '1').
   */
  constructor(
    public readonly apiKey: string,
    public readonly versionNumber: string = '1',
  ) {}

  /**
   * Calculate a route between an origin and a destination, with optional waypoints.
   * Uses GET when no body is provided, POST when options.body is set.
   *
   * Response type is inferred from the request: e.g. `body.reassessmentParameterSets` → `routeReassessments` required on each route;
   * `computeBestOrder: true` → `optimizedWaypoints` required; `computeTravelTimeFor: 'all'` → extra travel time fields required in summaries.
   *
   * @throws {TomTomRoutingError} When the API returns an error (e.g. MAP_MATCHING_FAILURE, NO_ROUTE_FOUND).
   */
  async calculateRoute<O extends CalculateRouteOptions>(
    options: O,
  ): Promise<CalculateRouteResponseFor<O>> {
    const { path, queryString, body } = buildCalculateRouteRequest(options);

    const url = this.buildUrl(path, queryString);

    const init: RequestInit = {
      method: body ? 'POST' : 'GET',
      headers: {
        'Accept-Encoding': 'gzip',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const response = await fetch(
      `${this.baseUrl}/routing/${this.versionNumber}${url}`,
      init,
    );

    const data = (await response.json()) as
      | CalculateRouteResponseFor<O>
      | CalculateRouteErrorResponse;

    if (!response.ok) {
      if (isErrorResponse(data)) {
        const { code, message } = data.detailedError;

        throw new TomTomRoutingError(message, code, response.status, message);
      }

      throw new TomTomRoutingError(
        `Request failed with status ${response.status}`,
        'HTTP_ERROR',
        response.status,
      );
    }

    if (isErrorResponse(data)) {
      const { code, message } = data.detailedError;

      throw new TomTomRoutingError(message, code, response.status, message);
    }

    return data as CalculateRouteResponseFor<O>;
  }

  /**
   * Calculate the reachable range from an origin given a budget (fuel, energy, time, or distance).
   * Uses GET when no body fields are set; uses POST when supportingPoints, avoidVignette, or avoidAreas are set.
   *
   * @param options - Origin, exactly one budget, and optional query/body fields.
   * @returns Reachable range polygon (center and boundary).
   * @throws {TomTomRoutingError} When the API returns an error (e.g. MAP_MATCHING_FAILURE, NO_RANGE_FOUND).
   * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/calculate-reachable-range
   */
  async calculateReachableRange(
    options: CalculateReachableRangeOptions,
  ): Promise<CalculateReachableRangeResponse> {
    const { path, queryString, body } =
      buildCalculateReachableRangeRequest(options);

    const url = this.buildUrl(path, queryString);

    const init: RequestInit = {
      method: body ? 'POST' : 'GET',
      headers: {
        'Accept-Encoding': 'gzip',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const response = await fetch(
      `${this.baseUrl}/routing/${this.versionNumber}${url}`,
      init,
    );

    const data = (await response.json()) as
      | CalculateReachableRangeResponse
      | CalculateReachableRangeErrorResponse;

    if (!response.ok) {
      if (isErrorResponse(data)) {
        const { code, message } = data.detailedError;

        throw new TomTomRoutingError(message, code, response.status, message);
      }

      throw new TomTomRoutingError(
        `Request failed with status ${response.status}`,
        'HTTP_ERROR',
        response.status,
      );
    }

    if (isErrorResponse(data)) {
      const { code, message } = data.detailedError;

      throw new TomTomRoutingError(message, code, response.status, message);
    }

    return data;
  }

  /**
   * Run a synchronous batch of route and/or reachable-range requests.
   * Supports up to 100 items; the call may return HTTP 408 if processing exceeds 60 seconds.
   *
   * @param items - Array of batch items (each is either a route or a reachable range request).
   * @returns Batch response with statusCode and response per item (response is the underlying endpoint JSON).
   * @throws {TomTomRoutingError} When the batch request fails (e.g. 400, 408, 403, 429).
   * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/batch-routing/synchronous-batch
   */
  async syncBatch(items: SyncBatchItemRequest[]): Promise<SyncBatchResponse> {
    const body = buildSyncBatchRequest(items);

    const url = `${this.baseUrl}/routing/${this.versionNumber}/batch/sync/json?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as
      | SyncBatchResponse
      | {
          error?: { description?: string };
          detailedError?: { code?: string; message?: string };
        };

    if (!response.ok) {
      const message =
        typeof (data as { error?: { description?: string } }).error
          ?.description === 'string'
          ? (data as { error: { description: string } }).error.description
          : ((data as { detailedError?: { message?: string } }).detailedError
              ?.message ?? `Request failed with status ${response.status}`);

      const code =
        (data as { detailedError?: { code?: string } }).detailedError?.code ??
        'HTTP_ERROR';

      throw new TomTomRoutingError(message, code, response.status, message);
    }

    return data as SyncBatchResponse;
  }

  /**
   * Submit a batch for asynchronous processing (up to 700 items).
   * Returns the Location URL; use fetchBatchResults(location) to poll for results.
   *
   * @param items - Array of batch items (route and/or reachable range requests).
   * @param options - redirectMode ('manual' → 202, 'auto' → 303), waitTimeSeconds (5..60 or 120).
   * @returns { location } URL to GET for results.
   * @throws {TomTomRoutingError} When the submission fails (e.g. 400, 403, 429).
   * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/batch-routing/asynchronous-batch-submission
   */
  async submitBatchAsync(
    items: AsyncBatchItemRequest[],
    options: SubmitAsyncBatchOptions = {},
  ): Promise<SubmitAsyncBatchResult> {
    const body = buildAsyncBatchRequest(items);
    const { redirectMode = 'manual', waitTimeSeconds } = options;
    const params = new URLSearchParams({ key: this.apiKey, redirectMode });
    if (waitTimeSeconds !== undefined) {
      params.set('waitTimeSeconds', String(waitTimeSeconds));
    }

    const url = `${this.baseUrl}/routing/${this.versionNumber}/batch/json?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
      },
      body: JSON.stringify(body),
      redirect: 'manual',
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      let code = 'HTTP_ERROR';
      try {
        const data = (await response.json()) as
          | {
              error?: { description?: string };
              detailedError?: { message?: string; code?: string };
            }
          | undefined;
        if (data) {
          message =
            data.error?.description ?? data.detailedError?.message ?? message;
          code = data.detailedError?.code ?? code;
        }
      } catch {
        // No body or invalid JSON
      }

      throw new TomTomRoutingError(message, code, response.status, message);
    }

    const location = response.headers.get('Location');
    if (!location) {
      throw new TomTomRoutingError(
        'Async batch submission did not return a Location header',
        'HTTP_ERROR',
        response.status,
      );
    }

    return { location };
  }

  /**
   * Fetch batch results from the full URL returned by submitBatchAsync (or the 202 Location header).
   * On 200 returns the batch response; on 202 (still processing) throws; retry with the new Location or fetchBatchResultsByBatchId(batchId).
   *
   * @param locationUrl - Full URL from submitBatchAsync result (or 202 Location header).
   * @returns Batch response with statusCode and response per item.
   * @throws {TomTomRoutingError} When the request fails or batch is still processing (202).
   * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/batch-routing/asynchronous-batch-download
   */
  async fetchBatchResults(locationUrl: string): Promise<SyncBatchResponse> {
    const url = locationUrl.startsWith('http')
      ? locationUrl
      : `${this.baseUrl}${locationUrl}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept-Encoding': 'gzip', Accept: 'application/json' },
    });

    return this.fetchBatchResultsFromResponse(response);
  }

  /**
   * Fetch batch results by batch ID (from the submission Location header path).
   * Uses GET /routing/{version}/batch/{batchId} with optional waitTimeSeconds for the blocking long-poll.
   * On 200 returns the batch response; on 202 (still processing) throws; retry with the same batchId or the returned Location.
   *
   * @param batchId - Unique batch ID from the submission Location header (path segment).
   * @param options - waitTimeSeconds (5..60 or 120) for the download long-poll.
   * @returns Batch response with statusCode and response per item.
   * @throws {TomTomRoutingError} When the request fails or batch is still processing (202).
   * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/batch-routing/asynchronous-batch-download
   */
  async fetchBatchResultsByBatchId(
    batchId: string,
    options?: FetchBatchResultsOptions,
  ): Promise<SyncBatchResponse> {
    const params = new URLSearchParams({ key: this.apiKey });
    if (options?.waitTimeSeconds !== undefined) {
      params.set('waitTimeSeconds', String(options.waitTimeSeconds));
    }

    const url = `${this.baseUrl}/routing/${this.versionNumber}/batch/${encodeURIComponent(batchId)}?${params.toString()}`;

    return this.fetchBatchResults(url);
  }

  /**
   * Autocomplete: recognize entities in a query and return them as query terms.
   * Uses the Search API (version 2).
   *
   * @param query - Search query string.
   * @param options - language (required), limit, lat, lon, radius, countrySet, resultSet.
   * @returns Autocomplete response with context and results (segments: brand, category, plaintext).
   * @throws {TomTomRoutingError} When the request fails (e.g. 400, 403, 429).
   * @see https://docs.tomtom.com/search-api/documentation/autocomplete-service/autocomplete
   */
  async autocomplete(
    query: string,
    options: AutocompleteOptions,
  ): Promise<AutocompleteResponse> {
    const { path, queryString } = buildAutocompleteRequest(query, options);
    const url = this.buildUrl(path, queryString);

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'GET',
      headers: { 'Accept-Encoding': 'gzip' },
    });

    const data = (await response.json()) as
      | AutocompleteResponse
      | { detailedError?: { code?: string; message?: string } };

    if (!response.ok) {
      const message =
        (data as { detailedError?: { message?: string } }).detailedError
          ?.message ?? `Request failed with status ${response.status}`;
      const code =
        (data as { detailedError?: { code?: string } }).detailedError?.code ??
        'HTTP_ERROR';
      throw new TomTomRoutingError(message, code, response.status, message);
    }

    return data as AutocompleteResponse;
  }

  private async fetchBatchResultsFromResponse(
    response: Response,
  ): Promise<SyncBatchResponse> {
    if (response.status === 202) {
      const retryLocation = response.headers.get('Location');
      throw new TomTomRoutingError(
        retryLocation
          ? `Batch still processing; retry with fetchBatchResults('${retryLocation}') or fetchBatchResultsByBatchId(batchId)`
          : 'Batch still processing; retry later',
        'BatchRequestTimeout',
        response.status,
        undefined,
      );
    }

    const data = (await response.json()) as
      | SyncBatchResponse
      | {
          error?: { description?: string };
          detailedError?: { code?: string; message?: string };
        };

    if (!response.ok) {
      const message =
        (data as { error?: { description?: string } }).error?.description ??
        (data as { detailedError?: { message?: string } }).detailedError
          ?.message ??
        `Request failed with status ${response.status}`;
      const code =
        (data as { detailedError?: { code?: string } }).detailedError?.code ??
        'HTTP_ERROR';
      throw new TomTomRoutingError(message, code, response.status, message);
    }

    return data as SyncBatchResponse;
  }

  private buildUrl(path: string, queryString: string): string {
    const prefix = queryString.length > 0 ? `${queryString}&` : '?';

    return `${path}${prefix}key=${this.apiKey}`;
  }
}

export { TomTom };
