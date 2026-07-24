import { memo } from "react"
import { mat, theme } from "../config/theme"

const wood = "#b08968"
const leaf = "#6a994e"
const bulb = { emissive: "#ffe9b8", emissiveIntensity: 1.4 }

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]} material={mat(wood)}>
        <cylinderGeometry args={[0.22, 0.28, 0.36, 8]} />
      </mesh>
      <mesh position={[0, 0.75, 0]} material={mat(leaf)}>
        <coneGeometry args={[0.45, 0.8, 7]} />
      </mesh>
      <mesh position={[0, 1.3, 0]} material={mat(leaf)}>
        <coneGeometry args={[0.3, 0.6, 7]} />
      </mesh>
    </group>
  )
}

function Bench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0.44, 0]} material={mat(wood)}>
        <boxGeometry args={[1.6, 0.08, 0.45]} />
      </mesh>
      <mesh position={[-0.68, 0.2, 0]} material={mat(wood)}>
        <boxGeometry args={[0.08, 0.4, 0.4]} />
      </mesh>
      <mesh position={[0.68, 0.2, 0]} material={mat(wood)}>
        <boxGeometry args={[0.08, 0.4, 0.4]} />
      </mesh>
    </group>
  )
}

function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.03, 0]} material={mat(theme.ink)}>
        <cylinderGeometry args={[0.18, 0.22, 0.06, 8]} />
      </mesh>
      <mesh position={[0, 0.8, 0]} material={mat(theme.ink)}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 6]} />
      </mesh>
      <mesh position={[0, 1.62, 0]} material={mat("#fff3d6", bulb)}>
        <sphereGeometry args={[0.16, 12, 8]} />
      </mesh>
    </group>
  )
}

function Sofa({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const fabric = "#b26049"
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0.25, 0]} material={mat(fabric)}>
        <boxGeometry args={[2, 0.5, 0.9]} />
      </mesh>
      <mesh position={[0, 0.75, -0.35]} material={mat(fabric)}>
        <boxGeometry args={[2, 0.6, 0.2]} />
      </mesh>
      <mesh position={[-1.11, 0.5, 0]} material={mat(fabric)}>
        <boxGeometry args={[0.22, 0.6, 0.9]} />
      </mesh>
      <mesh position={[1.11, 0.5, 0]} material={mat(fabric)}>
        <boxGeometry args={[0.22, 0.6, 0.9]} />
      </mesh>
    </group>
  )
}

/** Low-poly decoration set per room; the Passive Voice room is a living room. */
export const RoomProps = memo(function RoomProps({
  roomId,
  kind,
}: {
  roomId: string
  kind: "room" | "corridor"
  accent: string
}) {
  if (kind === "corridor") {
    return (
      <>
        <Plant position={[-1.3, 0, 11]} />
        <Plant position={[1.3, 0, 11]} />
      </>
    )
  }

  if (roomId === "passive") {
    return (
      <>
        {/* living-room theme */}
        <mesh position={[3.4, 0.03, -3.4]} material={mat("#d9c8b4")}>
          <cylinderGeometry args={[1.5, 1.5, 0.03, 16]} />
        </mesh>
        <Sofa position={[3.4, 0, -1.6]} rotationY={Math.PI} />
        {/* wall-mounted TV panel on the south wall, away from the doorway */}
        <mesh position={[3.5, 1.6, -5.82]} material={mat(theme.ink)}>
          <boxGeometry args={[1.8, 1.0, 0.08]} />
        </mesh>
        <Plant position={[-5, 0, 5]} />
        <Plant position={[5, 0, 5]} />
        <FloorLamp position={[-5, 0, -4.8]} />
      </>
    )
  }

  return (
    <>
      <Plant position={[-5, 0, 5]} />
      <Plant position={[5, 0, 5]} />
      <Bench position={[0, 0, 2.6]} rotationY={Math.PI} />
      <FloorLamp position={[-5, 0, -4.8]} />
    </>
  )
})
