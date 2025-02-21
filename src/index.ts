import { TomTom } from './tomtom/tomtom';

export * from './tomtom/tomtom';

const tomtom = new TomTom('mXEPmZxmA8NZvejWwACCFHA4GCJ6iiB3');
tomtom
	.calculateRoute({
		from: {
			lng: 52.50931,
			lat: 13.42936,
		},
		to: {
			lng: 52.50274,
			lat: 13.43872,
		},
	})
	.then((res) => console.log(res));
