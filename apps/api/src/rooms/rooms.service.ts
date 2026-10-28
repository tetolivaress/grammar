import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import {
  MAX_ROOMS_PER_FLOOR,
  floorLabel,
  validatePanelPlacement,
  type PanelContent,
  type RoomKind,
  type Wall,
} from "@grammar-museum/shared"
import type { Panel, Room } from "@prisma/client"
import { prisma } from "../prisma"

type RoomMeta = { name?: string; nameEs?: string; accent?: string; kind?: RoomKind; floor?: number }
type RoomCreate = Required<RoomMeta> & { slug: string }

function toPanelDto(p: Panel) {
  return {
    wall: p.wall,
    slot: p.slot,
    title: p.title,
    subtitle: p.subtitle,
    body: JSON.parse(p.body) as string[],
    footnote: p.footnote,
    imageUrl: p.imageUrl,
  }
}

function toRoomDto(room: Room & { panels: Panel[] }) {
  const { id, slug, name, nameEs, accent, kind, floor, sortIndex } = room
  return { id, slug, name, nameEs, accent, kind, floor, sortIndex, panels: room.panels.map(toPanelDto) }
}

@Injectable()
export class RoomsService {
  async list() {
    const rooms = await prisma.room.findMany({
      orderBy: [{ floor: "asc" }, { sortIndex: "asc" }],
      include: { panels: { orderBy: [{ wall: "asc" }, { slot: "asc" }] } },
    })
    return rooms.map(toRoomDto)
  }

  async create(data: RoomCreate) {
    await this.assertFloorHasSpace(data.floor)
    const existing = await prisma.room.findUnique({ where: { slug: data.slug } })
    if (existing) throw new ConflictException(`A room with slug "${data.slug}" already exists`)
    const last = await prisma.room.aggregate({ _max: { sortIndex: true } })
    const room = await prisma.room.create({
      data: { ...data, sortIndex: (last._max.sortIndex ?? -1) + 1 },
      include: { panels: true },
    })
    return toRoomDto(room)
  }

  async update(id: string, data: RoomMeta) {
    const current = await this.getOrThrow(id)
    if (data.floor !== undefined && data.floor !== current.floor) await this.assertFloorHasSpace(data.floor)
    const room = await prisma.room.update({ where: { id }, data, include: { panels: true } })
    return toRoomDto(room)
  }

  /** Each floor's lobby has at most MAX_ROOMS_PER_FLOOR doorways. */
  private async assertFloorHasSpace(floor: number) {
    const count = await prisma.room.count({ where: { floor } })
    if (count >= MAX_ROOMS_PER_FLOOR) {
      throw new ConflictException(`${floorLabel(floor)} is full (${MAX_ROOMS_PER_FLOOR} rooms); choose another floor`)
    }
  }

  async remove(id: string) {
    await this.getOrThrow(id)
    await prisma.room.delete({ where: { id } })
    return { ok: true }
  }

  async upsertPanel(roomId: string, panel: PanelContent) {
    const room = await this.getOrThrow(roomId)
    const placementError = validatePanelPlacement(room.kind as RoomKind, panel.wall as Wall, panel.slot)
    if (placementError) throw new ConflictException(placementError)
    const data = {
      title: panel.title,
      subtitle: panel.subtitle ?? null,
      body: JSON.stringify(panel.body),
      footnote: panel.footnote ?? null,
      imageUrl: panel.imageUrl ?? null,
    }
    const saved = await prisma.panel.upsert({
      where: { roomId_wall_slot: { roomId, wall: panel.wall, slot: panel.slot } },
      create: { roomId, wall: panel.wall, slot: panel.slot, ...data },
      update: data,
    })
    return toPanelDto(saved)
  }

  async removePanel(roomId: string, wall: string, slot: number) {
    await this.getOrThrow(roomId)
    await prisma.panel
      .delete({ where: { roomId_wall_slot: { roomId, wall, slot } } })
      .catch(() => undefined)
    return { ok: true }
  }

  private async getOrThrow(id: string) {
    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) throw new NotFoundException("Room not found")
    return room
  }
}
