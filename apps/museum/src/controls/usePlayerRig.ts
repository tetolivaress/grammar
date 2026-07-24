import { useRef } from "react"
import * as THREE from "three"
import type { PerspectiveCamera } from "three"

export const WALK_SPEED = 3.5
export const RUN_SPEED = 6

/**
 * Shared, input-agnostic player input state. Desktop keyboard and the touch
 * joystick both write here; the physics rig consumes it every frame.
 */
export const rigInput = {
  move: { x: 0, y: 0 }, // x = strafe right, y = forward, each in [-1, 1]
  run: false,
  // Accumulated look deltas (radians). Touch drag writes these; desktop uses
  // PointerLockControls instead and leaves them at 0.
  lookDX: 0,
  lookDY: 0,
}

export function resetRigInput() {
  rigInput.move.x = 0
  rigInput.move.y = 0
  rigInput.run = false
  rigInput.lookDX = 0
  rigInput.lookDY = 0
}

const MAX_PITCH = (85 * Math.PI) / 180

/** Apply a yaw/pitch delta to the camera (touch look). */
export function applyLook(camera: PerspectiveCamera, dYaw: number, dPitch: number) {
  camera.rotation.order = "YXZ"
  camera.rotation.y -= dYaw
  camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - dPitch, -MAX_PITCH, MAX_PITCH)
}

/** Scratch vectors reused across frames (no per-frame allocation). */
export function useMoveScratch() {
  return useRef({
    forward: new THREE.Vector3(),
    right: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0),
  }).current
}
