import { TomTom } from '../tomtom';
import { TomTomRoutingError } from '../../routes/calculate-route/types';

const API_KEY = process.env.API_KEY;
const withApiKey = API_KEY ? describe : describe.skip;

const origin = { lat: 52.36188, lng: 4.85056 };

withApiKey('TomTom.calculateReachableRange (integration)', () => {
  const client = new TomTom(API_KEY!);

  afterEach(async () => {
    await new Promise((r) => setTimeout(r, 600));
  });

  describe('success', () => {
    it('returns reachableRange with center and boundary', async () => {
      const res = await client.calculateReachableRange({
        origin,
        timeBudgetInSec: 600,
      });

      expect(res.formatVersion).toBeDefined();
      expect(res.reachableRange).toBeDefined();
      expect(res.reachableRange.center).toBeDefined();
      expect(res.reachableRange.center.latitude).toBeCloseTo(origin.lat, 2);
      expect(res.reachableRange.center.longitude).toBeCloseTo(origin.lng, 2);
      expect(Array.isArray(res.reachableRange.boundary)).toBe(true);
      expect(res.reachableRange.boundary.length).toBeGreaterThan(0);
    }, 15000);

    it('accepts fuelBudgetInLiters', async () => {
      const res = await client.calculateReachableRange({
        origin,
        fuelBudgetInLiters: 10,
        constantSpeedConsumptionInLitersPerHundredkm: '6,5',
      });
      expect(res.reachableRange).toBeDefined();
      expect(res.reachableRange.boundary.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe('errors', () => {
    it('throws TomTomRoutingError on invalid origin', async () => {
      await expect(
        client.calculateReachableRange({
          origin: { lat: 0, lng: 0 },
          timeBudgetInSec: 600,
        }),
      ).rejects.toThrow(TomTomRoutingError);
    }, 15000);
  });
});
