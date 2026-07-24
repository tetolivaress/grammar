import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { roomsService } from "../services/rooms.service"
import { roomKeys } from "./keys"

/** All rooms with their panels (the backoffice's main dataset). */
export function useRooms() {
  return useQuery({
    queryKey: roomKeys.all,
    queryFn: roomsService.list,
  })
}

/** Shared shape: every content mutation refreshes the rooms cache. */
function useRoomsInvalidation() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: roomKeys.all })
}

export function useCreateRoom() {
  const invalidate = useRoomsInvalidation()
  return useMutation({ mutationFn: roomsService.create, onSuccess: invalidate })
}

export function useUpdateRoom() {
  const invalidate = useRoomsInvalidation()
  return useMutation({ mutationFn: roomsService.update, onSuccess: invalidate })
}

export function useDeleteRoom() {
  const invalidate = useRoomsInvalidation()
  return useMutation({ mutationFn: roomsService.remove, onSuccess: invalidate })
}

export function useUpsertPanel() {
  const invalidate = useRoomsInvalidation()
  return useMutation({ mutationFn: roomsService.upsertPanel, onSuccess: invalidate })
}

export function useDeletePanel() {
  const invalidate = useRoomsInvalidation()
  return useMutation({ mutationFn: roomsService.deletePanel, onSuccess: invalidate })
}
