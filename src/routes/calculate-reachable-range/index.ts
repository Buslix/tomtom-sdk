import type {
  CalculateReachableRangeOptions,
  CalculateReachableRangePostBody,
} from './types';
import { assertPointValid, pointToLocationString } from '../shared';

const CONTENT_TYPE = 'json';

const RANGE_CONTEXT = 'Calculate reachable range';

/** Keys that are sent in the POST body only (not query params). */
const BODY_KEYS: ReadonlyArray<keyof CalculateReachableRangePostBody> = [
  'supportingPoints',
  'encodedPolyline',
  'encodedPolylinePrecision',
  'avoidVignette',
  'avoidAreas',
];

/** Budget parameter keys; exactly one must be set. */
const BUDGET_KEYS = [
  'fuelBudgetInLiters',
  'energyBudgetInkWh',
  'timeBudgetInSec',
  'distanceBudgetInMeters',
] as const;

const MULTI_VALUE_KEYS = new Set(['avoid']);

function buildBody(
  options: CalculateReachableRangeOptions,
): CalculateReachableRangePostBody | undefined {
  let hasBody = false;

  const body: CalculateReachableRangePostBody = {};

  for (const key of BODY_KEYS) {
    const value = options[key];

    if (value !== undefined && value !== null) {
      (body as Record<string, unknown>)[key] = value;
      hasBody = true;
    }
  }

  return hasBody ? body : undefined;
}

function getQueryParamsOnly(
  options: CalculateReachableRangeOptions,
): Record<string, unknown> {
  const { origin, ...rest } = options;

  const bodyKeySet = new Set(BODY_KEYS);

  const queryOnly: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (!bodyKeySet.has(key as keyof CalculateReachableRangePostBody)) {
      queryOnly[key] = value;
    }
  }

  return queryOnly;
}

function buildQueryString(options: Record<string, unknown>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value === undefined || value === null) continue;

    if (MULTI_VALUE_KEYS.has(key) && Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
    } else if (Array.isArray(value)) {
      params.append(key, value.map(String).join(','));
    } else {
      params.append(key, String(value));
    }
  }

  const str = params.toString();

  return str ? `?${str}` : '';
}

export interface BuildCalculateReachableRangeRequestResult {
  path: string;
  queryString: string;
  body?: CalculateReachableRangePostBody;
}

/**
 * Builds the Calculate Reachable Range request. Validates origin and exactly-one budget (fail early).
 *
 * @param options - Origin, exactly one budget, and optional query/body fields.
 * @returns Path, query string, and optional body.
 * @throws {Error} When options are invalid, origin is invalid, or budget is not exactly one.
 */
export function buildCalculateReachableRangeRequest(
  options: CalculateReachableRangeOptions,
): BuildCalculateReachableRangeRequestResult {
  if (options == null || typeof options !== 'object') {
    throw new Error(`${RANGE_CONTEXT}: options must be a non-null object.`);
  }

  const { origin } = options;

  assertPointValid(origin, 'origin', RANGE_CONTEXT);

  const budgetCount = BUDGET_KEYS.filter((k) => {
    const v = options[k];

    return typeof v === 'number' && v >= 0;
  }).length;

  if (budgetCount === 0) {
    throw new Error(
      `${RANGE_CONTEXT}: exactly one budget is required (fuelBudgetInLiters, energyBudgetInkWh, timeBudgetInSec, or distanceBudgetInMeters).`,
    );
  }

  if (budgetCount > 1) {
    throw new Error(
      `${RANGE_CONTEXT}: only one budget must be set (fuelBudgetInLiters, energyBudgetInkWh, timeBudgetInSec, or distanceBudgetInMeters).`,
    );
  }

  const originStr = pointToLocationString(origin);
  const path = `/calculateReachableRange/${originStr}/${CONTENT_TYPE}`;
  const body = buildBody(options);
  const queryParams = getQueryParamsOnly(options);
  const queryString = buildQueryString(queryParams);

  return { path, queryString, body };
}
