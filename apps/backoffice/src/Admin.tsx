import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { ACCENTS, MAX_ROOMS, roomSchema } from "@grammar-museum/shared"
import { z } from "zod"
import { ApiError } from "./services/http"
import { useCreateRoom, useDeleteRoom, useRooms } from "./hooks/rooms.hooks"
import { RoomEditor } from "./RoomEditor"
import { UsersPage } from "./UsersPage"
import { signOut, useSession } from "./auth"

type NewRoom = z.infer<typeof roomSchema>
type Section = "rooms" | "users"

export function Admin() {
  const { data: session } = useSession()
  const isAdmin = session?.user.role === "admin"
  const [section, setSection] = useState<Section>("rooms")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: rooms = [], error: loadError } = useRooms()
  const createRoom = useCreateRoom()
  const deleteRoom = useDeleteRoom()

  const selected = rooms.find((r) => r.id === selectedId) ?? null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewRoom>({
    resolver: standardSchemaResolver(roomSchema),
    defaultValues: { kind: "room", accent: ACCENTS[0] },
  })

  const onCreate = handleSubmit(async (values) => {
    setError(null)
    try {
      const room = await createRoom.mutateAsync(values)
      reset({ kind: "room", accent: ACCENTS[0], slug: "", name: "", nameEs: "" })
      setCreating(false)
      setSelectedId(room.id)
    } catch (e) {
      setError(e instanceof ApiError ? e.fullMessage : "Could not create the room")
    }
  })

  async function onDelete(roomId: string, roomName: string) {
    if (!confirm(`Delete "${roomName}" and all its panels?`)) return
    try {
      await deleteRoom.mutateAsync(roomId)
      if (selectedId === roomId) setSelectedId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.fullMessage : "Could not delete the room")
    }
  }

  return (
    <div className="admin">
      <aside className="sidebar">
        <header>
          <h1>Backoffice</h1>
          <p className="muted">
            {session?.user.email} · {session?.user.role ?? "user"}
          </p>
          <button type="button" className="link" onClick={() => signOut()}>
            Sign out
          </button>
        </header>

        <nav className="section-nav">
          <button
            type="button"
            className={section === "rooms" ? "active" : ""}
            onClick={() => setSection("rooms")}
          >
            Rooms
          </button>
          {isAdmin && (
            <button
              type="button"
              className={section === "users" ? "active" : ""}
              onClick={() => setSection("users")}
            >
              Users
            </button>
          )}
        </nav>

        <div className="rooms-list">
          <div className="rooms-list-head">
            <h2>
              Rooms <span className="muted">{rooms.length}/{MAX_ROOMS}</span>
            </h2>
            <button
              type="button"
              disabled={rooms.length >= MAX_ROOMS}
              title={rooms.length >= MAX_ROOMS ? `Maximum ${MAX_ROOMS} rooms` : undefined}
              onClick={() => setCreating((v) => !v)}
            >
              + New
            </button>
          </div>

          {creating && (
            <form className="card new-room" onSubmit={onCreate}>
              <label>
                Slug
                <input type="text" {...register("slug")} placeholder="pronouns" />
                {errors.slug && <span className="error">{errors.slug.message}</span>}
              </label>
              <label>
                Name
                <input type="text" {...register("name")} placeholder="Pronouns" />
                {errors.name && <span className="error">{errors.name.message}</span>}
              </label>
              <label>
                Spanish subtitle
                <input type="text" {...register("nameEs")} placeholder="Pronombres" />
                {errors.nameEs && <span className="error">{errors.nameEs.message}</span>}
              </label>
              <label>
                Accent
                <select {...register("accent")}>
                  {ACCENTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Layout
                <select {...register("kind")}>
                  <option value="room">room</option>
                  <option value="corridor">corridor</option>
                </select>
              </label>
              <button type="submit" disabled={createRoom.isPending}>
                Create room
              </button>
            </form>
          )}

          <ul>
            {rooms.map((room) => (
              <li key={room.id} className={room.id === selectedId ? "active" : ""}>
                <button type="button" className="room-btn" onClick={() => setSelectedId(room.id)}>
                  <strong>{room.name}</strong>
                  <span className="muted">
                    {room.nameEs} · {room.panels.length} panels
                  </span>
                </button>
                <button
                  type="button"
                  className="link danger"
                  disabled={deleteRoom.isPending}
                  onClick={() => onDelete(room.id, room.name)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
        {loadError && <p className="error">Could not load rooms — is the API running?</p>}
        {error && <p className="error">{error}</p>}
      </aside>

      <main>
        {section === "users" && isAdmin ? (
          <UsersPage />
        ) : selected ? (
          <RoomEditor key={selected.id} room={selected} />
        ) : (
          <div className="empty-state">
            <h2>Select a room</h2>
            <p className="muted">
              Pick a room on the left to edit its door sign, wall panels and images. Changes appear
              in the 3D museum on the next page load.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
