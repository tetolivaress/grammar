import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { roomsService } from "../services/rooms.service"
import { useAppStore } from "../store/useAppStore"

export const roomKeys = {
  all: ["rooms"] as const,
}

/**
 * Loads CMS content once per visit and feeds it into the zustand store the
 * 3D world renders from. staleTime Infinity + no focus refetch on purpose:
 * a background refetch would rebuild walls around a walking visitor. If the
 * API is unreachable the store keeps the bundled curriculum.
 */
export function useRoomContent() {
  const query = useQuery({
    queryKey: roomKeys.all,
    queryFn: roomsService.list,
    staleTime: Infinity,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (query.data) useAppStore.getState().setRoomContent(query.data)
  }, [query.data])

  useEffect(() => {
    if (query.error) console.info("Museum API unreachable — using bundled content")
  }, [query.error])

  return query
}
