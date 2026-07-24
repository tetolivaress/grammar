import { useEffect, useRef } from "react"
import nipplejs from "nipplejs"
import { rigInput } from "./usePlayerRig"
import { theme } from "../config/theme"

const LOOK_SENSITIVITY = 0.004

/**
 * DOM touch layer: left half spawns a dynamic joystick (move), right half is
 * a drag-to-look surface. Touches are tracked by identifier so both thumbs
 * work simultaneously. Rendered outside the Canvas.
 */
export function TouchControls() {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const leftEl = leftRef.current
    if (!leftEl) return
    const manager = nipplejs.create({
      zone: leftEl,
      mode: "dynamic",
      size: 120,
      color: theme.accents.conditionals,
      fadeTime: 150,
    })
    manager.on("move", (evt) => {
      const data = evt.data
      if (!data?.vector) return
      rigInput.move.x = Math.max(-1, Math.min(1, data.vector.x))
      rigInput.move.y = Math.max(-1, Math.min(1, data.vector.y))
      rigInput.run = (data.force ?? 0) > 0.85
    })
    manager.on("end", () => {
      rigInput.move.x = 0
      rigInput.move.y = 0
      rigInput.run = false
    })
    return () => {
      manager.destroy()
      rigInput.move.x = 0
      rigInput.move.y = 0
      rigInput.run = false
    }
  }, [])

  useEffect(() => {
    const el = rightRef.current
    if (!el) return
    // Pointer Events instead of raw touch events: same path nipplejs uses,
    // and it covers touch, pen, and touch-laptop configurations uniformly.
    // Each finger has its own pointerId, so move + look work simultaneously.
    let lookId: number | null = null
    let lastX = 0
    let lastY = 0

    const onDown = (e: PointerEvent) => {
      if (lookId !== null) return
      lookId = e.pointerId
      lastX = e.clientX
      lastY = e.clientY
      el.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== lookId) return
      rigInput.lookDX += (e.clientX - lastX) * LOOK_SENSITIVITY
      rigInput.lookDY += (e.clientY - lastY) * LOOK_SENSITIVITY
      lastX = e.clientX
      lastY = e.clientY
      e.preventDefault()
    }
    const onEnd = (e: PointerEvent) => {
      if (e.pointerId === lookId) lookId = null
    }

    el.addEventListener("pointerdown", onDown)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerup", onEnd)
    el.addEventListener("pointercancel", onEnd)
    return () => {
      el.removeEventListener("pointerdown", onDown)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerup", onEnd)
      el.removeEventListener("pointercancel", onEnd)
    }
  }, [])

  return (
    <div className="touch-controls">
      <div ref={leftRef} className="touch-zone touch-zone-left" />
      <div ref={rightRef} className="touch-zone touch-zone-right" />
    </div>
  )
}
