import type { CalculateRouteOptions } from '../../calculate-route/types';
import type { CalculateReachableRangeOptions } from '../../calculate-reachable-range/types';

/**
 * A single batch item for Calculate Route.
 * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/batch-routing/synchronous-batch
 */
export interface SyncBatchCalculateRouteItem {
  type: 'calculateRoute';
  options: CalculateRouteOptions;
}

/**
 * A single batch item for Calculate Reachable Range.
 */
export interface SyncBatchCalculateReachableRangeItem {
  type: 'calculateReachableRange';
  options: CalculateReachableRangeOptions;
}

/** One batch item: either a route or a reachable range request. */
export type SyncBatchItemRequest =
  | SyncBatchCalculateRouteItem
  | SyncBatchCalculateReachableRangeItem;

/** Request body for the synchronous batch API (batchItems built from item requests). */
export interface SyncBatchRequestBody {
  batchItems: Array<{
    query: string;
    post?: object;
  }>;
}

/**
 * One batch result item. statusCode is the HTTP status from the underlying endpoint;
 * response is the full response body (success or error).
 */
export interface SyncBatchItemResponse {
  statusCode: number;
  response: unknown;
}

/**
 * Successful synchronous batch response.
 * Each batchItems[].response matches the underlying endpoint (Calculate Route or Calculate Reachable Range).
 */
export interface SyncBatchResponse {
  formatVersion: string;
  batchItems: SyncBatchItemResponse[];
  summary: {
    successfulRequests: number;
    totalRequests: number;
  };
}

/** Maximum number of batch items for the synchronous batch API. */
export const SYNC_BATCH_MAX_ITEMS = 100;
