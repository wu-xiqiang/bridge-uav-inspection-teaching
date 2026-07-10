"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls, RoundedBox } from "@react-three/drei";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CrackRecord, InspectionRoute, RouteType, Stage, Waypoint } from "@/lib/types";
import { cracks, inspectionRoutes } from "@/lib/teaching-data";
import { CrackImageViewer } from "./CrackImageViewer";

interface BridgeSceneProps {
  stage: Stage;
  showRoute: boolean;
  autoRotate: boolean;
  resetToken: number;
  selectedWaypoint: Waypoint | null;
  selectedCrack: CrackRecord | null;
  onSelectWaypoint: (waypoint: Waypoint | null) => void;
  onSelectCrack: (crack: CrackRecord) => void;
  onUserInteraction: () => void;
}

const concrete = "#a9afb1";
const concreteDark = "#7e878a";

function BridgeModel({ selectedCrack, onSelectCrack }: Pick<BridgeSceneProps, "selectedCrack" | "onSelectCrack">) {
  const group = useRef<THREE.Group>(null);
  const built = useRef(0);

  useFrame((_, delta) => {
    built.current = Math.min(1, built.current + delta * 0.42);
    if (group.current) {
      const eased = 1 - Math.pow(1 - built.current, 3);
      group.current.scale.set(1, eased, 1);
    }
  });

  const spanCenters = [-75, -45, -15, 15, 45, 75];
  const pierPositions = [-60, -30, 0, 30, 60];

  return (
    <group ref={group} position={[0, 0, 0]}>
      {spanCenters.map((x, spanIndex) => (
        <group key={x}>
          <mesh position={[x, 7.35, 0]} castShadow receiveShadow>
            <boxGeometry args={[29.5, 0.75, 9]} />
            <meshStandardMaterial color={spanIndex % 2 ? "#aeb4b5" : "#b6bbbc"} roughness={0.88} />
          </mesh>
          {[-3.1, 0, 3.1].map((z) => (
            <mesh key={z} position={[x, 6.15, z]} castShadow receiveShadow>
              <boxGeometry args={[29.1, 1.65, 1.1]} />
              <meshStandardMaterial color={concrete} roughness={0.92} />
            </mesh>
          ))}
          {[-4.35, 4.35].map((z) => (
            <RoundedBox key={z} position={[x, 8.28, z]} args={[29.6, 1.15, 0.32]} radius={0.08} smoothness={2} castShadow>
              <meshStandardMaterial color="#c3c8c8" roughness={0.86} />
            </RoundedBox>
          ))}
          <mesh position={[x, 7.76, 0]} receiveShadow>
            <boxGeometry args={[29.55, 0.08, 8.1]} />
            <meshStandardMaterial color="#525a5d" roughness={0.96} />
          </mesh>
          {[-90, -60, -30, 0, 30, 60, 90].includes(x - 15) && (
            <mesh position={[x - 14.76, 7.81, 0]}>
              <boxGeometry args={[0.18, 0.09, 8.3]} />
              <meshStandardMaterial color="#242a2c" />
            </mesh>
          )}
        </group>
      ))}

      {pierPositions.map((x, index) => (
        <group key={x}>
          {[-2.25, 2.25].map((z) => (
            <RoundedBox key={z} position={[x, 2.8, z]} args={[1.75, 5.6, 1.75]} radius={0.18} smoothness={3} castShadow receiveShadow>
              <meshStandardMaterial color={index % 2 ? "#9da4a5" : "#a5abad"} roughness={0.94} />
            </RoundedBox>
          ))}
          <RoundedBox position={[x, 5.55, 0]} args={[2.35, 0.8, 9.4]} radius={0.12} smoothness={3} castShadow>
            <meshStandardMaterial color={concreteDark} roughness={0.9} />
          </RoundedBox>
          {[-3.1, 0, 3.1].map((z) => (
            <mesh key={z} position={[x, 5.98, z]} castShadow>
              <boxGeometry args={[1.7, 0.22, 0.85]} />
              <meshStandardMaterial color="#3c4547" roughness={0.75} />
            </mesh>
          ))}
          <mesh position={[x, 0.12, 0]} receiveShadow>
            <boxGeometry args={[4.5, 0.25, 7]} />
            <meshStandardMaterial color="#737b7b" roughness={1} />
          </mesh>
        </group>
      ))}

      {[-90, 90].map((x, index) => (
        <group key={x}>
          <RoundedBox position={[x, 3.1, 0]} args={[3.3, 6.2, 9.6]} radius={0.16} smoothness={3} castShadow receiveShadow>
            <meshStandardMaterial color="#989fa0" roughness={0.94} />
          </RoundedBox>
          <mesh position={[x + (index ? 3.2 : -3.2), 6.7, 0]} rotation={[0, 0, index ? -0.18 : 0.18]}>
            <boxGeometry args={[6.8, 0.6, 9]} />
            <meshStandardMaterial color="#80898a" roughness={0.96} />
          </mesh>
        </group>
      ))}

      {cracks.map((crack) => (
        <CrackMark key={crack.id} crack={crack} selected={selectedCrack?.id === crack.id} onSelect={onSelectCrack} />
      ))}
    </group>
  );
}

