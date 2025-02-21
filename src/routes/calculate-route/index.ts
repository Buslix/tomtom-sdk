import { CalculateRouteOptions } from './types';

const buildCalculateRouteRequest = (options: CalculateRouteOptions) => {
	const baseUrl = `/calculateRoute`;
	const points = [options.from, ...(options.waypoints ?? []), options.to];
	const waypoints = points
		.map((waypoint) => `${waypoint.lat},${waypoint.lng}`)
		.join(':');

	const { from, to, waypoints: w, ...rest } = options;

	const params = new URLSearchParams();
	Object.entries(rest).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			params.append(key, String(value));
		}
	});

	const url = `${baseUrl}/${waypoints}/json?${params.toString()}`;

	return url;
};

export { buildCalculateRouteRequest };
