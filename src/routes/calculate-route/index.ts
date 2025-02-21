import { CalculateRouteOptions } from './types';

const buildCalculateRouteRequest = (options: CalculateRouteOptions) => {
	const baseUrl = `/calculateRoute`;
	const url = `${baseUrl}/${options.from.lng},${options.from.lat}:${options.to.lng},${options.to.lat}/json`;

	return url;
};

export { buildCalculateRouteRequest };
