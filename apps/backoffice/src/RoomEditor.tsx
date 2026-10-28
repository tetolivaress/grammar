import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import {
  ACCENTS,
  floorLabel,
  MAX_CORRIDOR_SLOT,
  MAX_FLOOR,
  MAX_ROOMS_PER_FLOOR,
  MAX_ROOM_SLOT,
  roomUpdateSchema,
  WALLS,
  type PanelContent,
  type Wall,
} from "@grammar-museum/shared"
import { z } from "zod"
import { ApiError } from "./services/http"
import type { RoomDto } from "./services/rooms.service"
import { useUpdateRoom } from "./hooks/rooms.hooks"
import { PanelForm } from "./PanelForm"

type MetaValues = z.infer<typeof roomUpdateSchema>

interface Props {
  room: RoomDto
  /** Rooms per floor, to show how full each floor is. */
  floorCounts: number[]
}

export function RoomEditor({ room, floorCounts }: Props) {
  const [selected, setSelected] = useState<{ wall: Wall; slot: number } | null>(null)
  const [metaMessage, setMetaMessage] = useState<string | null>(null)
  const updateRoom = useUpdateRoom()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MetaValues>({
    resolver: standardSchemaResolver(roomUpdateSchema),
    values: { name: room.name, nameEs: room.nameEs, accent: room.accent, kind: room.kind, floor: room.floor },
  })

  // Floors in use plus one empty floor above them
  const floors = Array.from({ length: Math.min(MAX_FLOOR, Math.max(1, floorCounts.length)) + 1 }, (_, f) => f)

  const maxSlot = room.kind === "corridor" ? MAX_CORRIDOR_SLOT : MAX_ROOM_SLOT
  const walls: Wall[] = room.kind === "corridor" ? ["east", "west"] : [...WALLS]

  const panelAt = (wall: Wall, slot: number): PanelContent | null =>
    room.panels.find((p) => p.wall === wall && p.slot === slot) ?? null

  const saveMeta = handleSubmit(async (values) => {
    setMetaMessage(null)
    try {
      await updateRoom.mutateAsync({ id: room.id, patch: values })
      setMetaMessage("Saved ✓")
    } catch (e) {
      setMetaMessage(e instanceof ApiError ? e.fullMessage : "Saving failed")
    }
  })

  return (
    <div className="room-editor">
      <form className="card meta-form" onSubmit={saveMeta}>
        <h2>
          {room.name} <span className="muted">/{room.slug}</span>
        </h2>
        <div className="meta-grid">
          <label>
            Name (door sign)
            <input type="text" {...register("name")} />
            {errors.name && <span className="error">{errors.name.message}</span>}
          </label>
          <label>
            Spanish subtitle
            <input type="text" {...register("nameEs")} />
            {errors.nameEs && <span className="error">{errors.nameEs.message}</span>}
          </label>
          <label>
            Accent color
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
              <option value="room">room (12×12)</option>
              <option value="corridor">corridor (timeline)</option>
            </select>
          </label>
          <label>
            Floor
            <select {...register("floor", { valueAsNumber: true })}>
              {floors.map((f) => {
                const count = floorCounts[f] ?? 0
                const full = f !== room.floor && count >= MAX_ROOMS_PER_FLOOR
                return (
                  <option key={f} value={f} disabled={full}>
                    {floorLabel(f)} ({count}/{MAX_ROOMS_PER_FLOOR}){full ? " · full" : ""}
                  </option>
                )
              })}
            </select>
          </label>
        </div>
        <footer>
          <button type="submit" disabled={updateRoom.isPending}>
            Save room
          </button>
          {metaMessage && <span className="muted">{metaMessage}</span>}
        </footer>
      </form>

      <div className="card walls-card">
        <h3>Wall panels</h3>
        <p className="muted">
          {room.kind === "corridor"
            ? "Corridors hang panels along their east and west walls (6 slots each)."
            : "Each wall holds up to 3 panels. The south wall also has the entrance door."}
        </p>
        {walls.map((wall) => (
          <div key={wall} className="wall-row">
            <span className="wall-name">{wall}</span>
            <div className="slots">
              {Array.from({ length: maxSlot + 1 }, (_, slot) => {
                const panel = panelAt(wall, slot)
                const active = selected?.wall === wall && selected?.slot === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`slot ${panel ? "filled" : "empty"} ${active ? "active" : ""}`}
                    onClick={() => setSelected({ wall, slot })}
                  >
                    <em>slot {slot + 1}</em>
                    {panel ? (
                      <strong>
                        {panel.imageUrl ? "🖼 " : ""}
                        {panel.title}
                      </strong>
                    ) : (
                      <span className="muted">+ add panel</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <PanelForm
          key={`${room.id}-${selected.wall}-${selected.slot}`}
          roomId={room.id}
          wall={selected.wall}
          slot={selected.slot}
          panel={panelAt(selected.wall, selected.slot)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
