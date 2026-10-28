import { memo, useMemo } from "react"
import * as THREE from "three"
import { RigidBody } from "@react-three/rapier"
import { TeleportTarget } from "@react-three/xr"
import { Billboard, Float, Text } from "@react-three/drei"
import {
  ATRIUM_R,
  DOOR_HEIGHT,
  DOOR_WIDTH,
  FLOOR_H,
  LOBBY_APOTHEM,
  lobbyFaceCount,
  SLAB,
  topFloor,
  WALL_H,
  type RoomConfig,
} from "../config/rooms.config"
import { theme, fonts, mat, accentText } from "../config/theme"
import { useAppStore } from "../store/useAppStore"
import { STAIR_ARRIVAL, STAIR_DEPARTURE, stairTurn } from "../config/stairs.config"
import { Stairs } from "./Stairs"

const LINTEL_H = WALL_H - DOOR_HEIGHT
const FLOOR_R = 9.2 // floor polygon circumradius, reaching under the walls
const ATRIUM_SIDES = 24 // the atrium is near-round whatever the lobby's face count
const RAIL_H = 0.95
const mod = (a: number, m: number) => ((a % m) + m) % m

interface LobbyGeo {
  n: number
  sideW: number
  faceW: number
  floorTheta: number
  ringTheta: number
  angles: number[]
}

/** Upper-floor slab: the lobby polygon with the round atrium cut out, top at y = 0. */
function slabGeometry(geo: LobbyGeo) {
  // Shape space (x, y) becomes world (x, -z) after rotateX(-90°); points follow
  // the CylinderGeometry convention of the ground floor (x = r sin θ, z = r cos θ).
  const outer = new THREE.Shape()
  for (let i = 0; i < geo.n; i++) {
    const t = geo.floorTheta + (i / geo.n) * Math.PI * 2
    const [x, y] = [FLOOR_R * Math.sin(t), -FLOOR_R * Math.cos(t)]
    if (i === 0) outer.moveTo(x, y)
    else outer.lineTo(x, y)
  }
  const hole = new THREE.Path()
  for (let i = 0; i < ATRIUM_SIDES; i++) {
    const t = (i / ATRIUM_SIDES) * Math.PI * 2
    const [x, y] = [ATRIUM_R * Math.cos(t), ATRIUM_R * Math.sin(t)]
    if (i === 0) hole.moveTo(x, y)
    else hole.lineTo(x, y)
  }
  outer.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(outer, { depth: SLAB, bevelEnabled: false })
  g.rotateX(-Math.PI / 2)
  g.translate(0, -SLAB, 0)
  return g
}

/** World (x, z) seen from a staircase turned by `turn`. */
function toStairFrame(x: number, z: number, turn: number) {
  const c = Math.cos(turn)
  const s = Math.sin(turn)
  return { x: x * c - z * s, z: x * s + z * c }
}

/**
 * Atrium railing segments for `floor`, leaving gaps where the staircase from
 * below arrives and where the next one leaves.
 */
