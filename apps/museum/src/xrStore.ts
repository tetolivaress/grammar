import { createXRStore } from "@react-three/xr"

/**
 * Shared XR store. Controllers use smooth thumbstick locomotion (see
 * VRLocomotion); hand tracking gets a teleport pointer as the fallback for
 * when controllers are unavailable (e.g. dead batteries).
 */
export const xrStore = createXRStore({
  hand: { teleportPointer: true },
})
