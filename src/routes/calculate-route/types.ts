import type { If, Simplify } from 'type-fest';
import { Point } from '../../types';

// --- Request: aligned with TomTom Calculate Route API ---

/** Travel mode for the route. */
export type TravelMode =
  | 'car'
  | 'truck'
  | 'taxi'
  | 'bus'
  | 'van'
  | 'motorcycle'
  | 'bicycle'
  | 'pedestrian';

/** Route optimization type. */
export type RouteType = 'fastest' | 'shortest' | 'short' | 'eco' | 'thrilling';

/** Avoid type (can be specified multiple times). */
export type AvoidType =
  | 'tollRoads'
  | 'motorways'
  | 'ferries'
  | 'unpavedRoads'
  | 'carpools'
  | 'alreadyUsedRoads'
  | 'borderCrossings'
  | 'tunnels'
  | 'carTrains'
  | 'lowEmissionZones';

/**
 * Section type (can be specified multiple times).
 * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/calculate-route
 * Note: `tollRoad` is deprecated by TomTom (withdrawal March 15, 2025). Prefer `toll` and `tollVignette`.
 */
export type SectionType =
  | 'carTrain'
  | 'ferry'
  | 'tunnel'
  | 'motorway'
  | 'pedestrian'
  | 'toll'
  | 'tollVignette'
  | /** @deprecated Use `toll` | `tollVignette`. Withdrawal March 15, 2025. */ 'tollRoad'
  | 'country'
  | 'travelMode'
  | 'traffic'
  | 'carpool'
  | 'urban'
  | 'unpaved'
  | 'lowEmissionZone'
  | 'roadShields'
  | 'speedLimit'
  | 'importantRoadStretch';

/** Route representation in the response. */
export type RouteRepresentation =
  | 'polyline'
  | 'encodedPolyline'
  | 'summaryOnly'
  | 'none';

/** Extended route representation (can be specified multiple times). */
export type ExtendedRouteRepresentation =
  | 'distance'
  | 'travelTime'
  | 'consumption';

/** Alternative route type when maxAlternatives > 0. */
export type AlternativeType = 'anyRoute' | 'betterRoute';

/** Hilliness for thrilling routes. */
export type Hilliness = 'low' | 'normal' | 'high';

/** Windingness for thrilling routes. */
export type Windingness = 'low' | 'normal' | 'high';

/** Point in API format (latitude, longitude). */
export interface ApiPoint {
  latitude: number;
  longitude: number;
}

/** Route stop at end of a leg (POST body). */
export interface RouteStop {
  /** Waiting time at the stop in seconds (e.g. charging). Must be 0 in the last leg. */
  pauseTimeInSeconds?: number;
  /** Entry points for the stop. */
  entryPoints?: ApiPoint[];
}

/** Leg-specific parameters (POST body). Number of elements must equal waypoints + 1. */
export interface CalculateRouteLegOptions {
  routeType?: RouteType;
  hilliness?: Hilliness;
  windingness?: Windingness;
  routeStop?: RouteStop;
  supportingPoints?: ApiPoint[];
  encodedPolyline?: string;
  encodedPolylinePrecision?: 5 | 7;
  avoids?: { name: string }[];
}

/** Reassessment parameter set (POST body). Used for route reassessment (e.g. auxiliary power impact). */
export interface ReassessmentParameterSet {
  auxiliaryPowerInkW?: number;
}

/**
 * Fields sent in the request body (POST only). Used internally when building the request.
 * Developers pass these at the top level of CalculateRouteOptions; the client builds the body.
 */
export interface CalculateRoutePostBody {
  supportingPoints?: ApiPoint[];
  encodedPolyline?: string;
  encodedPolylinePrecision?: 5 | 7;
  pointWaypoints?: Array<{
    waypointSourceType: 'USER_DEFINED';
    supportingPointIndex: number;
  }>;
  avoidVignette?: string[];
  reassessmentParameterSets?: ReassessmentParameterSet[];
  legs?: CalculateRouteLegOptions[];
}