function CrackMark({ crack, selected, onSelect }: { crack: CrackRecord; selected: boolean; onSelect: (crack: CrackRecord) => void }) {
  const points = useMemo(() => {
    const [x, y, z] = crack.position;
    if (crack.component.includes("梁底")) {
      return [[x - 1.2, y, z - 0.2], [x - 0.5, y - 0.02, z + 0.1], [x, y, z - 0.08], [x + 0.7, y, z + 0.14], [x + 1.25, y, z]] as Array<[number, number, number]>;
    }
    return [[x - 0.6, y + 0.8, z], [x - 0.2, y + 0.35, z + 0.02], [x - 0.35, y, z], [x + 0.18, y - 0.45, z + 0.02], [x + 0.4, y - 0.9, z]] as Array<[number, number, number]>;
  }, [crack]);
  const cardPosition = useMemo<[number, number, number]>(() => {
    const [x, y, z] = crack.position;
    const sideOffset = z < -2 ? -3.8 : 3.8;
    return [x + 4.2, y + 2.8, z + sideOffset];
  }, [crack]);

  return (
    <group onClick={(event) => { event.stopPropagation(); onSelect(crack); }}>
      <Line points={points} color={selected ? "#ff3b4f" : "#353233"} lineWidth={selected ? 4 : 1.4} />
      {selected && (
        <>
          <mesh position={crack.position}>
            <sphereGeometry args={[0.3, 20, 20]} />
            <meshBasicMaterial color="#ff334d" transparent opacity={0.22} />
          </mesh>
          <Line points={[crack.position, cardPosition]} color="#ff455e" lineWidth={1.4} transparent opacity={0.9} />
          <Html position={cardPosition} center distanceFactor={10} zIndexRange={[30, 10]}>
            <div className="scene-crack-card" data-testid="scene-crack-card" onPointerDown={(event) => event.stopPropagation()}>
              <div className="scene-crack-heading"><span>三维病害定位</span><b>{crack.id}</b></div>
              <CrackImageViewer crack={crack} showMask />
              <div className="scene-crack-metrics">
                <div><small>所在位置</small><b>{crack.component}</b></div>
                <div><small>最大宽度</small><b className="danger-value">{crack.maxWidth.toFixed(2)} mm</b></div>
                <div><small>识别置信度</small><b>{crack.confidence}%</b></div>
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

function RouteLayer({ selectedWaypoint, onSelectWaypoint }: Pick<BridgeSceneProps, "selectedWaypoint" | "onSelectWaypoint">) {
  return (
    <group>
      {inspectionRoutes.map((route, index) => (
        <RouteBand key={route.id} route={route} selectedWaypoint={selectedWaypoint} onSelectWaypoint={onSelectWaypoint} droneOffset={index * 0.21} />
      ))}
    </group>
  );
}

function RouteBand({ route, selectedWaypoint, onSelectWaypoint, droneOffset }: {
  route: InspectionRoute;
  selectedWaypoint: Waypoint | null;
  onSelectWaypoint: (waypoint: Waypoint) => void;
  droneOffset: number;
}) {
  const routePoints = useMemo(() => route.waypoints.map((waypoint) => new THREE.Vector3(...waypoint.position)), [route]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(routePoints, false, "catmullrom", 0.12), [routePoints]);
  const selected = selectedWaypoint?.routeId === route.id ? selectedWaypoint : null;
  const start = route.waypoints[0].position;
  return (
    <group>
      <Line points={routePoints} color={route.color} lineWidth={2.4} transparent opacity={0.9} />
      <WaypointInstances route={route} onSelectWaypoint={onSelectWaypoint} />
      <Html position={[start[0] + 2, start[1] + 1.2, start[2]]} center distanceFactor={19}>
        <div className="route-label" style={{ borderColor: route.color }}>{route.label}</div>
      </Html>
      {selected && (
        <group position={selected.position}>
          <mesh>
            <sphereGeometry args={[0.56, 20, 20]} />
            <meshStandardMaterial color="#ffad32" emissive="#ff7a00" emissiveIntensity={1.9} />
          </mesh>
          <Html center position={[0, 1.1, 0]} distanceFactor={18}>
            <button className="waypoint-label is-active" onClick={(event) => { event.stopPropagation(); onSelectWaypoint(selected); }}>{selected.id}</button>
          </Html>
          <CameraFrustum routeType={selected.routeType} />
        </group>
      )}
      <Drone curve={curve} color={route.color} offset={droneOffset} />
    </group>
  );
}

function WaypointInstances({ route, onSelectWaypoint }: { route: InspectionRoute; onSelectWaypoint: (waypoint: Waypoint) => void }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const transform = new THREE.Object3D();
    route.waypoints.forEach((waypoint, index) => {
      transform.position.set(...waypoint.position);
      transform.updateMatrix();
      mesh.current?.setMatrixAt(index, transform.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [route]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, route.waypoints.length]}
      onClick={(event) => {
        event.stopPropagation();
        if (event.instanceId !== undefined) onSelectWaypoint(route.waypoints[event.instanceId]);
      }}
    >
      <sphereGeometry args={[0.22, 10, 10]} />
      <meshStandardMaterial color={route.color} emissive={route.color} emissiveIntensity={0.75} />
    </instancedMesh>
  );
}

function CameraFrustum({ routeType }: { routeType: RouteType }) {
  const direction = useMemo(() => {
    const vectors: Record<RouteType, THREE.Vector3> = {
      deck: new THREE.Vector3(0, -4.5, 0),
      underside: new THREE.Vector3(0, 4.5, 0),
      "side-north": new THREE.Vector3(0, 0, -4.5),
      "side-south": new THREE.Vector3(0, 0, 4.5),
    };
    return vectors[routeType];
  }, [routeType]);
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()), [direction]);
  return (
    <group>
      <group quaternion={quaternion}>
        <mesh position={[0, 2.25, 0]}>
        <coneGeometry args={[1.45, 4.5, 4, 1, true]} />
        <meshBasicMaterial color="#ffad32" transparent opacity={0.14} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <Line points={[[0, 0, 0], direction]} color="#ffad32" lineWidth={1.5} />
    </group>
  );
}

function Drone({ curve, color, offset }: { curve: THREE.CatmullRomCurve3; color: string; offset: number }) {
  const group = useRef<THREE.Group>(null);
  const rotors = useRef<Array<THREE.Mesh | null>>([]);
  useFrame(({ clock }, delta) => {
    const t = (clock.elapsedTime * 0.018 + offset) % 1;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    if (group.current) {
      group.current.position.copy(point);
      group.current.rotation.y = Math.atan2(tangent.x, tangent.z);
    }
    rotors.current.forEach((rotor) => { if (rotor) rotor.rotation.y += delta * 18; });
  });
  return (
    <group ref={group} scale={0.9}>
      <RoundedBox args={[1.35, 0.38, 0.8]} radius={0.18} smoothness={2} castShadow>
        <meshStandardMaterial color="#182326" metalness={0.7} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, -0.35, 0.32]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#0e1112" metalness={0.45} roughness={0.15} />
      </mesh>
      {[[-0.9, 0, -0.72], [0.9, 0, -0.72], [-0.9, 0, 0.72], [0.9, 0, 0.72]].map((p, index) => (
        <group key={index} position={p as [number, number, number]}>
          <mesh rotation={[0, 0, index % 2 ? -0.55 : 0.55]}>
            <boxGeometry args={[1.2, 0.08, 0.08]} />
            <meshStandardMaterial color="#263437" metalness={0.6} />
          </mesh>
          <mesh ref={(el) => { rotors.current[index] = el; }} position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.72, 0.72, 0.035, 24]} />
            <meshBasicMaterial color="#b9f6ff" transparent opacity={0.38} />
          </mesh>
        </group>
      ))}
      <pointLight color={color} intensity={1.6} distance={4} />
    </group>
  );
}

