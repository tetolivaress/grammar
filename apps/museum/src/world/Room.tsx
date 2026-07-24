import { RigidBody } from "@react-three/rapier"
import { TeleportTarget } from "@react-three/xr"
import { Text } from "@react-three/drei"
import type { RoomConfig, Wall } from "../config/rooms.config"
import { DOOR_WIDTH, DOOR_HEIGHT } from "../config/rooms.config"
import { theme, fonts, mat } from "../config/theme"
import { WallPanel } from "./WallPanel"
import { RoomProps } from "./Props"
import { useAppStore } from "../store/useAppStore"

const T = 0.2 // wall thickness
const PANEL_Y = 1.9
const PANEL_GAP = 0.09 // panel center offset from the wall's inner face

/**
 * Procedural room generator. Local convention: -Z ("south") faces the lobby
 * and carries the doorway; panels hang on any wall per config.
 */
export function Room({ config }: { config: RoomConfig }) {
  const teleport = useAppStore((s) => s.teleport)
  const [w, h, d] = config.size
  const accent = theme.accents[config.accent] ?? theme.ink
  const hw = w / 2
  const hd = d / 2
  const lintelH = h - DOOR_HEIGHT
  const sideW = (w - DOOR_WIDTH) / 2 + T

  const roomSlots = [-3.5, 0, 3.5]
  const corridorSlot = (slot: number) => -hd + 2 + slot * 4

  function panelTransform(wall: Wall, slot: number): { position: [number, number, number]; rotationY: number } {
    const off = PANEL_GAP
    if (config.kind === "corridor" && (wall === "east" || wall === "west")) {
      const z = corridorSlot(slot)
      return wall === "east"
        ? { position: [hw - off, PANEL_Y, z], rotationY: -Math.PI / 2 }
        : { position: [-hw + off, PANEL_Y, z], rotationY: Math.PI / 2 }
    }
    const x = roomSlots[slot] ?? 0
    switch (wall) {
      case "north":
        // mirrored so slot 0 appears on the viewer's left when facing the wall
        return { position: [-x, PANEL_Y, hd - off], rotationY: Math.PI }
      case "south":
        return { position: [x, PANEL_Y, -hd + off], rotationY: 0 }
      case "east":
        return { position: [hw - off, PANEL_Y, x], rotationY: -Math.PI / 2 }
      case "west":
        // mirrored for the same reason as north
        return { position: [-hw + off, PANEL_Y, -x], rotationY: Math.PI / 2 }
    }
  }

  return (
    <group position={config.position} rotation-y={config.rotationY}>
      {/* static geometry with cuboid colliders */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* north wall (far end) */}
        <mesh position={[0, h / 2, hd + T / 2]} material={mat(theme.walls)}>
          <boxGeometry args={[w + T * 2, h, T]} />
        </mesh>
        {/* east / west walls */}
        <mesh position={[hw + T / 2, h / 2, 0]} material={mat(theme.walls)}>
          <boxGeometry args={[T, h, d]} />
        </mesh>
        <mesh position={[-hw - T / 2, h / 2, 0]} material={mat(theme.walls)}>
          <boxGeometry args={[T, h, d]} />
        </mesh>
        {/* south wall (lobby side): left + right + lintel around the doorway */}
        <mesh position={[-(DOOR_WIDTH / 2 + sideW / 2), h / 2, -hd - T / 2]} material={mat(theme.walls)}>
          <boxGeometry args={[sideW, h, T]} />
        </mesh>
        <mesh position={[DOOR_WIDTH / 2 + sideW / 2, h / 2, -hd - T / 2]} material={mat(theme.walls)}>
          <boxGeometry args={[sideW, h, T]} />
        </mesh>
        <mesh position={[0, DOOR_HEIGHT + lintelH / 2, -hd - T / 2]} material={mat(theme.walls)}>
          <boxGeometry args={[DOOR_WIDTH, lintelH, T]} />
        </mesh>
        {/* ceiling */}
        <mesh position={[0, h + T / 2, 0]} material={mat(theme.ceiling)}>
          <boxGeometry args={[w + T * 2, T, d + T * 2]} />
        </mesh>
      </RigidBody>

      {/* floor: teleport target for the hand-tracking fallback in VR */}
      <TeleportTarget onTeleport={teleport}>
        <mesh position={[0, -0.045, 0]} material={mat(theme.floor)}>
          <boxGeometry args={[w, 0.1, d]} />
        </mesh>
      </TeleportTarget>

      {/* accent floor trim along the wall bases */}
      <mesh position={[0, 0.07, hd - 0.03]} material={mat(accent)}>
        <boxGeometry args={[w - 0.1, 0.12, 0.05]} />
      </mesh>
      <mesh position={[hw - 0.03, 0.07, 0]} material={mat(accent)}>
        <boxGeometry args={[0.05, 0.12, d - 0.1]} />
      </mesh>
      <mesh position={[-hw + 0.03, 0.07, 0]} material={mat(accent)}>
        <boxGeometry args={[0.05, 0.12, d - 0.1]} />
      </mesh>
      <mesh position={[-(DOOR_WIDTH / 2 + (hw - DOOR_WIDTH / 2) / 2), 0.07, -hd + 0.03]} material={mat(accent)}>
        <boxGeometry args={[hw - DOOR_WIDTH / 2 - 0.1, 0.12, 0.05]} />
      </mesh>
      <mesh position={[DOOR_WIDTH / 2 + (hw - DOOR_WIDTH / 2) / 2, 0.07, -hd + 0.03]} material={mat(accent)}>
        <boxGeometry args={[hw - DOOR_WIDTH / 2 - 0.1, 0.12, 0.05]} />
      </mesh>

      {/* timeline corridor extras: floor stripe + PAST / PRESENT / FUTURE */}
      {config.kind === "corridor" && (
        <>
          <mesh position={[0, 0.015, 0]} material={mat(accent)}>
            <boxGeometry args={[0.9, 0.02, d - 0.4]} />
          </mesh>
          {(
            [
              ["PAST", -8],
              ["PRESENT", 0],
              ["FUTURE", 8],
            ] as const
          ).map(([label, z]) => (
            <group key={label} position={[0, 0.05, z]} rotation-y={Math.PI}>
              <Text
                font={fonts.title}
                fontSize={0.55}
                color={theme.ink}
                anchorX="center"
                anchorY="middle"
                rotation-x={-Math.PI / 2}
              >
                {label}
              </Text>
            </group>
          ))}
        </>
      )}

      {config.panels.map((panel, i) => {
        const t = panelTransform(panel.wall, panel.slot)
        return (
          <WallPanel
            key={i}
            panel={panel}
            accent={accent}
            position={t.position}
            rotationY={t.rotationY}
          />
        )
      })}

      <RoomProps roomId={config.slug} kind={config.kind} accent={accent} />
    </group>
  )
}
