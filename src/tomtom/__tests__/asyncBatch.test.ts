import { TomTom } from '../tomtom';

const API_KEY = process.env.API_KEY;
const withApiKey = API_KEY ? describe : describe.skip;

const from = { lat: 52.50931, lng: 13.42936 };
const to = { lat: 52.50274, lng: 13.43872 };

withApiKey('TomTom.submitBatchAsync (integration)', () => {
  const client = new TomTom(API_KEY!);

  afterEach(async () => {
    await new Promise((r) => setTimeout(r, 600));
  });

  describe('success', () => {
    it('submits batch and returns location', async () => {
      const { location } = await client.submitBatchAsync(
        [{ type: 'calculateRoute', options: { from, to } }],
        { redirectMode: 'manual' },
      );

      expect(location).toBeDefined();
      expect(typeof location).toBe('string');
      expect(location.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe('errors', () => {
    it('submission with invalid item still returns location (per-item errors in fetch result)', async () => {
      const { location } = await client.submitBatchAsync(
        [
          {
            type: 'calculateRoute',
            options: { from: { lat: 0, lng: 0 }, to },
          },
        ],
        { redirectMode: 'manual' },
      );
      expect(location).toBeDefined();
      expect(location.length).toBeGreaterThan(0);
    }, 15000);
  });
});

withApiKey('TomTom.fetchBatchResults (integration)', () => {
  const client = new TomTom(API_KEY!);

  afterEach(async () => {
    await new Promise((r) => setTimeout(r, 600));
  });

  describe('success', () => {
    it('returns results when batch is ready', async () => {
      const { location } = await client.submitBatchAsync(
        [{ type: 'calculateRoute', options: { from, to } }],
        { redirectMode: 'manual', waitTimeSeconds: 120 },
      );

      const res = await client.fetchBatchResults(location);

      expect(res.formatVersion).toBeDefined();
      expect(res.batchItems).toHaveLength(1);
      expect(res.summary.totalRequests).toBe(1);
      expect(res.batchItems[0].statusCode).toBe(200);
      expect(res.batchItems[0].response).toBeDefined();
    }, 30000);
  });
});

withApiKey('TomTom.fetchBatchResultsByBatchId (integration)', () => {
  const client = new TomTom(API_KEY!);

  afterEach(async () => {
    await new Promise((r) => setTimeout(r, 600));
  });

  describe('success', () => {
    it('returns results when batch is ready', async () => {
      const { location } = await client.submitBatchAsync(
        [{ type: 'calculateRoute', options: { from, to } }],
        { redirectMode: 'manual', waitTimeSeconds: 120 },
      );

      const pathname = location.startsWith('http')
        ? new URL(location).pathname
        : location.split('?')[0];
      const batchId = pathname.split('/').pop();
      expect(batchId).toBeDefined();

      const res = await client.fetchBatchResultsByBatchId(batchId!, {
        waitTimeSeconds: 120,
      });

      expect(res.formatVersion).toBeDefined();
      expect(res.batchItems).toHaveLength(1);
      expect(res.summary.totalRequests).toBe(1);
      expect(res.batchItems[0].statusCode).toBe(200);
      expect(res.batchItems[0].response).toBeDefined();
    }, 30000);
  });
});
