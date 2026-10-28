import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { RigidBody, CapsuleCollider, type RapierRigidBody } from "@react-three/rapier"
import type { PerspectiveCamera } from "three"
import { useAppStore } from "../store/useAppStore"
import { SPAWN_Z } from "../config/rooms.config"
import { rigInput, applyLook, useMoveScratch, WALK_SPEED, RUN_SPEED } from "./usePlayerRig"

const CAPSULE_RADIUS = 0.3
const CAPSULE_HALF_HEIGHT = 0.6
// Capsule center rests at y ≈ 0.9; camera at eye height 1.6.
const EYE_OFFSET = 0.7

/**
 * Physics body for desktop + touch. Reads `rigInput` each frame, moves the
 * capsule with setLinvel, and parents the camera at eye height.
 */
export function PlayerRig() {
  const body = useRef<RapierRigidBody>(null)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const scratch = useMoveScratch()

  useFrame(() => {
    const b = body.current
    if (!b) return
    const paused = useAppStore.getState().overlayVisible

    // Touch look (desktop look is handled by PointerLockControls)
    if (!paused && (rigInput.lookDX !== 0 || rigInput.lookDY !== 0)) {
      applyLook(camera, rigInput.lookDX, rigInput.lookDY)
    }
    rigInput.lookDX = 0
    rigInput.lookDY = 0

    const { forward, right, velocity, up } = scratch
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    right.crossVectors(forward, up).normalize()

    const mx = paused ? 0 : rigInput.move.x
    const my = paused ? 0 : rigInput.move.y
    velocity.set(0, 0, 0).addScaledVector(forward, my).addScaledVector(right, mx)
    if (velocity.lengthSq() > 1) velocity.normalize()
    velocity.multiplyScalar(rigInput.run ? RUN_SPEED : WALK_SPEED)

    const lv = b.linvel()
    b.setLinvel({ x: velocity.x, y: lv.y, z: velocity.z }, true)

    const t = b.translation()
    camera.position.set(t.x, t.y + EYE_OFFSET, t.z)
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__playerPos = { x: t.x, y: t.y, z: t.z }
      // lets browser tests steer the player (walk the stairs, enter rooms)
      ;(window as unknown as Record<string, unknown>).__rig = { input: rigInput, camera }
    }
  })

  return (
    <RigidBody
      ref={body}
      type="dynamic"
      colliders={false}
      lockRotations
      position={[0, 1, SPAWN_Z]}
      canSleep={false}
    >
      <CapsuleCollider args={[CAPSULE_HALF_HEIGHT, CAPSULE_RADIUS]} />
    </RigidBody>
  )
}