function railSegments(floor: number, top: number) {
  const ends = [{ turn: stairTurn(floor - 1), ...STAIR_ARRIVAL }]
  if (floor < top) ends.push({ turn: stairTurn(floor), ...STAIR_DEPARTURE })
  const r = ATRIUM_R * Math.cos(Math.PI / ATRIUM_SIDES) + 0.04 // on the slab, just outside the edge
  const segs: { position: [number, number, number]; rotationY: number; length: number }[] = []
  for (let i = 0; i < ATRIUM_SIDES; i++) {
    const a0 = (i / ATRIUM_SIDES) * Math.PI * 2
    const a1 = ((i + 1) / ATRIUM_SIDES) * Math.PI * 2
    // the hole's points are (R cos t, R sin t) in shape space = (R cos t, -R sin t) in world xz
    const p0 = { x: ATRIUM_R * Math.cos(a0), z: -ATRIUM_R * Math.sin(a0) }
    const p1 = { x: ATRIUM_R * Math.cos(a1), z: -ATRIUM_R * Math.sin(a1) }
    const blocked = ends.some((e) => {
      const q0 = toStairFrame(p0.x, p0.z, e.turn)
      const q1 = toStairFrame(p1.x, p1.z, e.turn)
      const zLo = Math.min(q0.z, q1.z)
      const zHi = Math.max(q0.z, q1.z)
      return q0.x < e.x && q1.x < e.x && zHi > e.zMin - 0.05 && zLo < e.zMax + 0.05
    })
    if (blocked) continue
    const mid = (a0 + a1) / 2
    segs.push({
      position: [r * Math.cos(mid), RAIL_H / 2, -r * Math.sin(mid)],
      rotationY: mid + Math.PI / 2,
      length: 2 * ATRIUM_R * Math.sin(Math.PI / ATRIUM_SIDES) + 0.02,
    })
  }
  return segs
}

/** Perimeter walls of one floor: a doorway on each face that has a room. */
function LobbyWalls({ geo, rooms, floor }: { geo: LobbyGeo; rooms: RoomConfig[]; floor: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" key={`walls-${geo.n}-${floor}`}>
      {geo.angles.map((angle, i) => {
        const room = rooms.find((r) => r.face === i)
        return (
          <group key={room?.slug ?? `face-${i}`} rotation-y={angle}>
            {room ? (
              <>
                <mesh
                  position={[-(DOOR_WIDTH / 2 + geo.sideW / 2), WALL_H / 2, LOBBY_APOTHEM + 0.1]}
                  material={mat(theme.walls)}
                >
                  <boxGeometry args={[geo.sideW, WALL_H, 0.2]} />
                </mesh>
                <mesh
                  position={[DOOR_WIDTH / 2 + geo.sideW / 2, WALL_H / 2, LOBBY_APOTHEM + 0.1]}
                  material={mat(theme.walls)}
                >
                  <boxGeometry args={[geo.sideW, WALL_H, 0.2]} />
                </mesh>
                <mesh position={[0, DOOR_HEIGHT + LINTEL_H / 2, LOBBY_APOTHEM + 0.1]} material={mat(theme.walls)}>
                  <boxGeometry args={[DOOR_WIDTH, LINTEL_H, 0.2]} />
                </mesh>
              </>
            ) : (
              <mesh position={[0, WALL_H / 2, LOBBY_APOTHEM + 0.1]} material={mat(theme.walls)}>
                <boxGeometry args={[geo.faceW, WALL_H, 0.2]} />
              </mesh>
            )}
          </group>
        )
      })}
    </RigidBody>
  )
}

const UpperFloor = memo(function UpperFloor({ geo, floor, top }: { geo: LobbyGeo; floor: number; top: number }) {
  const teleport = useAppStore((s) => s.teleport)
  const slab = useMemo(() => slabGeometry(geo), [geo])
  const rails = useMemo(() => railSegments(floor, top), [floor, top])
  return (
    <>
      {/* ring slab: floor of this level, ceiling of the one below */}
      <TeleportTarget onTeleport={teleport}>
        <RigidBody type="fixed" colliders="trimesh" key={`slab-${geo.n}`}>
          <mesh geometry={slab} material={mat(theme.floor)} />
        </RigidBody>
      </TeleportTarget>
      {/* atrium railing, open where the stairs meet this floor */}
      <RigidBody type="fixed" colliders="cuboid" key={`rails-${floor}-${top}`}>
        {rails.map((s, i) => (
          <mesh key={i} position={s.position} rotation-y={s.rotationY} material={mat(theme.walls)}>
            <boxGeometry args={[s.length, RAIL_H, 0.08]} />
          </mesh>
        ))}
      </RigidBody>
      {rails.map((s, i) => (
        <mesh
          key={i}
          position={[s.position[0], RAIL_H + 0.02, s.position[2]]}
          rotation-y={s.rotationY}
          material={mat(theme.ink)}
        >
          <boxGeometry args={[s.length, 0.05, 0.12]} />
        </mesh>
      ))}
    </>
  )
})

