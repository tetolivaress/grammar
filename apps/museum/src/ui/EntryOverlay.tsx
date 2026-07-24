import { useEffect, useState } from "react"
import { useAppStore } from "../store/useAppStore"
import { xrStore } from "../xrStore"
import { ControlsGuide } from "./ControlsGuide"

/**
 * DOM entry screen. Stays mounted (hidden via CSS) so the #explore-btn
 * element persists — PointerLockControls binds its lock handler to it once.
 */
export function EntryOverlay() {
  const mode = useAppStore((s) => s.mode)
  const hasTouch = useAppStore((s) => s.hasTouch)
  const setMode = useAppStore((s) => s.setMode)
  const setHasTouch = useAppStore((s) => s.setHasTouch)
  const start = useAppStore((s) => s.start)
  const started = useAppStore((s) => s.started)
  const overlayVisible = useAppStore((s) => s.overlayVisible)
  const roomCount = useAppStore((s) => s.roomConfigs.length)
  const [vrSupported, setVrSupported] = useState(false)
  const [presenting, setPresenting] = useState(false)

  useEffect(() => {
    let mounted = true
    async function detect() {
      let hasVR = false
      try {
        hasVR = !!navigator.xr && (await navigator.xr.isSessionSupported("immersive-vr"))
      } catch {
        hasVR = false
      }
      if (!mounted) return
      setVrSupported(hasVR)
      // maxTouchPoints is the reliable signal: iPads (desktop UA), Kindle
      // Fire in desktop mode, and touch laptops all hide `ontouchstart`.
      const touch = navigator.maxTouchPoints > 0 || "ontouchstart" in window
      setHasTouch(touch)
      setMode(touch && !hasVR ? "touch" : "desktop") // Quest Browser is touch too — VR wins
    }
    detect()
    return () => {
      mounted = false
    }
  }, [setMode, setHasTouch])

  useEffect(() => {
    return xrStore.subscribe((state) => {
      const active = state.session != null
      setPresenting(active)
      const app = useAppStore.getState()
      if (active && !app.started) app.start()
      if (!active && app.started) app.setOverlayVisible(true)
    })
  }, [])

  const hidden = !overlayVisible || presenting

  return (
    <div className={`entry-overlay${hidden ? " hidden" : ""}`}>
      <div className="entry-card">
        <h1>The Grammar Museum</h1>
        <p className="entry-subtitle">
          El Museo de la Gramática — {roomCount} rooms, {roomCount} grammar topics
        </p>
        <div className="entry-buttons">
          {/* PointerLockControls also binds a lock handler to this button;
              starting here as well keeps the app usable if lock is denied. */}
          <button id="explore-btn" onClick={() => start()}>
            {started ? "Resume" : "Explore"}
          </button>
          {vrSupported && (
            <button className="vr-btn" onClick={() => xrStore.enterVR()}>
              Enter VR
            </button>
          )}
        </div>
        <ControlsGuide
          hasTouch={hasTouch}
          showKeyboard={!hasTouch || mode === "desktop"}
          vrSupported={vrSupported}
        />
      </div>
    </div>
  )
}
