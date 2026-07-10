import type { CrackRecord, InspectionRoute, RouteType, Waypoint } from "./types";

const baseLng = 113.264385;
const baseLat = 23.129112;
const spacing = 2;
const publicBase = import.meta.env?.BASE_URL ?? "/";
const inspectionImage = (name: string) => `${publicBase}inspection/${name}`;

type Point3 = [number, number, number];

function samplePolyline(vertices: Point3[]): Point3[] {
  const sampled: Point3[] = [vertices[0]];
  for (let segment = 0; segment < vertices.length - 1; segment += 1) {
    const start = vertices[segment];
    const end = vertices[segment + 1];
    const length = Math.hypot(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
    const steps = Math.max(1, Math.ceil(length / spacing));
    for (let step = 1; step <= steps; step += 1) {
      const t = step / steps;
      sampled.push([
        Number((start[0] + (end[0] - start[0]) * t).toFixed(3)),
        Number((start[1] + (end[1] - start[1]) * t).toFixed(3)),
        Number((start[2] + (end[2] - start[2]) * t).toFixed(3)),
      ]);
    }
  }
  return sampled;
}

function bridgeComponent(x: number, surface: string) {
  const span = Math.min(6, Math.max(1, Math.floor((x + 90) / 30) + 1));
  return `第${span}跨${surface}`;
}

function makeRoute(config: {
  id: string;
  prefix: string;
  type: RouteType;
  label: string;
  color: string;
  vertices: Point3[];
  speed: number;
  gimbalPitch: number;
  yaw: number;
  direction: string;
  surface: string;
  task: string;
}): InspectionRoute {
  const routePoints = samplePolyline(config.vertices);
  const waypoints: Waypoint[] = routePoints.map((position, index) => ({
    id: `${config.prefix}-${String(index + 1).padStart(3, "0")}`,
    routeId: config.id,
    routeType: config.type,
    routeName: config.label,
    color: config.color,
    position,
    longitude: Number((baseLng + position[0] * 0.0000091).toFixed(6)),
    latitude: Number((baseLat + position[2] * 0.000009).toFixed(6)),
    altitude: Number(position[1].toFixed(1)),
    speed: config.speed,
    gimbalPitch: config.gimbalPitch,
    yaw: config.yaw,
    direction: config.direction,
    component: bridgeComponent(position[0], config.surface),
    task: config.task,
  }));
  return { id: config.id, type: config.type, label: config.label, color: config.color, waypoints };
}

const undersideVertices: Point3[] = [[-86, 3.3, 0]];
[-60, -30, 0, 30, 60].forEach((pierX, index) => {
  const detourZ = index % 2 === 0 ? 5.2 : -5.2;
  undersideVertices.push(
    [pierX - 5, 3.3, 0],
    [pierX - 3, 3.3, detourZ],
    [pierX + 3, 3.3, detourZ],
    [pierX + 5, 3.3, 0],
  );
});
undersideVertices.push([86, 3.3, 0]);

export const inspectionRoutes: InspectionRoute[] = [
  makeRoute({
    id: "route-deck", prefix: "D", type: "deck", label: "桥面俯视巡检航线", color: "#38e7f3",
    vertices: [[-86, 17.8, 0], [86, 17.8, 0]], speed: 3, gimbalPitch: -90, yaw: 90,
    direction: "沿桥向东，镜头垂直向下", surface: "桥面", task: "桥面铺装与桥面裂缝俯视采集",
  }),
  makeRoute({
    id: "route-side-north", prefix: "N", type: "side-north", label: "桥梁北侧面巡检航线", color: "#ffb347",
    vertices: [[-86, 8.5, 9.5], [86, 8.5, 9.5]], speed: 2.4, gimbalPitch: 0, yaw: -90,
    direction: "沿桥向东，镜头朝向桥梁", surface: "北侧梁腹板", task: "桥侧面裂缝、渗水与剥落巡检",
  }),
  makeRoute({
    id: "route-side-south", prefix: "S", type: "side-south", label: "桥梁南侧面巡检航线", color: "#78a9ff",
    vertices: [[86, 8.5, -9.5], [-86, 8.5, -9.5]], speed: 2.4, gimbalPitch: 0, yaw: 90,
    direction: "沿桥向西，镜头朝向桥梁", surface: "南侧梁腹板", task: "桥侧面裂缝、渗水与剥落巡检",
  }),
  makeRoute({
    id: "route-underside", prefix: "U", type: "underside", label: "桥底避墩折线巡检航线", color: "#ff5274",
    vertices: undersideVertices, speed: 1.6, gimbalPitch: 90, yaw: 90,
    direction: "折线绕避桥墩，镜头垂直向上", surface: "梁底", task: "梁底裂缝、露筋与支座区域巡检",
  }),
];

export const waypoints: Waypoint[] = inspectionRoutes.flatMap((route) => route.waypoints);

export const cracks: CrackRecord[] = [
  { id: "CR-001", component: "第2跨外侧梁腹板", position: [-43, 6.6, 4.1], cameraPosition: [-40, 12, 22], maxWidth: 0.18, length: 126, confidence: 96.8, risk: "关注", image: inspectionImage("crack-001.png"), note: "竖向细裂缝，建议纳入周期性复测。", mask: [[38,18],[42,29],[40,40],[46,53],[44,68],[51,82]] },
  { id: "CR-002", component: "2#桥墩墩柱", position: [-30, 3.1, 1.1], cameraPosition: [-18, 8, 18], maxWidth: 0.12, length: 88, confidence: 94.2, risk: "轻微", image: inspectionImage("crack-002.png"), note: "表层收缩裂缝，当前未见明显扩展。", mask: [[25,22],[34,31],[43,38],[52,50],[64,57],[76,68]] },
  { id: "CR-003", component: "第3跨梁底", position: [-14, 5.45, 0], cameraPosition: [-10, 0.8, 19], maxWidth: 0.22, length: 164, confidence: 97.4, risk: "较高", image: inspectionImage("crack-003.png"), note: "梁底横向裂缝，建议开展近距离复核。", mask: [[18,44],[31,46],[43,43],[55,48],[67,45],[82,50]] },
  { id: "CR-004", component: "3#桥墩盖梁", position: [0, 5.7, 3.4], cameraPosition: [7, 12, 22], maxWidth: 0.15, length: 102, confidence: 95.6, risk: "关注", image: inspectionImage("crack-004.png"), note: "盖梁侧面斜裂缝，建议建立观测标记。", mask: [[28,18],[35,31],[43,44],[50,55],[58,68],[67,82]] },
  { id: "CR-005", component: "第5跨外侧梁腹板", position: [43, 6.5, -4.1], cameraPosition: [40, 12, -22], maxWidth: 0.09, length: 74, confidence: 92.7, risk: "轻微", image: inspectionImage("crack-005.png"), note: "局部细微裂纹，建议常规养护观察。", mask: [[20,28],[31,34],[40,45],[52,48],[63,59],[79,64]] },
  { id: "CR-006", component: "第6跨梁底", position: [73, 5.45, 1.8], cameraPosition: [77, 0.8, 20], maxWidth: 0.26, length: 191, confidence: 98.1, risk: "较高", image: inspectionImage("crack-006.png"), note: "梁底纵向裂缝，需优先安排人工复核。", mask: [[16,58],[29,52],[42,55],[56,47],[70,50],[85,42]] },
];

export const detectionSteps = ["载入巡检图像", "图像质量预处理", "AI 模型推理", "裂缝像素分割", "宽度与长度计算", "三维位置匹配"];
