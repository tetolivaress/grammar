import { CuboidCollider, RigidBody } from "@react-three/rapier"
import { TeleportTarget } from "@react-three/xr"
import { Text } from "@react-three/drei"
import type { RoomConfig } from "../config/rooms.config"
import { LOBBY_APOTHEM, SLAB } from "../config/rooms.config"
import { theme, fonts, mat, accentText } from "../config/theme"
import { useAppStore } from "../store/useAppStore"

const SIGN_R = LOBBY_APOTHEM - 0.12

/**
 * Connection between the lobby and one room: a short tunnel (walls + low
 * ceiling), an accent-colored door frame on the lobby side, and the overhead
 * sign with the room name + Spanish subtitle. Local +Z points away from the
 * lobby center.
 */
export function Doorway({ config }: { config: RoomConfig }) {
  const teleport = useAppStore((s) => s.teleport)
  const accent = theme.accents[config.accent] ?? theme.ink

  // Tunnel span derived from where this room actually sits: from just inside
  // the lobby wall to just inside the room's south wall (0.1 m overlap each).
  const dist = Math.hypot(config.position[0], config.position[2])
  const startR = LOBBY_APOTHEM - 0.1
  const endR = dist - config.size[2] / 2 - 0.1
  const tunnelLen = endR - startR
  const tunnelMid = (startR + endR) / 2

  return (
    <group position-y={config.position[1]} rotation-y={config.rotationY}>
      <RigidBody type="fixed" colliders="cuboid">
        {/* tunnel side walls + ceiling */}
        <mesh position={[-1.1, 1.3, tunnelMid]} material={mat(theme.walls)}>
          <boxGeometry args={[0.2, 2.6, tunnelLen]} />
        </mesh>
        <mesh position={[1.1, 1.3, tunnelMid]} material={mat(theme.walls)}>
          <boxGeometry args={[0.2, 2.6, tunnelLen]} />
        </mesh>
        <mesh position={[0, 2.7, tunnelMid]} material={mat(theme.walls)}>
          <boxGeometry args={[2.4, 0.2, tunnelLen]} />
        </mesh>
      </RigidBody>

      {/* upper floors have no ground below: the tunnel needs its own floor */}
      {config.floor > 0 && (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[1.2, SLAB / 2, tunnelLen / 2]} position={[0, -SLAB / 2, tunnelMid]} />
        </RigidBody>
      )}

      {/* tunnel floor strip (teleport hop between lobby and room) */}
      <TeleportTarget onTeleport={teleport}>
        <mesh position={[0, -0.0475, tunnelMid]} material={mat(theme.floor)}>
          <boxGeometry args={[2, 0.1, tunnelLen]} />
        </mesh>
      </TeleportTarget>

      {/* accent door frame, lobby side */}
      <mesh position={[-1.12, 1.36, SIGN_R]} material={mat(accent)}>
        <boxGeometry args={[0.24, 2.72, 0.26]} />
      </mesh>
      <mesh position={[1.12, 1.36, SIGN_R]} material={mat(accent)}>
        <boxGeometry args={[0.24, 2.72, 0.26]} />
      </mesh>
      <mesh position={[0, 2.72, SIGN_R]} material={mat(accent)}>
        <boxGeometry args={[2.48, 0.24, 0.26]} />
      </mesh>

      {/* overhead sign facing the lobby */}
      <mesh
        position={[0, 3.42, SIGN_R + 0.06]}
        material={mat(theme.panelBg, { emissive: theme.panelBg, emissiveIntensity: 0.35 })}
      >
        <boxGeometry args={[3.6, 1.0, 0.08]} />
      </mesh>
      <mesh position={[0, 2.98, SIGN_R + 0.05]} material={mat(accent)}>
        <boxGeometry args={[3.6, 0.12, 0.09]} />
      </mesh>
      <group position={[0, 3.42, SIGN_R]} rotation-y={Math.PI}>
        <Text
          font={fonts.title}
          fontSize={0.24}
          color={theme.ink}
          anchorX="center"
          anchorY="middle"
          maxWidth={3.4}
          textAlign="center"
          position={[0, 0.14, 0.11]}
        >
          {config.name}
        </Text>
        <Text
          font={fonts.body}
          fontSize={0.14}
          color={accentText(accent)}
          anchorX="center"
          anchorY="middle"
          maxWidth={3.4}
          textAlign="center"
          position={[0, -0.22, 0.11]}
        >
          {config.nameEs}
        </Text>
      </group>
    </group>
  )
}
