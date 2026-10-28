import { memo, useMemo } from "react"
import * as THREE from "three"
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js"
import { RigidBody } from "@react-three/rapier"
import { FLOOR_H, SLAB } from "../config/rooms.config"
import {
  PAD_X,
  RAIL_H,
  RAMP_LEN,
  RAMP_T,
  RISE,
  RUN,
  SLOPE,
  STEPS,
  stairTurn,
  W,
  X0,
  X1,
  X2,
  Z_IN,
  Z_OUT,
} from "../config/stairs.config"
import { mat, theme } from "../config/theme"

// ---------------------------------------------------------------------------
// Switchback staircase in the lobby atrium, joining floor `from` to the next.
// Local frame (before the per-floor turn): flight 1 climbs +x along z < 0 to a
// half landing, flight 2 climbs back -x along z > 0 and arrives at x = X0, so
// both ends sit on one edge of the atrium. The ground floor's staircase is
// turned so its foot faces the spawn point (+z), and each floor's staircase
// is turned 180° from the one below, which keeps ≥ 2.2 m of headroom over the
// lower flights and puts each floor's arrival and departure on opposite sides.
//
// The player is a dynamic capsule pushed sideways (PlayerRig), which cannot
// climb step edges, so the steps are visual only: each flight's collider is a
// smooth ramp raised half a riser, which puts the feet on the treads' middles.
// ---------------------------------------------------------------------------

/** Convex solid that is both a mesh and a hull collider. */
function Hull({ points, color }: { points: [number, number, number][]; color: string }) {
  const geometry = useMemo(() => new ConvexGeometry(points.map((p) => new THREE.Vector3(...p))), [points])
  return (
    <RigidBody type="fixed" colliders="hull">
      <mesh geometry={geometry} material={mat(color)} />
    </RigidBody>
  )
}

const lane = (sign: 1 | -1) => (sign * (Z_IN + Z_OUT)) / 2

// fill under ground-floor flight 1, kept just under its ramp
const WEDGE: [number, number, number][] = [
  [X0 + 0.3, 0, -Z_IN],
  [X0 + 0.3, 0, -Z_OUT],
  [X1, 0, -Z_IN],
  [X1, 0, -Z_OUT],
  [X1, RISE - 0.3, -Z_IN],
  [X1, RISE - 0.3, -Z_OUT],
]

function Flight({ climbsEast, base }: { climbsEast: boolean; base: number }) {
  // flight 1 (climbsEast) runs along z < 0 from X0 up to X1; flight 2 along z > 0 from X1 up to X0
  const sign = climbsEast ? -1 : 1
  const z = lane(sign)
  const tilt = climbsEast ? SLOPE : -SLOPE
  const midX = (X0 + X1) / 2
  const midY = base + RISE / 2
  // ramp surface raised half a riser; the slab hangs below it along its normal
  const lift = RISE / STEPS / 2
  const nx = climbsEast ? -Math.sin(SLOPE) : Math.sin(SLOPE)
  const ny = Math.cos(SLOPE)
  const rampCenter: [number, number, number] = [midX - (nx * RAMP_T) / 2, midY + lift - (ny * RAMP_T) / 2, z]
  const railZ = sign * (Z_OUT + 0.04)

  return (
    <>
      <RigidBody type="fixed" colliders="cuboid">
        {/* smooth ramp the capsule walks on */}
        <mesh position={rampCenter} rotation-z={tilt} material={mat(theme.walls)}>
          <boxGeometry args={[RAMP_LEN, RAMP_T, W]} />
        </mesh>
        {/* outer balustrade */}
        <mesh position={[midX, midY + RAIL_H / 2, railZ]} rotation-z={tilt} material={mat(theme.walls)}>
          <boxGeometry args={[RAMP_LEN, RAIL_H, 0.08]} />
        </mesh>
      </RigidBody>
      {/* handrail cap */}
      <mesh position={[midX, midY + RAIL_H + 0.02, railZ]} rotation-z={tilt} material={mat(theme.ink)}>
        <boxGeometry args={[RAMP_LEN, 0.05, 0.12]} />
      </mesh>
      {/* treads: visual only (see the note at the top) */}
      {Array.from({ length: STEPS }, (_, k) => {
        const h = RISE / STEPS
        const d = RUN / STEPS
        const x = climbsEast ? X0 + d * (k + 0.5) : X1 - d * (k + 0.5)
        return (
          <mesh key={k} position={[x, base + h * (k + 0.5), z]} material={mat(theme.floor)}>
            <boxGeometry args={[d + 0.002, h, W]} />
          </mesh>
        )
      })}
    </>
  )
}

