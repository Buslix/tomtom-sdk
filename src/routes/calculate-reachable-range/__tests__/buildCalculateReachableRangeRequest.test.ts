import type { CalculateReachableRangeOptions } from '../types';
import { buildCalculateReachableRangeRequest } from '../index';

describe('buildCalculateReachableRangeRequest', () => {
  const origin = { lat: 52.50931, lng: 13.42936 };

  it('builds path with origin and time budget', () => {
    const result = buildCalculateReachableRangeRequest({
      origin,
      timeBudgetInSec: 3600,
    });

    expect(result.path).toBe('/calculateReachableRange/52.50931,13.42936/json');
    expect(result.queryString).toContain('timeBudgetInSec=3600');
    expect(result.body).toBeUndefined();
  });

  it('builds path with distance budget', () => {
    const result = buildCalculateReachableRangeRequest({
      origin,
      distanceBudgetInMeters: 10000,
    });

    expect(result.path).toContain('/calculateReachableRange/');
    expect(result.queryString).toContain('distanceBudgetInMeters=10000');
  });

  it('builds body when avoidVignette is set', () => {
    const result = buildCalculateReachableRangeRequest({
      origin,
      timeBudgetInSec: 3600,
      avoidVignette: ['AUS', 'CHE'],
    });

    expect(result.body).toEqual({ avoidVignette: ['AUS', 'CHE'] });
  });

  it('throws when no budget is set', () => {
    expect(() =>
      buildCalculateReachableRangeRequest({
        origin,
      } as CalculateReachableRangeOptions),
    ).toThrow('exactly one budget is required');
  });

  it('throws when more than one budget is set', () => {
    expect(() =>
      buildCalculateReachableRangeRequest({
        origin,
        timeBudgetInSec: 3600,
        distanceBudgetInMeters: 5000,
      }),
    ).toThrow('only one budget must be set');
  });

  it('throws when origin is invalid', () => {
    expect(() =>
      buildCalculateReachableRangeRequest({
        origin: { lat: 100, lng: 13.43 },
        timeBudgetInSec: 3600,
      }),
    ).toThrow('origin.lat must be a number between -90 and 90');
  });
});
