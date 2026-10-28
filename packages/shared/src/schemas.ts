import { z } from "zod"

export const WALLS = ["north", "east", "south", "west"] as const
export const ROOM_KINDS = ["room", "corridor"] as const
export const ACCENTS = [
  "conditionals",
  "passive",
  "modals",
  "tenses",
  "relatives",
  "connectors",
  "phrasals",
  "idioms",
  "gerunds",
  "reported",
  "translation",
] as const

// No limit on rooms in total: they stack on floors joined by stairs. One floor's
// lobby is checked for overlaps up to 11 doors (rooms.config.ts).
export const MAX_ROOMS_PER_FLOOR = 11
export const MAX_FLOOR = 9 // floors 0 (ground) to 9
export const MAX_ROOM_SLOT = 2 // room walls hold up to 3 panels (slots 0-2)
export const MAX_CORRIDOR_SLOT = 5 // corridor side walls hold 6 (slots 0-5)
export const MAX_BODY_ITEMS = 6
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

export type Wall = (typeof WALLS)[number]
export type RoomKind = (typeof ROOM_KINDS)[number]
export type Accent = (typeof ACCENTS)[number]

export const panelSchema = z.object({
  wall: z.enum(WALLS),
  slot: z.number().int().min(0).max(MAX_CORRIDOR_SLOT),
  title: z.string().trim().min(1, "Title is required").max(60),
  subtitle: z.string().trim().max(170).nullish(),
  body: z
    .array(z.string().trim().min(1, "Empty lines are not allowed").max(240))
    .min(1, "Add at least one line")
    .max(MAX_BODY_ITEMS, `Maximum ${MAX_BODY_ITEMS} lines`),
  footnote: z.string().trim().max(220).nullish(),
  imageUrl: z
    .string()
    .trim()
    .regex(/^\/uploads\/[\w][\w.-]*$/, "Must be an uploaded image path")
    .max(300)
    .nullish(),
})

export const roomSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only")
    .min(2)
    .max(30),
  name: z.string().trim().min(1, "Name is required").max(40),
  nameEs: z.string().trim().min(1, "Spanish name is required").max(40),
  accent: z.enum(ACCENTS),
  kind: z.enum(ROOM_KINDS),
  floor: z.number().int().min(0).max(MAX_FLOOR),
})

export const roomUpdateSchema = roomSchema.omit({ slug: true }).partial()

export type PanelContent = z.infer<typeof panelSchema>

/** "Ground floor", "Floor 1", … for the backoffice and error messages. */
export function floorLabel(floor: number): string {
  return floor === 0 ? "Ground floor" : `Floor ${floor}`
}
export type RoomContent = z.infer<typeof roomSchema> & { panels: PanelContent[] }

/**
 * Wall/slot rules that depend on the room kind:
 * - corridors hang panels on their long east/west walls only, slots 0-5
 * - rooms use any wall, slots 0-2
 */
export function validatePanelPlacement(kind: RoomKind, wall: Wall, slot: number): string | null {
  if (kind === "corridor") {
    if (wall !== "east" && wall !== "west") return "Corridor panels must be on the east or west wall"
    if (slot > MAX_CORRIDOR_SLOT) return `Corridor slots go from 0 to ${MAX_CORRIDOR_SLOT}`
    return null
  }
  if (slot > MAX_ROOM_SLOT) return `Room slots go from 0 to ${MAX_ROOM_SLOT}`
  return null
}
