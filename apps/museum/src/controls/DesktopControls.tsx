import { useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { PointerLockControls, useKeyboardControls } from "@react-three/drei"
import { useAppStore } from "../store/useAppStore"
import { rigInput } from "./usePlayerRig"

export const keyboardMap = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "back", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "run", keys: ["ShiftLeft", "ShiftRight"] },
]

/**
 * Pointer-lock mouse look + WASD. Clicking the #explore-btn element in the
 * entry overlay acquires the lock; Esc releases it and brings the overlay back.
 */
export function DesktopControls() {
  const start = useAppStore((s) => s.start)
  const setOverlayVisible = useAppStore((s) => s.setOverlayVisible)
  const [, get] = useKeyboardControls()

  useFrame(() => {
    const { forward, back, left, right, run } = get() as Record<string, boolean>
    rigInput.move.x = (right ? 1 : 0) - (left ? 1 : 0)
    rigInput.move.y = (forward ? 1 : 0) - (back ? 1 : 0)
    rigInput.run = !!run
  })

  useEffect(() => {
    return () => {
      rigInput.move.x = 0
      rigInput.move.y = 0
      rigInput.run = false
    }
  }, [])

  return (
    <PointerLockControls
      selector="#explore-btn"
      onLock={() => start()}
      onUnlock={() => setOverlayVisible(true)}
    />
  )
}
