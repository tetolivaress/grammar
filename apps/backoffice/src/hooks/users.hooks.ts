import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usersService } from "../services/users.service"
import { userKeys } from "./keys"

/** User list (admin only — pass enabled=false for non-admins). */
export function useUsers(enabled = true) {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: usersService.list,
    enabled,
  })
}

function useUsersInvalidation() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: userKeys.all })
}

export function useCreateUser() {
  const invalidate = useUsersInvalidation()
  return useMutation({ mutationFn: usersService.create, onSuccess: invalidate })
}

export function useSetUserRole() {
  const invalidate = useUsersInvalidation()
  return useMutation({ mutationFn: usersService.setRole, onSuccess: invalidate })
}

export function useBanUser() {
  const invalidate = useUsersInvalidation()
  return useMutation({ mutationFn: usersService.ban, onSuccess: invalidate })
}

export function useUnbanUser() {
  const invalidate = useUsersInvalidation()
  return useMutation({ mutationFn: usersService.unban, onSuccess: invalidate })
}

export function useRemoveUser() {
  const invalidate = useUsersInvalidation()
  return useMutation({ mutationFn: usersService.remove, onSuccess: invalidate })
}
