import { memo, Suspense } from "react"
import { Image, RoundedBox, Text } from "@react-three/drei"
import type { Panel } from "../config/rooms.config"
import { assetUrl } from "../config/api"
import { theme, fonts, mat, accentText } from "../config/theme"

const W = 3
const H = 2.2
const D = 0.05
const LEFT = -1.3
const FACE = D / 2 + 0.005

interface Props {
  panel: Panel
  accent: string
  position: [number, number, number]
  rotationY: number
}

/**
 * Read-only exhibit panel: accent bar + title, subtitle, bulleted examples,
 * optional uploaded image, optional footnote. Memoized — troika text geometry
 * is the most expensive thing in the scene.
 */
export const WallPanel = memo(function WallPanel({ panel, accent, position, rotationY }: Props) {
  const hasSubtitle = !!panel.subtitle
  const hasImage = !!panel.imageUrl
  // ~40 chars fit per 2.6 m line at fontSize 0.13; reserve space per wrapped line
  const subtitleLines = hasSubtitle ? Math.ceil(panel.subtitle!.length / 40) : 0
  const bodyTop = hasSubtitle ? 0.68 - subtitleLines * 0.17 - 0.09 : 0.62
  const bodyText = panel.body.map((line) => `•  ${line}`).join("\n")

  return (
    <group position={position} rotation-y={rotationY}>
      {/* slight emissive so panels stay bright on walls facing away from the light */}
      <RoundedBox
        args={[W, H, D]}
        radius={0.02}
        material={mat(theme.panelBg, { emissive: theme.panelBg, emissiveIntensity: 0.35 })}
      />
      {/* accent bar beside the title */}
      <mesh position={[LEFT - 0.09, 0.85, FACE]} material={mat(accent)}>
        <boxGeometry args={[0.06, 0.26, 0.012]} />
      </mesh>
      <Text
        font={fonts.title}
        fontSize={0.2}
        color={theme.ink}
        anchorX="left"
        anchorY="middle"
        maxWidth={2.6}
        position={[LEFT, 0.85, FACE]}
      >
        {panel.title}
      </Text>
      {hasSubtitle && (
        <Text
          font={fonts.title}
          fontSize={0.13}
          color={accentText(accent)}
          anchorX="left"
          anchorY="top"
          maxWidth={2.6}
          lineHeight={1.3}
          position={[LEFT, 0.68, FACE]}
        >
          {panel.subtitle}
        </Text>
      )}
      <Text
        font={fonts.body}
        fontSize={0.115}
        color={theme.ink}
        anchorX="left"
        anchorY="top"
        maxWidth={2.6}
        lineHeight={1.45}
        position={[LEFT, bodyTop, FACE]}
      >
        {bodyText}
      </Text>
      {hasImage && (
        <Suspense fallback={null}>
          {/* uploaded wall image occupies the lower half of the panel */}
          <Image
            url={assetUrl(panel.imageUrl!)}
            position={[0, -0.52, FACE]}
            scale={[2.6, 0.92]}
            radius={0.03}
            toneMapped={false}
          />
        </Suspense>
      )}
      {panel.footnote && !hasImage && (
        <Text
          font={fonts.body}
          fontSize={0.09}
          color={theme.ink}
          fillOpacity={0.6}
          anchorX="left"
          anchorY="bottom"
          maxWidth={2.6}
          lineHeight={1.35}
          position={[LEFT, -0.98, FACE]}
        >
          {panel.footnote}
        </Text>
      )}
    </group>
  )
})
