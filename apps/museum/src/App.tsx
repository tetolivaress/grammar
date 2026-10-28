import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { KeyboardControls, Sky } from "@react-three/drei"
import { XR } from "@react-three/xr"
import { Physics, CuboidCollider } from "@react-three/rapier"
import { xrStore } from "./xrStore"
import { useAppStore } from "./store/useAppStore"
import { useRoomContent } from "./hooks/useRoomContent"
import { useIsPresenting } from "./hooks/useIsPresenting"
import { Museum } from "./world/Museum"
import { Lighting } from "./world/Lighting"
import { PlayerRig } from "./controls/PlayerRig"
import { DesktopControls, keyboardMap } from "./controls/DesktopControls"
import { TouchControls } from "./controls/TouchControls"
import { VRLocomotion } from "./controls/VRLocomotion"
import { EntryOverlay } from "./ui/EntryOverlay"
import { Crosshair } from "./ui/Crosshair"
import { HudHints } from "./ui/HudHints"
import { SPAWN_Z } from "./config/rooms.config"

/** Desktop/touch physics rig — swapped out for teleport locomotion in XR. */
function ScreenControls() {
  const presenting = useIsPresenting()
  const mode = useAppStore((s) => s.mode)
  if (presenting || !mode) return null
  // Keyboard + pointer lock stay available even on touch-primary devices —
  // touch laptops and tablets with keyboards use both input paths at once.
  return (
    <>
      <PlayerRig />
      <DesktopControls />
    </>
  )
}

export default function App() {
  const hasTouch = useAppStore((s) => s.hasTouch)
  const started = useAppStore((s) => s.started)

  // Load the CMS content; the bundled curriculum stays as offline fallback.
  useRoomContent()

  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        camera={{ position: [0, 1.6, SPAWN_Z], fov: 70, near: 0.1, far: 150 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <XR store={xrStore}>
          <Suspense fallback={null}>
            <fog attach="fog" args={["#f5f1e8", 25, 60]} />
            <Sky sunPosition={[5, 10, 3]} turbidity={6} />
            <Lighting />
            <Physics>
              {/* one global ground collider under every floor */}
              <CuboidCollider args={[60, 0.1, 60]} position={[0, -0.1, 0]} />
              <Museum />
              <ScreenControls />
              <VRLocomotion />
            </Physics>
          </Suspense>
        </XR>
      </Canvas>
      <EntryOverlay />
      <Crosshair />
      {started && <HudHints />}
      {hasTouch && started && <TouchControls />}
    </KeyboardControls>
  )
}
