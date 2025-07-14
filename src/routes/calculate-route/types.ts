import { Point } from "../../types";

type TravelMode =
  | "truck"
  | "taxi"
  | "bus"
  | "van"
  | "motorcycle"
  | "bicycle"
  | "pedestrian";

type CalculateRouteOptions = {
  from: Point;
  to: Point;
  waypoints?: Point[];
  routeType?: "fastest" | "shortest" | "eco" | "thrilling";
  traffic?: boolean;
  sectionType?:
    | "carTrain"
    | "ferry"
    | "tunnel"
    | "motorway"
    | "pedestrian"
    | "toll"
    | "tollRoad"
    | "tollVignette"
    | "country"
    | "travelMode"
    | "traffic";
  travelMode?: TravelMode;
};

type Summary = {
  lengthInMeters: number;
  travelTimeInSeconds: number;
  trafficDelayInSeconds: number;
  trafficLengthInMeters: number;
  departureTime: number;
  arrivalTime: number;
};

type Section = {
  startPointIndex: number;
  endPointIndex: number;
  sectionType: string;
  travelMode: TravelMode;
  countryCode: string;
};

type Leg = {
  summary: Summary;
  points: {
    latitude: number;
    longitude: number;
  }[];
};

type CalculateRouteResponse = {
  routes: {
    summary: Summary;
    sections: Section[];
    legs: Leg[];
  }[];
};

export { CalculateRouteOptions, CalculateRouteResponse };
