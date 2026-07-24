import { defaultRooms, type PanelContent, type RoomContent } from "@grammar-museum/shared"

export type { PanelContent as Panel, RoomContent, Wall } from "@grammar-museum/shared"

export interface RoomConfig {
  slug: string
  name: string
  nameEs: string
  accent: string
  kind: "room" | "corridor"
  size: [number, number, number] // w, h, d in meters
  position: [number, number, number]
  rotationY: number
  panels: PanelContent[]
}

// ---------------------------------------------------------------------------
// Radial layout: an N-sided lobby (apothem 8 m => 16 m across) with one room
// per face, spaced 360/N degrees. Each room connects through a tunnel and
// opens toward the lobby (its local -Z / "south" wall carries the doorway).
//
// Twelve-meter rooms rotated 36° apart cannot share one ring without their
// front corners interpenetrating (separating-axis test), so rooms alternate
// between a near and a far ring: a far neighbor at distance D projects onto a
// near room's width axis at D*sin36° - 8.66 m, which must exceed 6.2 m
// => D ≥ 25.6. The narrow corridor kind clears its neighbors from the near
// ring. Content comes from the CMS at runtime (1..10 rooms); the layout is
// recomputed from the array order.
// ---------------------------------------------------------------------------

export const LOBBY_APOTHEM = 8
export const DOOR_WIDTH = 2
export const DOOR_HEIGHT = 2.6
export const WALL_H = 4
export const ROOM_WALL_PLANE = 14.8 // near ring: lobby-facing wall distance
export const ROOM_WALL_PLANE_FAR = 19.8 // far ring (staggered)
export const EYE_HEIGHT = 1.6

const ROOM_DIST = ROOM_WALL_PLANE + 6 // 12x12 room center, near ring
const ROOM_DIST_FAR = ROOM_WALL_PLANE_FAR + 6 // 12x12 room center, far ring
const CORRIDOR_DIST = ROOM_WALL_PLANE + 12 // 4x24 corridor center

/** The lobby polygon needs at least 3 faces even with fewer rooms. */
export function lobbyFaces(roomCount: number) {
  return Math.max(3, roomCount)
}

const deg = (d: number) => (d * Math.PI) / 180

/**
 * Radial distance of a room's center from the lobby. Corridors are narrow
 * enough to always sit on the near ring; full 12 m rooms alternate between
 * the near and far ring by index so adjacent boxes never intersect (see the
 * layout comment above).
 */
function radialDistance(kind: RoomContent["kind"], index: number): number {
  if (kind === "corridor") return CORRIDOR_DIST
  const onFarRing = index % 2 === 1
  return onFarRing ? ROOM_DIST_FAR : ROOM_DIST
}

/** Computes world placement for CMS room content (array order = angle). */
export function buildRoomConfigs(content: RoomContent[]): RoomConfig[] {
  const n = lobbyFaces(content.length)
  const step = 360 / n
  return content.map((room, i) => {
    const angle = deg(180 - i * step)
    const corridor = room.kind === "corridor"
    const dist = radialDistance(room.kind, i)
    return {
      slug: room.slug,
      name: room.name,
      nameEs: room.nameEs,
      accent: room.accent,
      kind: room.kind,
      size: corridor ? [4, 4, 24] : [12, 4, 12],
      position: [Math.sin(angle) * dist, 0, Math.cos(angle) * dist],
      rotationY: angle,
      panels: room.panels,
    }
  })
}

/** Offline fallback: the bundled curriculum. */
export const defaultRoomConfigs = buildRoomConfigs(defaultRooms)
