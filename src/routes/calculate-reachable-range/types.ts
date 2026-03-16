import type { Point } from '../../types';
import type {
  AvoidType,
  TravelMode,
  RouteType,
  Hilliness,
  Windingness,
  ApiPoint,
  EffectiveSetting,
} from '../calculate-route/types';

/**
 * Options for Calculate Reachable Range.
 * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/calculate-reachable-range
 */

/** Smoothing level for the reachable-range polygon boundary. */
export type Smoothing = 'none' | 'weak' | 'strong';

/** Rectangle for avoidAreas: south-west and north-east corners. */
export interface AvoidAreaRectangle {
  southWestCorner: ApiPoint;
  northEastCorner: ApiPoint;
}

/**
 * Fields sent in the POST body only. Developers pass these at the top level;
 * the client builds the body.
 */
export interface CalculateReachableRangePostBody {
  supportingPoints?: ApiPoint[];
  encodedPolyline?: string;
  encodedPolylinePrecision?: 5 | 7;
  avoidVignette?: string[];
  avoidAreas?: { rectangles: AvoidAreaRectangle[] };
}

/** Query params shared with common routing (subset used by reachable range). */
export interface CalculateReachableRangeQueryParams {
  report?: 'effectiveSettings';
  departAt?: string;
  routeType?: RouteType;
  traffic?: boolean;
  avoid?: AvoidType | AvoidType[];
  maxFerryLengthInMeters?: number;
  smoothing?: Smoothing;
  travelMode?: TravelMode;
  hilliness?: Hilliness;
  windingness?: Windingness;
  vehicleMaxSpeed?: number;
  vehicleWeight?: number;
  vehicleAxleWeight?: number;
  vehicleNumberOfAxles?: number;
  vehicleLength?: number;
  vehicleWidth?: number;
  vehicleHeight?: number;
  vehicleCommercial?: boolean;
  vehicleLoadType?: string | string[];
  vehicleAdrTunnelRestrictionCode?: 'B' | 'C' | 'D' | 'E';
  vehicleEngineType?: 'combustion' | 'electric';
  constantSpeedConsumptionInLitersPerHundredkm?: string;
  constantSpeedConsumptionInkWhPerHundredkm?: string;
  currentFuelInLiters?: number;
  currentChargeInkWh?: number;
  maxChargeInkWh?: number;
  auxiliaryPowerInLitersPerHour?: number;
  auxiliaryPowerInkW?: number;
}

/**
 * Exactly one budget must be set.
 * - fuelBudgetInLiters / energyBudgetInkWh require a detailed Consumption Model.
 */
export interface CalculateReachableRangeBudget {
  fuelBudgetInLiters?: number;
  energyBudgetInkWh?: number;
  timeBudgetInSec?: number;
  distanceBudgetInMeters?: number;
}

/**
 * Options for Calculate Reachable Range. Pass origin and exactly one budget at the top level.
 * Body fields (supportingPoints, avoidVignette, avoidAreas, etc.) are also at the top level.
 */
export interface CalculateReachableRangeOptions
  extends
    CalculateReachableRangeQueryParams,
    CalculateReachableRangePostBody,
    CalculateReachableRangeBudget {
  /** Origin point from which the range is calculated. */
  origin: Point;
}

// --- Response ---

export interface ReachableRangeCenter {
  latitude: number;
  longitude: number;
}

export interface ReachableRange {
  center: ReachableRangeCenter;
  boundary: Array<{ latitude: number; longitude: number }>;
}

export interface CalculateReachableRangeResponse {
  formatVersion: string;
  reachableRange: ReachableRange;
  report?: { effectiveSettings: EffectiveSetting[] };
  statusCode?: number;
}

// --- Error (same shape as Calculate Route) ---

export interface CalculateReachableRangeErrorResponse {
  formatVersion: string;
  detailedError: { code: string; message: string };
  statusCode?: number;
}
