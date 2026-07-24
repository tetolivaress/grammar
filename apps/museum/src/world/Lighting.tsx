/**
 * Flat, cheap lighting: ambient + one directional, no shadow maps (Quest
 * budget). Prop lamps add emissive spots of warmth without extra lights.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight intensity={0.8} position={[5, 10, 3]} />
    </>
  )
}
