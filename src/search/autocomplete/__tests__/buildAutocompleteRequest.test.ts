import { buildAutocompleteRequest } from '../buildAutocompleteRequest';

describe('buildAutocompleteRequest', () => {
  it('requires language', () => {
    expect(() => buildAutocompleteRequest('pizza', {} as any)).toThrow(
      /language is required/,
    );
    expect(() => buildAutocompleteRequest('pizza', { language: '' })).toThrow(
      /language is required/,
    );
  });

  it('builds path and query with required language', () => {
    const { path, queryString } = buildAutocompleteRequest('pizza', {
      language: 'en-US',
    });
    expect(path).toBe('/search/2/autocomplete/pizza.json');
    expect(queryString).toContain('language=en-US');
    expect(queryString).toContain('limit=5');
  });

  it('encodes query in path', () => {
    const { path } = buildAutocompleteRequest('mazda dealer Warszawa', {
      language: 'en-US',
    });
    expect(path).toContain(encodeURIComponent('mazda dealer Warszawa'));
  });

  it('accepts limit between 1 and 10', () => {
    const { queryString } = buildAutocompleteRequest('pizza', {
      language: 'en-US',
      limit: 10,
    });
    expect(queryString).toContain('limit=10');
  });

  it('throws when limit is out of range', () => {
    expect(() =>
      buildAutocompleteRequest('pizza', { language: 'en-US', limit: 0 }),
    ).toThrow(/limit must be between 1 and 10/);
    expect(() =>
      buildAutocompleteRequest('pizza', { language: 'en-US', limit: 11 }),
    ).toThrow(/limit must be between 1 and 10/);
  });

  it('requires lat and lon together', () => {
    expect(() =>
      buildAutocompleteRequest('pizza', {
        language: 'en-US',
        lat: 52.5,
      }),
    ).toThrow(/lat and lon must be used together/);
    expect(() =>
      buildAutocompleteRequest('pizza', {
        language: 'en-US',
        lon: 13.4,
      }),
    ).toThrow(/lat and lon must be used together/);
  });

  it('adds lat, lon and radius when provided', () => {
    const { queryString } = buildAutocompleteRequest('pizza', {
      language: 'en-US',
      lat: 52.51,
      lon: 13.4,
      radius: 10000,
    });
    expect(queryString).toContain('lat=52.51');
    expect(queryString).toContain('lon=13.4');
    expect(queryString).toContain('radius=10000');
  });

  it('throws when radius is used without lat/lon', () => {
    expect(() =>
      buildAutocompleteRequest('pizza', {
        language: 'en-US',
        radius: 10000,
      }),
    ).toThrow(/radius must be used with lat and lon/);
  });

  it('throws when radius is out of range', () => {
    expect(() =>
      buildAutocompleteRequest('pizza', {
        language: 'en-US',
        lat: 52.5,
        lon: 13.4,
        radius: -1,
      }),
    ).toThrow(/radius must be between 0 and 5000000/);
  });

  it('adds countrySet and resultSet', () => {
    const { queryString } = buildAutocompleteRequest('pizza', {
      language: 'en-US',
      countrySet: 'DE,AT',
      resultSet: 'category,brand',
    });
    expect(queryString).toContain('countrySet=DE%2CAT');
    expect(queryString).toContain('resultSet=category%2Cbrand');
  });
});