/**
 * The staircase leaving floor `from`. On the ground floor the space under the
 * flights is filled in, so nobody walks under the landing; on upper floors it
 * stays open, because the staircase below runs there.
 */
export const Stairs = memo(function Stairs({ from }: { from: number }) {
  const y = from * FLOOR_H
  const landingTop = RISE
  return (
    <group position={[0, y, 0]} rotation-y={stairTurn(from)}>
      <Flight climbsEast base={0} />
      <Flight climbsEast={false} base={RISE} />

      <RigidBody type="fixed" colliders="cuboid">
        {/* half landing */}
        <mesh position={[(X1 + X2) / 2 - 0.02, landingTop - SLAB / 2, 0]} material={mat(theme.floor)}>
          <boxGeometry args={[X2 - X1 + 0.04, SLAB, Z_OUT * 2]} />
        </mesh>
        {/* landing balustrades: far end and both sides */}
        <mesh position={[X2 + 0.04, landingTop + RAIL_H / 2, 0]} material={mat(theme.walls)}>
          <boxGeometry args={[0.08, RAIL_H, Z_OUT * 2 + 0.16]} />
        </mesh>
        {([-1, 1] as const).map((s) => (
          <mesh key={s} position={[(X1 + X2) / 2, landingTop + RAIL_H / 2, s * (Z_OUT + 0.04)]} material={mat(theme.walls)}>
            <boxGeometry args={[X2 - X1, RAIL_H, 0.08]} />
          </mesh>
        ))}
        {/* spine wall between the flights, floor to floor */}
        <mesh position={[(X0 + X1) / 2, FLOOR_H / 2, 0]} material={mat(theme.walls)}>
          <boxGeometry args={[RUN, FLOOR_H, Z_IN * 2]} />
        </mesh>
        {/* pads bridging each end to the atrium's edge */}
        {from > 0 && (
          <mesh position={[(PAD_X + X0) / 2, -SLAB / 2, lane(-1)]} material={mat(theme.floor)}>
            <boxGeometry args={[X0 - PAD_X, SLAB, W]} />
          </mesh>
        )}
        <mesh position={[(PAD_X + X0) / 2, FLOOR_H - SLAB / 2, lane(1)]} material={mat(theme.floor)}>
          <boxGeometry args={[X0 - PAD_X, SLAB, W]} />
        </mesh>
      </RigidBody>
      <mesh position={[X2 + 0.04, landingTop + RAIL_H + 0.02, 0]} material={mat(theme.ink)}>
        <boxGeometry args={[0.12, 0.05, Z_OUT * 2 + 0.16]} />
      </mesh>

      {from === 0 && (
        <>
          {/* solid under the landing and under flight 2's lane */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[(X1 + X2) / 2, landingTop / 2 - SLAB / 2, 0]} material={mat(theme.walls)}>
              <boxGeometry args={[X2 - X1, landingTop - SLAB, Z_OUT * 2]} />
            </mesh>
            <mesh position={[(X0 + X1) / 2, landingTop / 2 - SLAB / 2, lane(1)]} material={mat(theme.walls)}>
              <boxGeometry args={[RUN, landingTop - SLAB, W]} />
            </mesh>
          </RigidBody>
          {/* wedge under flight 1 */}
          <Hull color={theme.walls} points={WEDGE} />
        </>
      )}
    </group>
  )
})
