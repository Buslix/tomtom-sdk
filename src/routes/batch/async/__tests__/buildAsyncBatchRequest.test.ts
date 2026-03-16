import { buildAsyncBatchRequest } from '../buildAsyncBatchRequest';
import { ASYNC_BATCH_MAX_ITEMS } from '../types';

describe('buildAsyncBatchRequest', () => {
  const routeItem = {
    type: 'calculateRoute' as const,
    options: {
      from: { lat: 52.50931, lng: 13.42936 },
      to: { lat: 52.50274, lng: 13.43872 },
    },
  };

  it('throws when items exceed async max (700)', () => {
    const items = Array.from(
      { length: ASYNC_BATCH_MAX_ITEMS + 1 },
      () => routeItem,
    );

    expect(() => buildAsyncBatchRequest(items)).toThrow(
      new RegExp(`at most ${ASYNC_BATCH_MAX_ITEMS} items allowed`),
    );
  });

  it('accepts exactly 700 items', () => {
    const items = Array.from(
      { length: ASYNC_BATCH_MAX_ITEMS },
      () => routeItem,
    );
    const result = buildAsyncBatchRequest(items);
    expect(result.batchItems).toHaveLength(ASYNC_BATCH_MAX_ITEMS);
  });

  it('builds same body shape as sync for one route item', () => {
    const result = buildAsyncBatchRequest([routeItem]);
    expect(result.batchItems).toHaveLength(1);
    expect(result.batchItems[0].query).toBe(
      '/calculateRoute/52.50931,13.42936:52.50274,13.43872/json',
    );
    expect(result.batchItems[0].post).toBeUndefined();
  });
});
