import { buildSyncBatchRequest } from '../buildSyncBatchRequest';
import { SYNC_BATCH_MAX_ITEMS } from '../types';

describe('buildSyncBatchRequest', () => {
  const routeItem = {
    type: 'calculateRoute' as const,
    options: {
      from: { lat: 52.50931, lng: 13.42936 },
      to: { lat: 52.50274, lng: 13.43872 },
    },
  };

  const rangeItem = {
    type: 'calculateReachableRange' as const,
    options: {
      origin: { lat: 52.36188, lng: 4.85056 },
      timeBudgetInSec: 1800,
    },
  };

  it('throws when items is empty', () => {
    expect(() => buildSyncBatchRequest([])).toThrow(
      /at least one batch item is required/,
    );
  });

  it('throws when items exceed max', () => {
    const items = Array.from(
      { length: SYNC_BATCH_MAX_ITEMS + 1 },
      () => routeItem,
    );

    expect(() => buildSyncBatchRequest(items)).toThrow(
      new RegExp(`at most ${SYNC_BATCH_MAX_ITEMS} items allowed`),
    );
  });

  it('throws when items is not an array', () => {
    expect(() => buildSyncBatchRequest(null as any)).toThrow(
      /items must be an array/,
    );
  });

  it('builds one route item (query only)', () => {
    const result = buildSyncBatchRequest([routeItem]);

    expect(result.batchItems).toHaveLength(1);
    expect(result.batchItems[0].query).toBe(
      '/calculateRoute/52.50931,13.42936:52.50274,13.43872/json',
    );
    expect(result.batchItems[0].post).toBeUndefined();
  });

  it('builds one reachable range item', () => {
    const result = buildSyncBatchRequest([rangeItem]);

    expect(result.batchItems).toHaveLength(1);
    expect(result.batchItems[0].query).toContain('/calculateReachableRange/');
    expect(result.batchItems[0].query).toContain('timeBudgetInSec=1800');
    expect(result.batchItems[0].post).toBeUndefined();
  });

  it('builds mixed route and range items', () => {
    const result = buildSyncBatchRequest([routeItem, rangeItem]);

    expect(result.batchItems).toHaveLength(2);
    expect(result.batchItems[0].query).toContain('/calculateRoute/');
    expect(result.batchItems[1].query).toContain('/calculateReachableRange/');
  });

  it('includes post when route has avoidVignette', () => {
    const item = {
      type: 'calculateRoute' as const,
      options: {
        ...routeItem.options,
        avoidVignette: ['AUS', 'CHE'],
      },
    };

    const result = buildSyncBatchRequest([item]);

    expect(result.batchItems[0].post).toEqual({
      avoidVignette: ['AUS', 'CHE'],
    });
  });

  it('accepts exactly max items', () => {
    const items = Array.from({ length: SYNC_BATCH_MAX_ITEMS }, () => routeItem);

    const result = buildSyncBatchRequest(items);

    expect(result.batchItems).toHaveLength(SYNC_BATCH_MAX_ITEMS);
  });
});
