import { useMemo } from "react"
import * as THREE from "three"
import { RigidBody } from "@react-three/rapier"
import { TeleportTarget } from "@react-three/xr"
import { Billboard, Float, Text } from "@react-three/drei"
import {
  lobbyFaces,
  LOBBY_APOTHEM,
  DOOR_WIDTH,
  DOOR_HEIGHT,
  WALL_H,
} from "../config/rooms.config"
import { theme, fonts, mat, accentText } from "../config/theme"
import { useAppStore } from "../store/useAppStore"

const LINTEL_H = WALL_H - DOOR_HEIGHT
const mod = (a: number, m: number) => ((a % m) + m) % m

/**
 * Central N-sided hub, sized to however many rooms the CMS provides (min 3
 * faces). Faces with a room get a doorway; spare faces are solid wall. The
 * ceiling is a ring with an open skylight so the Sky shows through.
 */
export function Lobby() {
  const teleport = useAppStore((s) => s.teleport)
  const roomConfigs = useAppStore((s) => s.roomConfigs)

  const geo = useMemo(() => {
    const n = lobbyFaces(roomConfigs.length)
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
  }, [roomConfigs.length])

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
      {/* perimeter walls: doorway per room face, solid wall on spare faces */}
      <RigidBody type="fixed" colliders="cuboid" key={`walls-${geo.n}`}>
        {geo.angles.map((angle, i) => {
          const room = roomConfigs[i]
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
                  <mesh
                    position={[0, DOOR_HEIGHT + LINTEL_H / 2, LOBBY_APOTHEM + 0.1]}
                    material={mat(theme.walls)}
                  >
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

      {/* floor (N-gon): teleport target for the hand-tracking fallback */}
      <TeleportTarget onTeleport={teleport}>
        <mesh position={[0, -0.05, 0]} material={mat(theme.floor)}>
          <cylinderGeometry args={[9.2, 9.2, 0.1, geo.n, 1, false, geo.floorTheta]} />
        </mesh>
      </TeleportTarget>

      {/* ceiling ring with central skylight */}
      <mesh position={[0, WALL_H, 0]} rotation-x={-Math.PI / 2} material={ceilingMat}>
        <ringGeometry args={[3.5, 9.6, geo.n, 1, geo.ringTheta]} />
      </mesh>

      {/* floating museum title over the lobby center */}
      <Float speed={1.6} floatIntensity={0.35} rotationIntensity={0.15}>
        <Billboard position={[0, 3.1, 0]}>
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
