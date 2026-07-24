import { create } from "zustand"
import type { Vector3 } from "three"
import type { RoomContent } from "@grammar-museum/shared"
import { buildRoomConfigs, defaultRoomConfigs, type RoomConfig } from "../config/rooms.config"

export type ControlMode = "desktop" | "touch" | null

interface AppState {
  /** World layout: bundled curriculum until CMS content arrives. */
  roomConfigs: RoomConfig[]
  setRoomContent: (content: RoomContent[]) => void
  mode: ControlMode
  // Touch is a capability, not an exclusive mode: touch laptops, iPads with
  // keyboards, etc. get touch zones AND keyboard/pointer controls together.
  hasTouch: boolean
  started: boolean
  overlayVisible: boolean
  // Teleport fallback in VR (hand tracking, e.g. dead controller batteries).
  // The VR rig consumes this and moves the physics capsule there.
  pendingTeleport: [number, number, number] | null
  setMode: (mode: ControlMode) => void
  setHasTouch: (v: boolean) => void
  start: () => void
  setOverlayVisible: (v: boolean) => void
  teleport: (point: Vector3) => void
  clearTeleport: () => void
}

export const useAppStore = create<AppState>()((set) => ({
  roomConfigs: defaultRoomConfigs,
  setRoomContent: (content) => {
    if (content.length > 0) set({ roomConfigs: buildRoomConfigs(content) })
  },
  mode: null,
  hasTouch: false,
  started: false,
  overlayVisible: true,
  pendingTeleport: null,
  setMode: (mode) => set({ mode }),
  setHasTouch: (v) => set({ hasTouch: v }),
  start: () => set({ started: true, overlayVisible: false }),
  setOverlayVisible: (v) => set({ overlayVisible: v }),
  teleport: (p) => set({ pendingTeleport: [p.x, p.y, p.z] }),
  clearTeleport: () => set({ pendingTeleport: null }),
}))

if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__appStore = useAppStore
}
