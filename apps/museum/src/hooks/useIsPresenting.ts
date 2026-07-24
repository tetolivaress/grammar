import { useXR } from "@react-three/xr"

/** True while an immersive XR session is active. Must be used inside <XR>. */
export function useIsPresenting() {
  return useXR((s) => s.session != null)
}
