import { defaultRooms, MAX_ROOMS_PER_FLOOR, type PanelContent, type RoomContent } from "@grammar-museum/shared"

export type { PanelContent as Panel, RoomContent, Wall } from "@grammar-museum/shared"

export interface RoomConfig {
  slug: string
  name: string
  nameEs: string
  accent: string
  kind: "room" | "corridor"
  floor: number // 0 = ground; position[1] is floor * FLOOR_H
  face: number // lobby face (doorway) index on its floor
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
// Twelve-meter rooms a few tens of degrees apart cannot share one ring without
// their front corners interpenetrating (separating-axis test), so rooms
// alternate between a near and a far ring: a far neighbor at distance D
// projects onto a near room's width axis at D*sin(360°/N) - 8.66 m, which must
// exceed 6.2 m => D ≥ 27.5 at N = 11. With an odd N the last room would sit on
// the near ring beside the near-ring room at index 0, so it goes to the far
// ring too. The narrow corridor kind clears its neighbors from the near ring.
// Content comes from the CMS at runtime; the layout is recomputed from the
// array order within each floor.
//
// Floors: every floor repeats the same lobby polygon (faces = the busiest
// floor's room count, at most MAX_ROOMS_PER_FLOOR), stacked FLOOR_H apart, so
// a room sits exactly above the one with the same face index below and the
// per-floor footprint check holds on every level. Floors above the ground have
// a ring-shaped lobby around an open atrium; a switchback staircase in the
// atrium joins each floor to the next (Stairs.tsx). A footprint check of rooms, corridors and
// tunnels for every count up to 11 and every mix of rooms and corridors
// leaves ≥ 0.95 m between neighbors.
// ---------------------------------------------------------------------------

export const LOBBY_APOTHEM = 8
export const DOOR_WIDTH = 2
export const DOOR_HEIGHT = 2.6
export const WALL_H = 4
export const ROOM_WALL_PLANE = 14.8 // near ring: lobby-facing wall distance
export const ROOM_WALL_PLANE_FAR = 22.8 // far ring (staggered)
export const EYE_HEIGHT = 1.6
export const SPAWN_Z = 6.5 // start on the lobby's +z side, facing the staircase's foot
export const SLAB = 0.2 // floor slab between levels; room ceilings are this thick too
export const FLOOR_H = WALL_H + SLAB // level-to-level height
export const ATRIUM_R = 4 // open center of the upper lobbies (circumradius); the stairs fit inside

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
function radialDistance(kind: RoomContent["kind"], index: number, count: number): number {
  if (kind === "corridor") return CORRIDOR_DIST
  // odd count: the last room neighbors index 0 (near ring) as well as index count-2
  const besideIndexZero = count % 2 === 1 && count > 3 && index === count - 1
  const onFarRing = index % 2 === 1 || besideIndexZero
  return onFarRing ? ROOM_DIST_FAR : ROOM_DIST
}

/** Rooms grouped by floor, in content order. */
function roomsByFloor(content: RoomContent[]): Map<number, RoomContent[]> {
  const floors = new Map<number, RoomContent[]>()
  for (const room of content) {
    const floor = room.floor ?? 0
    floors.set(floor, [...(floors.get(floor) ?? []), room])
  }
  return floors
}

/** Lobby faces shared by every floor: the busiest floor's room count. */
export function lobbyFaceCount(content: { floor: number }[]): number {
  const perFloor = new Map<number, number>()
  for (const r of content) perFloor.set(r.floor ?? 0, (perFloor.get(r.floor ?? 0) ?? 0) + 1)
  return lobbyFaces(Math.min(MAX_ROOMS_PER_FLOOR, Math.max(0, ...perFloor.values())))
}

/** Highest floor to build: always at least a second level, so the stairs lead somewhere. */
export function topFloor(configs: { floor: number }[]): number {
  return Math.max(1, ...configs.map((c) => c.floor))
}

/** Computes world placement for CMS room content (array order = angle within a floor). */
export function buildRoomConfigs(content: RoomContent[]): RoomConfig[] {
  const n = lobbyFaceCount(content)
  const step = 360 / n
  const configs: RoomConfig[] = []
  for (const [floor, rooms] of roomsByFloor(content)) {
    rooms.forEach((room, i) => {
      if (i >= n) {
        // the API keeps floors within MAX_ROOMS_PER_FLOOR; never stack a room on a neighbor
        console.warn(`Floor ${floor} has more than ${n} rooms; "${room.slug}" is not shown`)
        return
      }
      const angle = deg(180 - i * step)
      const corridor = room.kind === "corridor"
      const dist = radialDistance(room.kind, i, n)
      configs.push({
        slug: room.slug,
        name: room.name,
        nameEs: room.nameEs,
        accent: room.accent,
        kind: room.kind,
        floor,
        face: i,
        size: corridor ? [4, 4, 24] : [12, 4, 12],
        position: [Math.sin(angle) * dist, floor * FLOOR_H, Math.cos(angle) * dist],
        rotationY: angle,
        panels: room.panels,
      })
    })
  }
  return configs
}

/** Offline fallback: the bundled curriculum. */
export const defaultRoomConfigs = buildRoomConfigs(defaultRooms)