/**
 * Central N-sided hub, one per floor, sized to the busiest floor (min 3
 * faces). Faces with a room get a doorway; spare faces are solid wall. The
 * ground floor is solid; upper floors are rings around an open atrium where a
 * staircase climbs to each next floor. The top floor's ceiling is a ring with
 * an open skylight so the Sky shows through.
 */
export function Lobby() {
  const teleport = useAppStore((s) => s.teleport)
  const roomConfigs = useAppStore((s) => s.roomConfigs)

  const geo = useMemo<LobbyGeo>(() => {
    const n = lobbyFaceCount(roomConfigs)
    const step = (2 * Math.PI) / n
    const faceHalf = LOBBY_APOTHEM * Math.tan(Math.PI / n)
    // Rotate the floor polygon / ceiling ring so their vertices land exactly
    // on face boundaries (faces sit at 180° - i*360/N, boundaries ±180/N off).
    const boundary = Math.PI - Math.PI / n
    return {
      n,
      sideW: faceHalf - DOOR_WIDTH / 2 + 0.1,
      faceW: faceHalf * 2 + 0.2,
      floorTheta: mod(boundary, step), // CylinderGeometry: angle from +Z
      ringTheta: mod(boundary - Math.PI / 2, step), // RingGeometry: angle from +X
      angles: Array.from({ length: n }, (_, i) => Math.PI - i * step),
    }
  }, [roomConfigs])
  const top = topFloor(roomConfigs)
  const floors = Array.from({ length: top + 1 }, (_, f) => f)

  const ceilingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: theme.ceiling,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
    []
  )

  return (
    <group>
      {floors.map((floor) => (
        <group key={floor} position={[0, floor * FLOOR_H, 0]}>
          <LobbyWalls geo={geo} floor={floor} rooms={roomConfigs.filter((r) => r.floor === floor)} />
          {floor === 0 ? (
            // ground floor (N-gon): teleport target for the hand-tracking fallback
            <TeleportTarget onTeleport={teleport}>
              <mesh position={[0, -0.05, 0]} material={mat(theme.floor)}>
                <cylinderGeometry args={[FLOOR_R, FLOOR_R, 0.1, geo.n, 1, false, geo.floorTheta]} />
              </mesh>
            </TeleportTarget>
          ) : (
            <UpperFloor geo={geo} floor={floor} top={top} />
          )}
        </group>
      ))}

      {floors.slice(0, -1).map((floor) => (
        <Stairs key={floor} from={floor} />
      ))}

      {/* top ceiling ring with central skylight */}
      <mesh position={[0, top * FLOOR_H + WALL_H, 0]} rotation-x={-Math.PI / 2} material={ceilingMat}>
        <ringGeometry args={[ATRIUM_R, 9.6, geo.n, 1, geo.ringTheta]} />
      </mesh>

      {/* floating museum title over the top floor's atrium, seen from every level */}
      <Float speed={1.6} floatIntensity={0.35} rotationIntensity={0.15}>
        <Billboard position={[0, top * FLOOR_H + 3.1, 0]}>
          <Text
            font={fonts.title}
            fontSize={0.42}
            color={theme.ink}
            anchorX="center"
            anchorY="middle"
            textAlign="center"
          >
            THE GRAMMAR MUSEUM
          </Text>
          <Text
            font={fonts.body}
            fontSize={0.19}
            color={accentText(theme.accents.conditionals)}
            anchorX="center"
            anchorY="middle"
            position={[0, -0.42, 0]}
          >
            El Museo de la Gramática
          </Text>
        </Billboard>
      </Float>
    </group>
  )
}
