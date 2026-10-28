import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { ACCENTS, floorLabel, MAX_FLOOR, MAX_ROOMS_PER_FLOOR, roomSchema } from "@grammar-museum/shared"
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

  // Floors in use plus one empty floor above them, so a room can open a new level.
  const topFloor = Math.min(MAX_FLOOR, Math.max(1, ...rooms.map((r) => r.floor)) + 1)
  const floors = Array.from({ length: topFloor + 1 }, (_, f) => f)
  const roomsOn = (floor: number) => rooms.filter((r) => r.floor === floor)
  const firstFreeFloor = floors.find((f) => roomsOn(f).length < MAX_ROOMS_PER_FLOOR) ?? 0
  const blankRoom = { kind: "room" as const, accent: ACCENTS[0], slug: "", name: "", nameEs: "", floor: firstFreeFloor }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewRoom>({
    resolver: standardSchemaResolver(roomSchema),
    defaultValues: blankRoom,
  })

  const onCreate = handleSubmit(async (values) => {
    setError(null)
    try {
      const room = await createRoom.mutateAsync(values)
      reset(blankRoom)
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
              Rooms <span className="muted">{rooms.length}</span>
            </h2>
            <button
              type="button"
              onClick={() => {
                if (!creating) reset(blankRoom)
                setCreating((v) => !v)
              }}
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
              <label>
                Floor
                <select {...register("floor", { valueAsNumber: true })}>
                  {floors.map((f) => {
                    const full = roomsOn(f).length >= MAX_ROOMS_PER_FLOOR
                    return (
                      <option key={f} value={f} disabled={full}>
                        {floorLabel(f)} ({roomsOn(f).length}/{MAX_ROOMS_PER_FLOOR}){full ? " · full" : ""}
                      </option>
                    )
                  })}
                </select>
              </label>
              <button type="submit" disabled={createRoom.isPending}>
                Create room
              </button>
            </form>
          )}

          {floors
            .filter((f) => roomsOn(f).length > 0)
            .map((f) => (
              <div key={f} className="floor-group">
                <h3 className="floor-head">
                  {floorLabel(f)}{" "}
                  <span className="muted">
                    {roomsOn(f).length}/{MAX_ROOMS_PER_FLOOR}
                  </span>
                </h3>
                <ul>
                  {roomsOn(f).map((room) => (
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
            ))}
        </div>
        {loadError && <p className="error">Could not load rooms — is the API running?</p>}
        {error && <p className="error">{error}</p>}
      </aside>

      <main>
        {section === "users" && isAdmin ? (
          <UsersPage />
        ) : selected ? (
          <RoomEditor key={selected.id} room={selected} floorCounts={floors.map((f) => roomsOn(f).length)} />
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
