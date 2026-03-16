import type { CalculateRouteOptions } from '../types';
import { buildCalculateRouteRequest } from '../index';

describe('buildCalculateRouteRequest', () => {
  const from = { lat: 52.50931, lng: 13.42936 };

  const to = { lat: 52.50274, lng: 13.43872 };

  it('builds path with from and to only', () => {
    const result = buildCalculateRouteRequest({ from, to });

    expect(result.path).toBe(
      '/calculateRoute/52.50931,13.42936:52.50274,13.43872/json',
    );
    expect(result.queryString).toBe('');
    expect(result.body).toBeUndefined();
  });

  it('builds path with waypoints', () => {
    const waypoints = [{ lat: 52.508, lng: 13.43 }];

    const result = buildCalculateRouteRequest({ from, to, waypoints });

    expect(result.path).toBe(
      '/calculateRoute/52.50931,13.42936:52.508,13.43:52.50274,13.43872/json',
    );
  });

  it('adds query params', () => {
    const result = buildCalculateRouteRequest({
      from,
      to,
      travelMode: 'car',
      routeType: 'fastest',
    });

    expect(result.path).toContain('/calculateRoute/');
    expect(result.queryString).toContain('travelMode=car');
    expect(result.queryString).toContain('routeType=fastest');
  });

  it('appends multiple sectionType as repeated params', () => {
    const result = buildCalculateRouteRequest({
      from,
      to,
      sectionType: ['traffic', 'country'],
    });

    expect(result.queryString).toContain('sectionType=traffic');
    expect(result.queryString).toContain('sectionType=country');
  });

  it('builds body when POST-only fields are set (avoidVignette)', () => {
    const result = buildCalculateRouteRequest({
      from,
      to,
      avoidVignette: ['AUS', 'CHE'],
    });

    expect(result.body).toEqual({ avoidVignette: ['AUS', 'CHE'] });
  });

  it('builds body when reassessmentParameterSets is set', () => {
    const result = buildCalculateRouteRequest({
      from,
      to,
      reassessmentParameterSets: [{ auxiliaryPowerInkW: 0.3 }],
    });

    expect(result.body).toEqual({
      reassessmentParameterSets: [{ auxiliaryPowerInkW: 0.3 }],
    });
  });

  it('omits undefined and null from query string', () => {
    const result = buildCalculateRouteRequest({
      from,
      to,
      travelMode: 'car',
      routeType: undefined,
    });

    expect(result.queryString).toContain('travelMode=car');
    expect(result.queryString).not.toContain('routeType');
  });

  describe('fail early validation', () => {
    it('throws when options is null', () => {
      expect(() =>
        buildCalculateRouteRequest(null as unknown as CalculateRouteOptions),
      ).toThrow('options must be a non-null object');
    });

    it('throws when from.lat is out of range', () => {
      expect(() =>
        buildCalculateRouteRequest({
          from: { lat: 100, lng: 13.43 },
          to,
        }),
      ).toThrow('from.lat must be a number between -90 and 90');
    });

    it('throws when to.lng is out of range', () => {
      expect(() =>
        buildCalculateRouteRequest({
          from,
          to: { lat: 52.5, lng: 200 },
        }),
      ).toThrow('to.lng must be a number between -180 and 180');
    });

    it('throws when waypoints is not an array', () => {
      expect(() =>
        buildCalculateRouteRequest({
          from,
          to,
          waypoints:
            'not an array' as unknown as CalculateRouteOptions['waypoints'],
        }),
      ).toThrow('waypoints must be an array');
    });

    it('throws when waypoints exceed 150', () => {
      const waypoints = Array.from({ length: 151 }, (_, i) => ({
        lat: 52 + i * 0.001,
        lng: 13.43,
      }));

      expect(() => buildCalculateRouteRequest({ from, to, waypoints })).toThrow(
        'waypoints length must be at most 150',
      );
    });
  });
});
