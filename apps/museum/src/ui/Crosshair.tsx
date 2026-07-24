import { useAppStore } from "../store/useAppStore"

/** Small center dot, desktop pointer-lock mode only. */
export function Crosshair() {
  const started = useAppStore((s) => s.started)
  const mode = useAppStore((s) => s.mode)
  const overlayVisible = useAppStore((s) => s.overlayVisible)
  const show = started && mode === "desktop" && !overlayVisible
  return <div className={`crosshair${show ? "" : " hidden"}`} />
}
