import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { ApiError } from "./services/http"
import {
  useBanUser,
  useCreateUser,
  useRemoveUser,
  useSetUserRole,
  useUnbanUser,
  useUsers,
} from "./hooks/users.hooks"
import { useSession } from "./auth"

const newUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(["user", "admin"]),
})

type NewUser = z.infer<typeof newUserSchema>

/** Admin-only: list, create, promote/demote, ban and delete accounts. */
export function UsersPage() {
  const { data: session } = useSession()
  const me = session?.user.id
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: users = [], error: loadError } = useUsers()
  const createUser = useCreateUser()
  const setRole = useSetUserRole()
  const banUser = useBanUser()
  const unbanUser = useUnbanUser()
  const removeUser = useRemoveUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewUser>({
    resolver: standardSchemaResolver(newUserSchema),
    defaultValues: { role: "user" },
  })

  const onCreate = handleSubmit(async (values) => {
    setError(null)
    try {
      await createUser.mutateAsync(values)
      reset({ role: "user", name: "", email: "", password: "" })
      setCreating(false)
    } catch (e) {
      setError(e instanceof ApiError ? e.fullMessage : "Could not create the user")
    }
  })

  async function run(action: Promise<unknown>) {
    setError(null)
    try {
      await action
    } catch (e) {
      setError(e instanceof ApiError ? e.fullMessage : "Action failed")
    }
  }

  const anyPending =
    setRole.isPending || banUser.isPending || unbanUser.isPending || removeUser.isPending

  return (
    <div className="users-page">
      <div className="card">
        <div className="rooms-list-head">
          <h2>
            Users <span className="muted">{users.length}</span>
          </h2>
          <button type="button" onClick={() => setCreating((v) => !v)}>
            + New user
          </button>
        </div>

        {creating && (
          <form className="card new-user" onSubmit={onCreate}>
            <div className="meta-grid">
              <label>
                Name
                <input type="text" {...register("name")} placeholder="Ada Lovelace" />
                {errors.name && <span className="error">{errors.name.message}</span>}
              </label>
              <label>
                Email
                <input type="email" {...register("email")} placeholder="ada@example.com" />
                {errors.email && <span className="error">{errors.email.message}</span>}
              </label>
              <label>
                Password
                <input type="password" {...register("password")} placeholder="min. 8 characters" />
                {errors.password && <span className="error">{errors.password.message}</span>}
              </label>
              <label>
                Role
                <select {...register("role")}>
                  <option value="user">user — can edit content</option>
                  <option value="admin">admin — can also manage users</option>
                </select>
              </label>
            </div>
            <button type="submit" disabled={createUser.isPending}>
              Create user
            </button>
          </form>
        )}

        {loadError && <p className="error">Could not load users</p>}
        {error && <p className="error">{error}</p>}

        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u.id === me
              const disabled = anyPending || isMe
              return (
                <tr key={u.id} className={u.banned ? "banned" : ""}>
                  <td>
                    <strong>{u.name}</strong>
                    <span className="muted"> {u.email}</span>
                    {isMe && <span className="you">you</span>}
                  </td>
                  <td>{u.role ?? "user"}</td>
                  <td>{u.banned ? "banned" : "active"}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="link"
                      disabled={disabled}
                      onClick={() =>
                        run(
                          setRole.mutateAsync({
                            userId: u.id,
                            role: u.role === "admin" ? "user" : "admin",
                          }),
                        )
                      }
                    >
                      {u.role === "admin" ? "Make user" : "Make admin"}
                    </button>
                    <button
                      type="button"
                      className="link"
                      disabled={disabled}
                      onClick={() =>
                        run(
                          u.banned
                            ? unbanUser.mutateAsync({ userId: u.id })
                            : banUser.mutateAsync({
                                userId: u.id,
                                banReason: "Banned from the backoffice",
                              }),
                        )
                      }
                    >
                      {u.banned ? "Unban" : "Ban"}
                    </button>
                    <button
                      type="button"
                      className="link danger"
                      disabled={disabled}
                      onClick={() => {
                        if (confirm(`Delete ${u.email} permanently?`)) {
                          run(removeUser.mutateAsync({ userId: u.id }))
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="muted">
          Admins manage users and content; users only edit content. Banned accounts cannot sign in.
        </p>
      </div>
    </div>
  )
}