/** Query parameters for Calculate Route (subset of commonly used; names match API). */
export interface CalculateRouteQueryParams {
  maxAlternatives?: number;
  alternativeType?: AlternativeType;
  minDeviationDistance?: number;
  minDeviationTime?: number;
  supportingPointIndexOfOrigin?: number;
  computeBestOrder?: boolean;
  routeRepresentation?: RouteRepresentation;
  computeTravelTimeFor?: 'none' | 'all';
  vehicleHeading?: number;
  language?: string;
  sectionType?: SectionType | SectionType[];
  includeTollPaymentTypes?: 'all' | 'none';
  report?: 'effectiveSettings';
  departAt?: string;
  arriveAt?: string;
  routeType?: RouteType;
  traffic?: boolean;
  avoid?: AvoidType | AvoidType[];
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
  /** Electric: colon-delimited "speedInkmh,consumptionInkWhPerHundredkm" pairs (e.g. "50,8"). */
  constantSpeedConsumptionInkWhPerHundredkm?: string;
  extendedRouteRepresentation?:
    | ExtendedRouteRepresentation
    | ExtendedRouteRepresentation[];
}

/**
 * Options for Calculate Route. Pass from, to, waypoints, and any query or body fields at the top level.
 * The client uses GET when no body fields are set; it uses POST and builds the body from body fields when needed.
 */
export interface CalculateRouteOptions
  extends CalculateRouteQueryParams, CalculateRoutePostBody {
  /** Origin point. */
  from: Point;
  /** Destination point. */
  to: Point;
  /** Optional waypoints (max 150). */
  waypoints?: Point[];
}

// --- Response inference: request → response shape (100% type-safe) ---

/** True when options include reassessmentParameterSets. */
type HasReassessment<O> = O extends { reassessmentParameterSets: unknown[] }
  ? true
  : false;

/** True when options include computeBestOrder: true. */
type HasOptimizedWaypoints<O> = O extends { computeBestOrder: true }
  ? true
  : false;

/** True when options include report: 'effectiveSettings'. */
type HasReport<O> = O extends { report: 'effectiveSettings' } ? true : false;

/** True when options include sectionType. */
type HasSections<O> = O extends {
  sectionType: SectionType | readonly SectionType[];
}
  ? true
  : false;

/** True when options include extendedRouteRepresentation. */
type HasProgress<O> = O extends {
  extendedRouteRepresentation:
    | ExtendedRouteRepresentation
    | readonly ExtendedRouteRepresentation[];
}
  ? true
  : false;

/** True when options include computeTravelTimeFor: 'all'. */
type HasComputeTravelTimeForAll<O> = O extends {
  computeTravelTimeFor: 'all';
}
  ? true
  : false;

/** True when options include sectionType that contains 'roadShields'. */
type HasRoadShields<O> = O extends { sectionType: 'roadShields' }
  ? true
  : O extends { sectionType: readonly (infer S)[] }
    ? 'roadShields' extends S
      ? true
      : false
    : false;

/** Extra travel time fields when computeTravelTimeFor: 'all'. */
type ExtraTravelTimeFields = {
  noTrafficTravelTimeInSeconds: number;
  historicTrafficTravelTimeInSeconds: number;
  liveTrafficIncidentsTravelTimeInSeconds: number;
};

/** Summary with extra travel time fields required when computeTravelTimeFor: 'all'. */
type RouteSummaryFor<O> = RouteSummary &
  If<HasComputeTravelTimeForAll<O>, ExtraTravelTimeFields, object>;

/** Leg summary with same conditional travel time fields. */
type LegSummaryFor<O> = LegSummary &
  If<HasComputeTravelTimeForAll<O>, ExtraTravelTimeFields, object>;

/** Single route with conditional fields required based on request. */
type RouteFor<O> = Simplify<
  Omit<Route, 'summary' | 'legs'> & {
    summary: RouteSummaryFor<O>;
    legs: Array<Omit<RouteLeg, 'summary'> & { summary: LegSummaryFor<O> }>;
  } & If<HasSections<O>, { sections: RouteSection[] }, object> &
    If<HasProgress<O>, { progress: ProgressPoint[] }, object> &
    If<HasReassessment<O>, { routeReassessments: RouteReassessment[] }, object>
>;

