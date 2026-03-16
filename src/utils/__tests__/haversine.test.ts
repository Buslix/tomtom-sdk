import { haversineDistance } from '../haversine';

describe('haversineDistance', () => {
  it('returns 0 for same point', () => {
    const p = { lat: 52.52, lng: 13.405 };

    expect(haversineDistance(p, p)).toBe(0);
    expect(haversineDistance(p, p, 'km')).toBe(0);
  });

  it('returns distance in meters by default', () => {
    const berlin = { lat: 52.52, lng: 13.405 };

    const hamburg = { lat: 53.55, lng: 9.99 };

    const d = haversineDistance(berlin, hamburg);

    expect(d).toBeGreaterThan(250_000);
    expect(d).toBeLessThan(260_000);
  });

  it('returns distance in km when unit is "km"', () => {
    const berlin = { lat: 52.52, lng: 13.405 };

    const hamburg = { lat: 53.55, lng: 9.99 };

    const d = haversineDistance(berlin, hamburg, 'km');

    expect(d).toBeGreaterThan(250);
    expect(d).toBeLessThan(260);
  });

  it('is symmetric', () => {
    const a = { lat: 47.73, lng: 16.34 };

    const b = { lat: 47.81, lng: 16.24 };

    expect(haversineDistance(a, b)).toBe(haversineDistance(b, a));
  });
});
