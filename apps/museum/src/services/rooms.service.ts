import type { RoomContent } from "@grammar-museum/shared"
import { API_URL } from "../config/api"

/** The museum's only API call: the full room/panel content from the CMS. */
export const roomsService = {
  list: async (): Promise<RoomContent[]> => {
    const res = await fetch(`${API_URL}/rooms`)
    if (!res.ok) throw new Error(`Rooms request failed (${res.status})`)
    return res.json()
  },
}
