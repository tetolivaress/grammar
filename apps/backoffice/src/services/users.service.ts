import { authClient } from "../auth"
import { ApiError } from "./http"

export interface UserRow {
  id: string
  name: string
  email: string
  role?: string | null
  banned?: boolean | null
  createdAt: Date | string
}

export type UserCreateInput = { name: string; email: string; password: string; role: "user" | "admin" }

/** Better Auth returns { data, error } — normalize to throw like the REST services. */
async function unwrap<T>(
  promise: Promise<{ data: T | null; error: { message?: string } | null }>,
): Promise<T> {
  const res = await promise
  if (res.error || res.data == null) throw new ApiError(res.error?.message ?? "Request failed")
  return res.data
}

/** Better Auth admin-plugin endpoints, admin role required. */
export const usersService = {
  list: async (): Promise<UserRow[]> => {
    const data = await unwrap(
      authClient.admin.listUsers({
        query: { limit: 100, sortBy: "createdAt", sortDirection: "asc" },
      }),
    )
    return data.users as UserRow[]
  },

  create: (input: UserCreateInput) => unwrap(authClient.admin.createUser(input)),

  setRole: (input: { userId: string; role: "user" | "admin" }) =>
    unwrap(authClient.admin.setRole(input)),

  ban: (input: { userId: string; banReason?: string }) => unwrap(authClient.admin.banUser(input)),

  unban: (input: { userId: string }) => unwrap(authClient.admin.unbanUser(input)),

  remove: (input: { userId: string }) => unwrap(authClient.admin.removeUser(input)),
}
