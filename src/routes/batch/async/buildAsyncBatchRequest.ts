import { buildBatchRequestBody } from '../sync/buildSyncBatchRequest';
import type { AsyncBatchItemRequest, SyncBatchRequestBody } from './types';
import { ASYNC_BATCH_MAX_ITEMS } from './types';

/**
 * Builds the request body for the asynchronous batch submission endpoint.
 * Validates that the number of items is between 1 and 700 (inclusive).
 *
 * @param items - Array of batch items (each is either a route or a reachable range request).
 * @returns Body to send as JSON in POST to /routing/1/batch/json
 * @throws Error if items length is 0 or > 700, or if any item validation fails.
 * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/batch-routing/asynchronous-batch-submission
 */
export function buildAsyncBatchRequest(
  items: AsyncBatchItemRequest[],
): SyncBatchRequestBody {
  return buildBatchRequestBody(items, ASYNC_BATCH_MAX_ITEMS);
}
