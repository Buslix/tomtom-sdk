import { TomTom } from '../tomtom';

const API_KEY = process.env.API_KEY;
const withApiKey = API_KEY ? describe : describe.skip;

withApiKey('TomTom.autocomplete (integration)', () => {
  const client = new TomTom(API_KEY!);

  afterEach(async () => {
    await new Promise((r) => setTimeout(r, 600));
  });

  describe('success', () => {
    it('returns context and results with segments', async () => {
      const res = await client.autocomplete('pizza', { language: 'en-US' });

      expect(res.context).toBeDefined();
      expect(res.context.inputQuery).toBe('pizza');
      expect(Array.isArray(res.results)).toBe(true);
      res.results.forEach((result) => {
        expect(Array.isArray(result.segments)).toBe(true);
        result.segments.forEach((seg) => {
          expect(seg.type).toBeDefined();
          expect(seg.value).toBeDefined();
          expect(seg.matches?.inputQuery).toBeDefined();
        });
      });
    }, 15000);

    it('accepts limit, lat, lon, radius, countrySet', async () => {
      const res = await client.autocomplete('Berlin', {
        language: 'en-US',
        limit: 3,
        lat: 52.52,
        lon: 13.405,
        radius: 50000,
        countrySet: 'DE',
      });

      expect(res.context).toBeDefined();
      expect(res.results.length).toBeLessThanOrEqual(3);
    }, 15000);
  });

  describe('errors', () => {
    it('throws when language is empty (validation)', async () => {
      await expect(
        client.autocomplete('pizza', { language: '' }),
      ).rejects.toThrow();
    }, 15000);
  });
});
