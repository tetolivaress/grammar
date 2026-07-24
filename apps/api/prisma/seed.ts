import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { defaultRooms } from "@grammar-museum/shared"

const prisma = new PrismaClient()

/** Seeds the CMS with the museum's built-in curriculum (idempotent). */
async function main() {
  for (const [index, room] of defaultRooms.entries()) {
    const saved = await prisma.room.upsert({
      where: { slug: room.slug },
      create: {
        slug: room.slug,
        name: room.name,
        nameEs: room.nameEs,
        accent: room.accent,
        kind: room.kind,
        sortIndex: index,
      },
      update: { sortIndex: index },
    })
    for (const panel of room.panels) {
      const data = {
        title: panel.title,
        subtitle: panel.subtitle ?? null,
        body: JSON.stringify(panel.body),
        footnote: panel.footnote ?? null,
        imageUrl: panel.imageUrl ?? null,
      }
      await prisma.panel.upsert({
        where: { roomId_wall_slot: { roomId: saved.id, wall: panel.wall, slot: panel.slot } },
        create: { roomId: saved.id, wall: panel.wall, slot: panel.slot, ...data },
        update: data,
      })
    }
  }
  const count = await prisma.room.count()
  console.log(`Seeded ${count} rooms`)
}

main().finally(() => prisma.$disconnect())