/**
 * Response type inferred from the request options.
 * Conditional fields are required when the corresponding option was set.
 *
 * @example
 * // reassessmentParameterSets → routeReassessments is required on each route
 * const res = await client.calculateRoute({
 *   from, to,
 *   reassessmentParameterSets: [{ auxiliaryPowerInkW: 0.3 }],
 * });
 * res.routes[0].routeReassessments; // RouteReassessment[] (required)
 *
 * @example
 * // computeBestOrder: true → optimizedWaypoints is required
 * const res = await client.calculateRoute({ from, to, computeBestOrder: true });
 * res.optimizedWaypoints; // OptimizedWaypoint[] (required)
 *
 * @example
 * // computeTravelTimeFor: 'all' → extra travel time fields required in summary
 * const res = await client.calculateRoute({ from, to, computeTravelTimeFor: 'all' });
 * res.routes[0].summary.noTrafficTravelTimeInSeconds; // number (required)
 */
export type CalculateRouteResponseFor<O extends CalculateRouteOptions> =
  Simplify<
    Omit<
      CalculateRouteResponse,
      'routes' | 'report' | 'optimizedWaypoints' | 'roadShieldAtlasReference'
    > & {
      routes: RouteFor<O>[];
    } & If<
        HasReport<O>,
        { report: { effectiveSettings: EffectiveSetting[] } },
        object
      > &
      If<
        HasOptimizedWaypoints<O>,
        { optimizedWaypoints: OptimizedWaypoint[] },
        object
      > &
      If<HasRoadShields<O>, { roadShieldAtlasReference: string }, object>
  >;

// --- Response: structure matches API; optional fields depend on request ---

/** Summary of a route or leg. Optional fields appear based on request (e.g. computeTravelTimeFor, consumption model). */
export interface RouteSummary {
  lengthInMeters: number;
  travelTimeInSeconds: number;
  trafficDelayInSeconds?: number;
  trafficLengthInMeters?: number;
  departureTime: string;
  arrivalTime: string;
  noTrafficTravelTimeInSeconds?: number;
  historicTrafficTravelTimeInSeconds?: number;
  liveTrafficIncidentsTravelTimeInSeconds?: number;
  fuelConsumptionInLiters?: number;
  batteryConsumptionInkWh?: number;
  deviationDistance?: number;
  deviationTime?: number;
  deviationPoint?: ApiPoint;
  reachableRouteOffsets?: ReachableRouteOffset[];
  planningReason?: string;
}

export interface ReachableRouteOffset {
  chargeMarginInkWh: number;
  routeOffsetInMeters: number;
  point: ApiPoint;
  pointIndex: number;
}

/** Route reassessment result. Present only when reassessmentParameterSets was in the request. */
export interface RouteReassessment {
  batteryConsumptionInkWh?: number;
  reachableRouteOffsets?: ReachableRouteOffset[];
}

/** Progress point. Present when extendedRouteRepresentation was requested. */
export interface ProgressPoint {
  pointIndex: number;
  distanceInMeters?: number;
  travelTimeInSeconds?: number;
  batteryConsumptionInkWh?: number;
}

/** Leg summary. Optional fields depend on request (e.g. entryPoints, pauseTime). */
export interface LegSummary extends RouteSummary {
  originalWaypointIndexAtEndOfLeg?: number;
  userDefinedPauseTimeInSeconds?: number;
  entryPointIndexAtEndOfLeg?: number;
}

/** A leg of the route. */
export interface RouteLeg {
  summary: LegSummary;
  points?: ApiPoint[];
  encodedPolyline?: string;
  encodedPolylinePrecision?: number;
}

/**
 * Section types in the response.
 * Note: `TOLL_ROAD` is deprecated by TomTom (withdrawal March 15, 2025). Prefer `TOLL` and `TOLL_VIGNETTE`.
 */
export type ResponseSectionType =
  | 'CAR_TRAIN'
  | 'COUNTRY'
  | 'FERRY'
  | 'MOTORWAY'
  | 'PEDESTRIAN'
  | /** @deprecated Use TOLL | TOLL_VIGNETTE. Withdrawal March 15, 2025. */ 'TOLL_ROAD'
  | 'TOLL'
  | 'TOLL_VIGNETTE'
  | 'TRAFFIC'
  | 'TRAVEL_MODE'
  | 'TUNNEL'
  | 'CARPOOL'
  | 'URBAN'
  | 'UNPAVED'
  | 'LOW_EMISSION_ZONE'
  | 'ROAD_SHIELDS'
  | 'SPEED_LIMIT'
  | 'IMPORTANT_ROAD_STRETCH';

