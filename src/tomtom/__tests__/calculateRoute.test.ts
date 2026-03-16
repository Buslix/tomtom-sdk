import { TomTom } from '../tomtom';
import { TomTomRoutingError } from '../../routes/calculate-route/types';

const API_KEY = process.env.API_KEY;
const withApiKey = API_KEY ? describe : describe.skip;

const from = { lat: 52.50931, lng: 13.42936 };
const to = { lat: 52.50274, lng: 13.43872 };

withApiKey('TomTom.calculateRoute (integration)', () => {
  const client = new TomTom(API_KEY!);

  afterEach(async () => {
    await new Promise((r) => setTimeout(r, 1200));
  });

  describe('success', () => {
    it('returns routes with summary and legs', async () => {
      const res = await client.calculateRoute({ from, to });

      expect(res.formatVersion).toBeDefined();
      expect(Array.isArray(res.routes)).toBe(true);
      expect(res.routes.length).toBeGreaterThan(0);

      const route = res.routes[0];
      expect(route.summary).toBeDefined();
      expect(route.summary.lengthInMeters).toBeGreaterThan(0);
      expect(route.summary.travelTimeInSeconds).toBeGreaterThan(0);
      expect(route.summary.departureTime).toBeDefined();
      expect(route.summary.arrivalTime).toBeDefined();

      expect(Array.isArray(route.legs)).toBe(true);
      expect(route.legs.length).toBeGreaterThan(0);
      expect(route.legs[0].summary).toBeDefined();
    }, 15000);

    it('accepts waypoints', async () => {
      const waypoints = [{ lat: 52.508, lng: 13.432 }];
      const res = await client.calculateRoute({ from, to, waypoints });
      expect(res.routes[0].legs.length).toBe(2);
    }, 15000);

    it('accepts travelMode and routeType', async () => {
      const res = await client.calculateRoute({
        from,
        to,
        travelMode: 'car',
        routeType: 'fastest',
      });
      expect(res.routes[0].summary.lengthInMeters).toBeGreaterThan(0);
    }, 15000);

    it('with computeTravelTimeFor: "all" returns extra travel time fields in summary', async () => {
      const res = await client.calculateRoute({
        from,
        to,
        computeTravelTimeFor: 'all',
      });
      const summary = res.routes[0].summary;
      expect(summary.noTrafficTravelTimeInSeconds).toBeDefined();
      expect(summary.historicTrafficTravelTimeInSeconds).toBeDefined();
      expect(summary.liveTrafficIncidentsTravelTimeInSeconds).toBeDefined();
    }, 15000);

    it('with computeBestOrder: true returns optimizedWaypoints', async () => {
      const res = await client.calculateRoute({
        from,
        to,
        waypoints: [{ lat: 52.508, lng: 13.432 }],
        computeBestOrder: true,
      });
      expect(res.optimizedWaypoints).toBeDefined();
      expect(Array.isArray(res.optimizedWaypoints)).toBe(true);
    }, 15000);

    it('with reassessmentParameterSets returns routeReassessments', async () => {
      const res = await client.calculateRoute({
        from,
        to,
        vehicleEngineType: 'electric',
        constantSpeedConsumptionInkWhPerHundredkm: '50,8',
        reassessmentParameterSets: [{ auxiliaryPowerInkW: 0.2 }],
      });
      expect(res.routes[0].routeReassessments).toBeDefined();
      expect(res.routes[0].routeReassessments!.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe('errors', () => {
    it('throws TomTomRoutingError on invalid origin (MAP_MATCHING_FAILURE)', async () => {
      await expect(
        client.calculateRoute({
          from: { lat: 0, lng: 0 },
          to,
        }),
      ).rejects.toThrow(TomTomRoutingError);
    }, 15000);

    it('TomTomRoutingError has code and message', async () => {
      try {
        await client.calculateRoute({
          from: { lat: 0, lng: 0 },
          to,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(TomTomRoutingError);
        expect((err as TomTomRoutingError).code).toBeDefined();
        expect((err as TomTomRoutingError).message).toBeDefined();
        expect((err as TomTomRoutingError).statusCode).toBeDefined();
      }
    }, 15000);
  });
});
