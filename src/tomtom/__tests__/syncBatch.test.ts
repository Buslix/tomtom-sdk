import { TomTom } from '../tomtom';
import { TomTomRoutingError } from '../../routes/calculate-route/types';

const API_KEY = process.env.API_KEY;
const withApiKey = API_KEY ? describe : describe.skip;

const from = { lat: 52.50931, lng: 13.42936 };
const to = { lat: 52.50274, lng: 13.43872 };
const origin = { lat: 52.36188, lng: 4.85056 };

withApiKey('TomTom.syncBatch (integration)', () => {
  const client = new TomTom(API_KEY!);

  afterEach(async () => {
    await new Promise((r) => setTimeout(r, 600));
  });

  describe('success', () => {
    it('returns batch results for route and reachable range items', async () => {
      const res = await client.syncBatch([
        { type: 'calculateRoute', options: { from, to } },
        {
          type: 'calculateReachableRange',
          options: { origin, timeBudgetInSec: 300 },
        },
      ]);

      expect(res.formatVersion).toBeDefined();
      expect(res.batchItems).toHaveLength(2);
      expect(res.summary.totalRequests).toBe(2);
      expect(res.summary.successfulRequests).toBeGreaterThanOrEqual(0);

      expect(res.batchItems[0].statusCode).toBeDefined();
      expect(res.batchItems[0].response).toBeDefined();
      expect(res.batchItems[1].statusCode).toBeDefined();
      expect(res.batchItems[1].response).toBeDefined();
    }, 20000);

    it('returns batch results for single route item', async () => {
      const res = await client.syncBatch([
        { type: 'calculateRoute', options: { from, to } },
      ]);

      expect(res.batchItems).toHaveLength(1);
      expect(res.summary.totalRequests).toBe(1);
      expect(res.batchItems[0].statusCode).toBe(200);
      expect(
        (res.batchItems[0].response as { routes?: unknown[] }).routes,
      ).toBeDefined();
    }, 20000);
  });

  describe('errors', () => {
    it('returns batch with statusCode 400 for item when one item has invalid origin', async () => {
      const res = await client.syncBatch([
        {
          type: 'calculateRoute',
          options: { from: { lat: 0, lng: 0 }, to },
        },
      ]);

      expect(res.batchItems).toHaveLength(1);
      expect(res.batchItems[0].statusCode).toBe(400);
      expect(res.batchItems[0].response).toBeDefined();
      expect(
        (res.batchItems[0].response as { detailedError?: { code?: string } })
          ?.detailedError?.code,
      ).toBe('MAP_MATCHING_FAILURE');
    }, 15000);
  });
});
