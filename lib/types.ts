export type Stage = "idle" | "bridge" | "route" | "detecting" | "results";
export type RouteType = "deck" | "side-north" | "side-south" | "underside";

export interface Waypoint {
  id: string;
  routeId: string;
  routeType: RouteType;
  routeName: string;
  color: string;
  position: [number, number, number];
  longitude: number;
  latitude: number;
  altitude: number;
  speed: number;
  gimbalPitch: number;
  yaw: number;
  direction: string;
  component: string;
  task: string;
}

export interface InspectionRoute {
  id: string;
  type: RouteType;
  label: string;
  color: string;
  waypoints: Waypoint[];
}

export type RiskLevel = "轻微" | "关注" | "较高";

export interface CrackRecord {
  id: string;
  component: string;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  maxWidth: number;
  length: number;
  confidence: number;
  risk: RiskLevel;
  image: string;
  note: string;
  mask: Array<[number, number]>;
}
