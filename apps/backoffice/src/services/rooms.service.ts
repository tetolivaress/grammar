import type { PanelContent, RoomContent, Wall } from "@grammar-museum/shared"
import { request } from "./http"

export type RoomDto = RoomContent & { id: string; sortIndex: number }
export type RoomCreateInput = Omit<RoomContent, "panels">
export type RoomUpdateInput = { id: string; patch: Partial<Omit<RoomContent, "panels" | "slug">> }
export type PanelUpsertInput = { roomId: string; panel: PanelContent }
export type PanelDeleteInput = { roomId: string; wall: Wall; slot: number }

/** One function per REST endpoint — consumed only through the query hooks. */
export const roomsService = {
  list: () => request<RoomDto[]>("/rooms"),

  create: (room: RoomCreateInput) =>
    request<RoomDto>("/rooms", { method: "POST", body: JSON.stringify(room) }),

  update: ({ id, patch }: RoomUpdateInput) =>
    request<RoomDto>(`/rooms/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  remove: (id: string) => request<{ ok: true }>(`/rooms/${id}`, { method: "DELETE" }),

  upsertPanel: ({ roomId, panel }: PanelUpsertInput) =>
    request<PanelContent>(`/rooms/${roomId}/panels`, {
      method: "PUT",
      body: JSON.stringify(panel),
    }),

  deletePanel: ({ roomId, wall, slot }: PanelDeleteInput) =>
    request<{ ok: true }>(`/rooms/${roomId}/panels/${wall}/${slot}`, { method: "DELETE" }),
}