function CameraController({ selectedWaypoint, selectedCrack, resetToken, autoRotate, onUserInteraction }: Pick<BridgeSceneProps, "selectedWaypoint" | "selectedCrack" | "resetToken" | "autoRotate" | "onUserInteraction">) {
  const { camera } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const desiredPosition = useRef(new THREE.Vector3(64, 34, 82));
  const desiredTarget = useRef(new THREE.Vector3(0, 4.5, 0));
  const lastReset = useRef(resetToken);
  const lastSelection = useRef("");
  const isFlying = useRef(false);

  useFrame((_, delta) => {
    if (lastReset.current !== resetToken) {
      desiredPosition.current.set(64, 34, 82);
      desiredTarget.current.set(0, 4.5, 0);
      lastReset.current = resetToken;
      isFlying.current = true;
    }
    const selectionKey = selectedCrack ? `crack:${selectedCrack.id}` : selectedWaypoint ? `waypoint:${selectedWaypoint.id}` : "";
    if (selectionKey && selectionKey !== lastSelection.current) {
      if (selectedCrack) {
        desiredPosition.current.set(...selectedCrack.cameraPosition);
        desiredTarget.current.set(...selectedCrack.position);
      } else if (selectedWaypoint) {
        const [x, y, z] = selectedWaypoint.position;
        const offsetZ = selectedWaypoint.routeType === "side-south" ? -12 : 12;
        desiredPosition.current.set(x + 7, y + 6, z + offsetZ);
        desiredTarget.current.set(x, y, z);
      }
      isFlying.current = true;
    }
    lastSelection.current = selectionKey;
    if (isFlying.current && controls.current) {
      const speed = 1 - Math.exp(-delta * 2.4);
      camera.position.lerp(desiredPosition.current, speed);
      controls.current.target.lerp(desiredTarget.current, speed);
      controls.current.update();
      if (camera.position.distanceTo(desiredPosition.current) < 0.08 && controls.current.target.distanceTo(desiredTarget.current) < 0.04) {
        isFlying.current = false;
      }
    }
  });

  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.07} minDistance={6} maxDistance={360} maxPolarAngle={Math.PI * 0.49} minPolarAngle={0.08} autoRotate={autoRotate} autoRotateSpeed={0.45} zoomToCursor onStart={() => { isFlying.current = false; onUserInteraction(); }} />;
}

