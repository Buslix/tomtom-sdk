# TomTom API Wrapper

A lightweight TypeScript wrapper around the [TomTom REST APIs](https://developer.tomtom.com/).  
This library aims to simplify route calculations and other location-based functionalities, with more extensive documentation and features to come in future releases.

## Installation

```bash
npm install @buslix/tomtom-sdk
```

## Usage

```ts
import { TomTom } from '@buslix/tomtom-sdk';

const service = new TomTom('YOUR_API_KEY');

// Example: Calculate a route or use other features
const route = await service.calculateRoute({
  from: { lat: 52.376372, lng: 4.908066 },
  to: { lat: 52.39081, lng: 4.88802 },
});
```

## Documentation

For full reference and advanced usage, visit the official [TomTom Developer Portal](https://developer.tomtom.com/). As this library evolves, it will incorporate more endpoints and functionality to mirror the full capabilities of TomTom’s documentation.