/** Base section object. */
export interface RouteSectionBase {
  startPointIndex: number;
  endPointIndex: number;
  sectionType: ResponseSectionType;
}

export interface RouteSectionCountry extends RouteSectionBase {
  sectionType: 'COUNTRY';
  countryCode: string;
}

export interface RouteSectionTravelMode extends RouteSectionBase {
  sectionType: 'TRAVEL_MODE';
  travelMode: string;
}

export interface RouteSectionToll extends RouteSectionBase {
  sectionType: 'TOLL';
  tollPaymentTypes?: string[];
}

/** TOLL_VIGNETTE sections additionally contain countryCode (toll vignettes are often country-specific). */
export interface RouteSectionTollVignette extends RouteSectionBase {
  sectionType: 'TOLL_VIGNETTE';
  countryCode?: string;
}

/** Road shield reference (when sectionType=roadShields). */
export interface RoadShieldReference {
  reference: string;
  shieldContent?: string;
  affixes?: string[];
}

export interface RouteSectionRoadShields extends RouteSectionBase {
  sectionType: 'ROAD_SHIELDS';
  roadShieldReferences?: RoadShieldReference[];
}

export interface RouteSectionTraffic extends RouteSectionBase {
  sectionType: 'TRAFFIC';
  simpleCategory?: string;
  effectiveSpeedInKmh?: number;
  delayInSeconds?: number;
  magnitudeOfDelay?: number;
  tec?: {
    effectCode?: number;
    causes?: Array<{ mainCauseCode?: number; subCauseCode?: number }>;
  };
  eventId?: string;
}

export interface RouteSectionImportantRoadStretch extends RouteSectionBase {
  sectionType: 'IMPORTANT_ROAD_STRETCH';
  importantRoadStretchIndex: number;
  streetName?: { text: string };
  roadNumbers?: Array<{ text: string }>;
}

export type RouteSection =
  | RouteSectionBase
  | RouteSectionCountry
  | RouteSectionTravelMode
  | RouteSectionToll
  | RouteSectionTollVignette
  | RouteSectionTraffic
  | RouteSectionImportantRoadStretch
  | RouteSectionRoadShields;

/** A single route in the response. */
export interface Route {
  summary: RouteSummary;
  legs: RouteLeg[];
  /** Present when sectionType was requested. */
  sections?: RouteSection[];
  /** Present when extendedRouteRepresentation was requested. */
  progress?: ProgressPoint[];
  /** Present only when reassessmentParameterSets was in the request. */
  routeReassessments?: RouteReassessment[];
}

/** Effective setting from report. */
export interface EffectiveSetting {
  key: string;
  value: string;
}

/** Optimized waypoint. Present only when computeBestOrder=true was in the request. */
export interface OptimizedWaypoint {
  providedIndex: number;
  optimizedIndex: number;
}

/** Successful Calculate Route response. Optional top-level fields depend on request. */
export interface CalculateRouteResponse {
  formatVersion: string;
  routes: Route[];
  /** Present when report=effectiveSettings was requested. */
  report?: { effectiveSettings: EffectiveSetting[] };
  /** Present when computeBestOrder=true was in the request. */
  optimizedWaypoints?: OptimizedWaypoint[];
  /**
   * Base URL of the Road Shields service (sprite.png, sprite.json).
   * Present when sectionType=roadShields was requested.
   * @see https://docs.tomtom.com/routing-api/documentation/tomtom-maps/road-shields-notes
   */
  roadShieldAtlasReference?: string;
  /** For contentType=jsonp only. */
  statusCode?: number;
}

// --- Error response ---

export interface CalculateRouteErrorDetail {
  code: string;
  message: string;
}

export interface CalculateRouteErrorResponse {
  formatVersion: string;
  detailedError: CalculateRouteErrorDetail;
  statusCode?: number;
}

/** Thrown when the API returns an error (HTTP 4xx/5xx or body with detailedError). */
export class TomTomRoutingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly rawMessage?: string,
  ) {
    super(message);
    this.name = 'TomTomRoutingError';
    Object.setPrototypeOf(this, TomTomRoutingError.prototype);
  }
}