function Ground() {
  const grassTufts = useMemo(() => Array.from({ length: 160 }, (_, i) => ({
    x: ((i * 47) % 198) - 99,
    z: ((i * 83) % 70) - 35,
    s: 0.25 + (i % 5) * 0.07,
  })), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[230, 90, 1, 1]} />
        <meshStandardMaterial color="#50654d" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[210, 17]} />
        <meshStandardMaterial color="#7a715d" roughness={1} />
      </mesh>
      {grassTufts.map((item, i) => Math.abs(item.z) > 10 && (
        <mesh key={i} position={[item.x, item.s / 2, item.z]} rotation={[0, i, 0]}>
          <coneGeometry args={[item.s * 0.55, item.s, 4]} />
          <meshStandardMaterial color={i % 3 ? "#66805a" : "#7b925e"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function BridgeScene(props: BridgeSceneProps) {
  const bridgeVisible = props.stage !== "idle";
  const routeVisible = props.showRoute && ["route", "detecting", "results"].includes(props.stage);
  return (
    <Canvas
      shadows
      dpr={[1, 1.65]}
      camera={{ position: [64, 34, 82], fov: 42, near: 0.1, far: 650 }}
      onPointerMissed={() => props.onSelectWaypoint(null)}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0b151b"]} />
      <fog attach="fog" args={["#15252a", 120, 270]} />
      <ambientLight intensity={1.05} color="#b5d7dc" />
      <hemisphereLight args={["#b5e5ee", "#34422e", 1.3]} />
      <directionalLight position={[35, 55, 28]} intensity={2.3} color="#fff4d8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-120} shadow-camera-right={120} shadow-camera-top={60} shadow-camera-bottom={-60} />
      <Suspense fallback={null}>
        <Ground />
        {bridgeVisible && <BridgeModel selectedCrack={props.selectedCrack} onSelectCrack={props.onSelectCrack} />}
        {routeVisible && <RouteLayer selectedWaypoint={props.selectedWaypoint} onSelectWaypoint={props.onSelectWaypoint} />}
      </Suspense>
      <CameraController selectedWaypoint={props.selectedWaypoint} selectedCrack={props.selectedCrack} resetToken={props.resetToken} autoRotate={props.autoRotate} onUserInteraction={props.onUserInteraction} />
    </Canvas>
  );
}
