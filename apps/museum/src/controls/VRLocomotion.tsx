import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { XROrigin, useXR, useXRInputSourceState } from "@react-three/xr"
import { RigidBody, CapsuleCollider, type RapierRigidBody } from "@react-three/rapier"
import type { Group } from "three"
import { useMoveScratch, WALK_SPEED, RUN_SPEED } from "./usePlayerRig"
import { useAppStore } from "../store/useAppStore"
import { SPAWN_Z } from "../config/rooms.config"

const SNAP_ANGLE = Math.PI / 4 // 45°
const SNAP_DEADZONE = 0.7
const MOVE_DEADZONE = 0.12
const CAPSULE_HALF = 0.9 // capsule center height above the floor

/**
 * Smooth VR locomotion: the left thumbstick walks (head-relative, analog
 * speed, pressing the stick runs), the right thumbstick snap-turns 45°.
 * Movement drives a rapier capsule — the same collision as on desktop —
 * and the XROrigin is pinned to the capsule every frame.
 */
export function VRLocomotion() {
  const origin = useRef<Group>(null)
  const body = useRef<RapierRigidBody>(null)
  const session = useXR((s) => s.session)
  const leftController = useXRInputSourceState("controller", "left")
  const rightController = useXRInputSourceState("controller", "right")
  const camera = useThree((s) => s.camera)
  const scratch = useMoveScratch()
  const rotY = useRef(0)
  const prevSnapX = useRef(0)

  useFrame(() => {
    const o = origin.current
    const b = body.current
    if (!session || !o || !b) return

    // Teleport fallback (hand-tracking pointer): jump the capsule there.
    const app = useAppStore.getState()
    if (app.pendingTeleport) {
      const [px, py, pz] = app.pendingTeleport
      b.setTranslation({ x: px, y: py + CAPSULE_HALF + 0.05, z: pz }, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true)
      app.clearTeleport()
    }

    // 45° snap turn on right-stick flick
    const snapX = rightController?.gamepad?.["xr-standard-thumbstick"]?.xAxis ?? 0
    if (Math.abs(snapX) > SNAP_DEADZONE && Math.abs(prevSnapX.current) <= SNAP_DEADZONE) {
      rotY.current -= Math.sign(snapX) * SNAP_ANGLE
    }
    prevSnapX.current = snapX

    // left stick: analog walk relative to where the head is facing
    const stick = leftController?.gamepad?.["xr-standard-thumbstick"]
    let mx = stick?.xAxis ?? 0
    let my = -(stick?.yAxis ?? 0) // push forward = -y
    if (Math.hypot(mx, my) < MOVE_DEADZONE) {
      mx = 0
      my = 0
    }
    const running = stick?.state === "pressed"

    const { forward, right, velocity, up } = scratch
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    right.crossVectors(forward, up).normalize()
    velocity.set(0, 0, 0).addScaledVector(forward, my).addScaledVector(right, mx)
    if (velocity.lengthSq() > 1) velocity.normalize()
    velocity.multiplyScalar(running ? RUN_SPEED : WALK_SPEED)

    const lv = b.linvel()
    b.setLinvel({ x: velocity.x, y: lv.y, z: velocity.z }, true)

    // Pin the origin so the head rides the capsule: subtract the head's
    // in-room offset (camera is origin-local), rotated by the snap turn.
    // Recomputing per frame also makes snap turns pivot around the player.
    const t = b.translation()
    const cos = Math.cos(rotY.current)
    const sin = Math.sin(rotY.current)
    const hx = camera.position.x
    const hz = camera.position.z
    o.position.set(t.x - (cos * hx + sin * hz), t.y - CAPSULE_HALF, t.z - (-sin * hx + cos * hz))
    o.rotation.y = rotY.current
  })

  return (
    <>
      <XROrigin ref={origin} position={[0, 0, SPAWN_Z]} />
      {session && (
        <RigidBody
          ref={body}
          type="dynamic"
          colliders={false}
          lockRotations
          canSleep={false}
          position={[0, 1, SPAWN_Z]}
        >
          <CapsuleCollider args={[0.6, 0.3]} />
        </RigidBody>
      )}
    </>
  )
}
