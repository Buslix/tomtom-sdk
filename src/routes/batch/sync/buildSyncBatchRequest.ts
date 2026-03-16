import { buildCalculateRouteRequest } from '../../calculate-route';
import { buildCalculateReachableRangeRequest } from '../../calculate-reachable-range';
import type { SyncBatchItemRequest, SyncBatchRequestBody } from './types';
import { SYNC_BATCH_MAX_ITEMS } from './types';

const BATCH_CONTEXT = 'Sync batch';

/**
 * Builds the batch request body (query + optional post per item).
 * Shared by sync and async batch endpoints.
 *
 * @param items - Array of batch items (each is either a route or a reachable range request).
 * @param maxItems - Maximum allowed number of items (100 for sync, 700 for async).
 * @returns Body to send as JSON in POST to batch endpoint.
 * @throws Error if items length is 0 or > maxItems, or if any item validation fails.
 */
export function buildBatchRequestBody(
  items: SyncBatchItemRequest[],
  maxItems: number,
): SyncBatchRequestBody {
  if (!Array.isArray(items)) {
    throw new Error(`${BATCH_CONTEXT}: items must be an array.`);
  }

  if (items.length === 0) {
    throw new Error(`${BATCH_CONTEXT}: at least one batch item is required.`);
  }

  if (items.length > maxItems) {
    throw new Error(
      `${BATCH_CONTEXT}: at most ${maxItems} items allowed, got ${items.length}.`,
    );
  }

  const batchItems = items.map((item): { query: string; post?: object } => {
    if (item.type === 'calculateRoute') {
      const { path, queryString, body } = buildCalculateRouteRequest(
        item.options,
      );

      return {
        query: path + queryString,
        ...(body != null && Object.keys(body).length > 0 && { post: body }),
      };
    }

    const { path, queryString, body } = buildCalculateReachableRangeRequest(
      item.options,
    );

    return {
      query: path + queryString,
      ...(body != null && Object.keys(body).length > 0 && { post: body }),
    };
  });

  return { batchItems };
}

/**
 * Builds the request body for the synchronous batch endpoint.
 * Validates that the number of items is between 1 and 100 (inclusive).
 *
 * @param items - Array of batch items (each is either a route or a reachable range request).
 * @returns Body to send as JSON in POST to /routing/1/batch/sync/json
 * @throws Error if items length is 0 or > 100, or if any item validation fails (via route/range builders).
 */
export function buildSyncBatchRequest(
  items: SyncBatchItemRequest[],
): SyncBatchRequestBody {
  return buildBatchRequestBody(items, SYNC_BATCH_MAX_ITEMS);
}
