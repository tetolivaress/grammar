import * as THREE from "three"

export const theme = {
  floor: "#e8e2d4", // warm bone
  walls: "#f5f1e8", // off-white
  ceiling: "#ffffff",
  panelBg: "#fffdf7",
  ink: "#1f2430", // near-black text
  accents: {
    conditionals: "#2a9d8f", // teal
    passive: "#e76f51", // terracotta
    modals: "#457b9d", // steel blue
    tenses: "#e9c46a", // amber
    relatives: "#8e7dbe", // violet
    connectors: "#f4a261", // orange
    phrasals: "#6a994e", // green
    idioms: "#bc4b51", // brick red
    gerunds: "#5f7470", // sage
    reported: "#d264a0", // magenta
    translation: "#4b3f9e", // indigo
  } as Record<string, string>,
}

export const fonts = {
  title: "/fonts/Inter-SemiBold.woff",
  body: "/fonts/Inter-Regular.woff",
}

// Text-safe variant of an accent: same hue, lightness clamped down so light
// accents (amber, orange) stay readable on the near-white panel background.
// Bright originals remain in use for frames, trim, and floor stripes.
const textCache = new Map<string, string>()

export function accentText(color: string): string {
  let v = textCache.get(color)
  if (!v) {
    // HSL math must run in sRGB — three's default is the linear working
    // space, where an l-clamp comes back out far lighter than intended.
    const c = new THREE.Color(color)
    const hsl = { h: 0, s: 0, l: 0 }
    c.getHSL(hsl, THREE.SRGBColorSpace)
    // Yellow/orange hues read far lighter than their lightness value — push
    // them down to a dark goldenrod; everything else clamps a bit higher.
    const isYellowish = hsl.h > 0.07 && hsl.h < 0.2
    const maxL = isYellowish ? 0.24 : 0.3
    c.setHSL(hsl.h, Math.min(1, hsl.s * 1.2), Math.min(hsl.l, maxL), THREE.SRGBColorSpace)
    v = "#" + c.getHexString(THREE.SRGBColorSpace)
    textCache.set(color, v)
  }
  return v
}

// One shared material instance per color so meshes can batch state changes.
const cache = new Map<string, THREE.MeshStandardMaterial>()

export function mat(color: string, opts?: { emissive?: string; emissiveIntensity?: number }) {
  const key = `${color}|${opts?.emissive ?? ""}|${opts?.emissiveIntensity ?? ""}`
  let m = cache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      flatShading: true,
      emissive: opts?.emissive ?? "#000000",
      emissiveIntensity: opts?.emissiveIntensity ?? 1,
    })
    cache.set(key, m)
  }
  return m
}
