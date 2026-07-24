import { useEffect, useState } from "react"
import { useAppStore } from "../store/useAppStore"
import { rigInput } from "../controls/usePlayerRig"

/**
 * First-steps reminder shown at the bottom of the screen after entering.
 * Disappears once the visitor has actually walked for a couple of seconds
 * (or after 30 s), so it only bothers people who need it.
 */
export function HudHints() {
  const overlayVisible = useAppStore((s) => s.overlayVisible)
  const hasTouch = useAppStore((s) => s.hasTouch)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let walked = 0
    let elapsed = 0
    const iv = setInterval(() => {
      elapsed += 0.25
      if (Math.abs(rigInput.move.x) + Math.abs(rigInput.move.y) > 0.3) walked += 0.25
      if (walked > 2 || elapsed > 30) {
        setDismissed(true)
        clearInterval(iv)
      }
    }, 250)
    return () => clearInterval(iv)
  }, [])

  if (dismissed || overlayVisible) return null

  return (
    <div className="hud-hints">
      {hasTouch ? (
        <>
          <p>
            Left thumb: <strong>walk</strong> · Right thumb: <strong>look</strong>
          </p>
          <p className="es">Pulgar izquierdo: camina · Pulgar derecho: mira</p>
        </>
      ) : (
        <>
          <p>
            Hold <span className="keycap keycap-small">W</span> or{" "}
            <span className="keycap keycap-small">↑</span> to <strong>walk</strong> · Move the
            mouse to <strong>look</strong>
          </p>
          <p className="es">Mantén pulsada W o la flecha ↑ para caminar · Mueve el ratón para mirar</p>
        </>
      )}
    </div>
  )
}
