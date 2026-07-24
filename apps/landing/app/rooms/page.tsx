import type { Metadata } from "next"
import Link from "next/link"
import { Frame } from "lucide-react"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { landingRooms, API_URL } from "../../lib/rooms"

export const metadata: Metadata = {
  title: "The Rooms — The Grammar Museum",
}

async function getExhibitCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${API_URL}/rooms`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error(String(res.status))
    const rooms: { slug: string; panels: unknown[] }[] = await res.json()
    return Object.fromEntries(rooms.map((r) => [r.slug, r.panels.length]))
  } catch {
    return {}
  }
}

/** Small octagonal floor plan: 9 dots around the lobby, this room's lit. */
function FloorPlan({ index, color }: { index: number; color: string }) {
  const dots = Array.from({ length: 9 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 9
    return {
      x: 52 + 42 * Math.cos(angle),
      y: 52 + 42 * Math.sin(angle),
      active: i === index,
    }
  })
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden>
      <polygon
        points="52,32 66.1,37.9 72,52 66.1,66.1 52,72 37.9,66.1 32,52 37.9,37.9"
        fill="none"
        stroke="var(--line)"
        strokeWidth="1.5"
      />
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.active ? 6 : 3.5}
          fill={dot.active ? color : "var(--line)"}
        />
      ))}
    </svg>
  )
}

export default async function RoomsPage() {
  const counts = await getExhibitCounts()

  return (
    <>
      <Header active="Rooms" />
      <main className="container" style={{ paddingTop: 64, paddingBottom: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 820 }}>
          <span className="page-hero pill" style={{ padding: "6px 14px" }}>
            <span className="eyebrow" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
              9 ROOMS · FREE &amp; OPEN ACCESS
            </span>
          </span>
          <h1 style={{ fontSize: 46, fontWeight: 700 }}>The Rooms</h1>
          <p style={{ fontSize: 19, fontStyle: "italic", color: "var(--ink-soft)" }}>
            Las salas del museo
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ink-soft)" }}>
            Nine color-coded rooms circle the octagonal lobby. Walk into any one to explore a
            single grammar topic through interactive exhibits — in your browser or in VR. Pick a
            room to begin.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 40 }}>
          {landingRooms.map((room, index) => {
            const color = `var(${room.color})`
            return (
              <Link key={room.slug} href={`/rooms/${room.slug}`} className="room-row">
                <div className="room-row-accent" style={{ background: color }}>
                  <span className="num-badge" style={{ width: 38, height: 38, borderRadius: 11, fontSize: 17 }}>
                    {room.num}
                  </span>
                  <room.ThumbIcon size={30} />
                </div>
                <div className="room-row-body">
                  <div className="room-row-title">
                    <h3>{room.name}</h3>
                    <span className="es" style={{ color }}>
                      {room.nameEs}
                    </span>
                  </div>
                  <div>
                    <div className="micro-label">WHAT YOU&apos;LL LEARN</div>
                    <p className="room-row-learn">{room.learn}</p>
                  </div>
                  <span className="meta-pill">
                    <Frame size={14} />
                    {counts[room.slug] ?? "—"} exhibits
                  </span>
                </div>
                <div className="room-row-thumb">
                  <FloorPlan index={index} color={color} />
                </div>
              </Link>
            )
          })}
        </div>
      </main>
      <Footer />
    </>
  )
}
