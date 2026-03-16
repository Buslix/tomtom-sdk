# TomTom SDK

A lightweight, TypeScript-first wrapper around [TomTom’s Routing API](https://developer.tomtom.com/routing-api/documentation) and [Search API](https://developer.tomtom.com/search-api/documentation) (Autocomplete). Use it for route calculation, reachable range, batch routing, and search autocomplete.

## Installation

```bash
npm install @buslix/tomtom-sdk
```

## Requirements

- **Node.js** 18+ (for `fetch`)
- A [TomTom API key](https://developer.tomtom.com/)

## Quick start

```ts
import { TomTom } from '@buslix/tomtom-sdk';

const client = new TomTom('YOUR_API_KEY');

// Calculate a route
const route = await client.calculateRoute({
  from: { lat: 52.376372, lng: 4.908066 },
  to: { lat: 52.39081, lng: 4.88802 },
});
console.log(route.routes[0].summary.lengthInMeters);
```

---

## API Reference

### Client

```ts
import { TomTom } from '@buslix/tomtom-sdk';

const client = new TomTom(apiKey: string, versionNumber?: string);
```

- **`apiKey`** – Your TomTom API key (required).
- **`versionNumber`** – Routing API version, default `'1'`.
- **`client.baseUrl`** – Base URL (default `'https://api.tomtom.com'`). Override for region-specific endpoints (e.g. South Korea).

---

### Calculate Route

Compute a route between two points with optional waypoints and options.

```ts
const result = await client.calculateRoute({
  from: { lat: 52.51, lng: 13.43 },
  to: { lat: 52.50, lng: 13.44 },
  waypoints: [{ lat: 52.505, lng: 13.435 }],  // optional
  travelMode: 'car',       // optional: car, truck, taxi, bus, van, motorcycle, bicycle, pedestrian
  routeType: 'fastest',    // optional: fastest, shortest, eco, thrilling
});
// result.routes[0].summary, result.routes[0].legs, ...
```

Options include `sectionType`, `avoid`, `departAt`, `vehicleLoadType`, `computeBestOrder`, `computeTravelTimeFor`, `reassessmentParameterSets`, and more. See [Calculate Route](https://docs.tomtom.com/routing-api/documentation/tomtom-maps/calculate-route) and the exported type `CalculateRouteOptions`.

---

### Calculate Reachable Range

Get the reachable area from an origin given a time, distance, fuel, or energy budget.

```ts
const result = await client.calculateReachableRange({
  origin: { lat: 52.36, lng: 4.85 },
  timeBudgetInSec: 1800,  // exactly one budget required
});
// result.reachableRange.center, result.reachableRange.boundary
```

Budget options (use exactly one): `timeBudgetInSec`, `distanceBudgetInMeters`, `fuelBudgetInLiters` (with `constantSpeedConsumptionInLitersPerHundredkm`), `energyBudgetInkWh` (with consumption params). See [Calculate Reachable Range](https://docs.tomtom.com/routing-api/documentation/tomtom-maps/calculate-reachable-range) and `CalculateReachableRangeOptions`.

---

### Batch Routing

#### Synchronous batch (up to 100 items)

Run multiple route and/or reachable-range requests in one call. Fails if processing exceeds ~60s.

```ts
const result = await client.syncBatch([
  { type: 'calculateRoute', options: { from: a, to: b } },
  { type: 'calculateReachableRange', options: { origin: c, timeBudgetInSec: 600 } },
]);
// result.batchItems[i].statusCode, result.batchItems[i].response
// result.summary.successfulRequests, result.summary.totalRequests
```

#### Asynchronous batch (up to 700 items)

Submit a batch, then poll for results.

```ts
// 1. Submit
const { location } = await client.submitBatchAsync(
  [
    { type: 'calculateRoute', options: { from: a, to: b } },
  ],
  { redirectMode: 'manual', waitTimeSeconds: 120 },
);

// 2. Fetch results (location may be relative; client handles it)
const result = await client.fetchBatchResults(location);

// Or by batch ID (parsed from location URL)
const batchId = new URL(location, 'https://api.tomtom.com').pathname.split('/').pop();
const result = await client.fetchBatchResultsByBatchId(batchId!, { waitTimeSeconds: 120 });
```

On **202 Accepted**, the batch is still processing; call `fetchBatchResults` again (or follow the new `Location` header). See [Synchronous batch](https://docs.tomtom.com/routing-api/documentation/tomtom-maps/batch-routing/synchronous-batch) and [Asynchronous batch](https://docs.tomtom.com/routing-api/documentation/tomtom-maps/batch-routing/asynchronous-batch-submission).

---

### Autocomplete (Search API)

Get query-term suggestions (brand, category, plaintext) for a search string.

```ts
const result = await client.autocomplete('pizza Berlin', {
  language: 'en-US',   // required
  limit: 5,            // optional, 1–10, default 5
  lat: 52.52,          // optional bias
  lon: 13.405,
  radius: 50000,       // meters, with lat/lon
  countrySet: 'DE',
  resultSet: 'category,brand',
});
// result.context.inputQuery, result.results[].segments (type, value, matches)
```

See [Autocomplete](https://docs.tomtom.com/search-api/documentation/autocomplete-service/autocomplete) and `AutocompleteOptions`.

---

### Error handling

All API methods throw **`TomTomRoutingError`** on failure (HTTP errors or API error payloads).

```ts
import { TomTom, TomTomRoutingError } from '@buslix/tomtom-sdk';

try {
  await client.calculateRoute({ from: { lat: 0, lng: 0 }, to });
} catch (err) {
  if (err instanceof TomTomRoutingError) {
    console.error(err.message, err.code, err.statusCode);
  }
}
```

---

### Types and helpers

- **`Point`** – `{ lat: number; lng: number }`.
- **Route / range / batch / autocomplete** – Options and response types are exported (e.g. `CalculateRouteOptions`, `SyncBatchItemRequest`, `AutocompleteResponse`). Use your IDE’s types for full options.
- **`haversineDistance(a, b, unit?)`** – Great-circle distance between two points.

```ts
import { haversineDistance, type Point } from '@buslix/tomtom-sdk';

const d = haversineDistance(
  { lat: 52.52, lng: 13.405 },
  { lat: 52.50, lng: 13.44 },
  'km',
);
```

---

### TypeScript

The package is written in TypeScript and ships with declaration files. Route response types are inferred from options (e.g. `computeBestOrder: true` implies `optimizedWaypoints` on the response).

---

## Links

- [TomTom Routing API](https://developer.tomtom.com/routing-api/documentation)
- [TomTom Search API](https://developer.tomtom.com/search-api/documentation)
- [Get an API key](https://developer.tomtom.com/)

## License

MIT
