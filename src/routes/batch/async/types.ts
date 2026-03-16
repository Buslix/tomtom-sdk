import type { SyncBatchItemRequest, SyncBatchRequestBody } from '../sync/types';

/** Re-use the same item and body types as sync batch. */
export type AsyncBatchItemRequest = SyncBatchItemRequest;
export type { SyncBatchRequestBody };

/**
 * Options for asynchronous batch submission.
 * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/batch-routing/asynchronous-batch-submission
 */
export interface SubmitAsyncBatchOptions {
  /**
   * Controls the HTTP code of the successful response.
   * - auto: HTTP 303, client may auto-redirect to download URL.
   * - manual: HTTP 202, client does not auto-redirect.
   * @default 'manual'
   */
  redirectMode?: 'auto' | 'manual';

  /**
   * Max time in seconds to wait for the download response when polling.
   * Passed to the Location URL. Value 5..60 or 120.
   * @default 120
   */
  waitTimeSeconds?: number;
}

/**
 * Result of a successful async batch submission.
 * Use the location URL with fetchBatchResults() or fetchBatchResultsByBatchId() to get the batch results.
 */
export interface SubmitAsyncBatchResult {
  /** URL to GET for batch results (same as the Location response header). */
  location: string;
}

/**
 * Options for fetching async batch results by batch ID.
 * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/batch-routing/asynchronous-batch-download
 */
export interface FetchBatchResultsOptions {
  /**
   * Max time in seconds to wait for the download response (blocking long-poll).
   * Value 5..60 or 120. If the batch is still processing after this time, the API returns 202 with a new Location.
   * @default 120
   */
  waitTimeSeconds?: number;
}

/** Maximum number of batch items for the asynchronous batch API. */
export const ASYNC_BATCH_MAX_ITEMS = 700;
