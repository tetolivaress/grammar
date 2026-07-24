import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { defaultRooms, type PanelContent } from "@grammar-museum/shared"
import { Header } from "../../../components/Header"
import { Footer } from "../../../components/Footer"
import { landingRooms, roomStyle, API_URL, MUSEUM_URL } from "../../../lib/rooms"

interface CmsRoom {
  slug: string
  name: string
  nameEs: string
  panels: PanelContent[]
}

async function getRooms(): Promise<CmsRoom[]> {
  try {
    const res = await fetch(`${API_URL}/rooms`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error(String(res.status))
    return await res.json()
  } catch {
    return defaultRooms
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const style = roomStyle(slug)
  return { title: `${style?.name ?? slug} — The Grammar Museum` }
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const rooms = await getRooms()
  const room = rooms.find((r) => r.slug === slug)
  const style = roomStyle(slug)
  if (!room || !style) notFound()

  const color = `var(${style.color})`
  const ordered = rooms.filter((r) => roomStyle(r.slug))
  const index = ordered.findIndex((r) => r.slug === slug)
  const prev = ordered[(index - 1 + ordered.length) % ordered.length]
  const next = ordered[(index + 1) % ordered.length]
  const prevStyle = roomStyle(prev.slug)!
  const nextStyle = roomStyle(next.slug)!

  // Wall order mirrors the walkthrough: north first, then east/south/west.
  const wallOrder = { north: 0, east: 1, south: 2, west: 3 } as const
  const panels = [...room.panels].sort(
    (a, b) =>
      (wallOrder[a.wall as keyof typeof wallOrder] ?? 4) -
        (wallOrder[b.wall as keyof typeof wallOrder] ?? 4) || a.slot - b.slot,
  )

  return (
    <>
      <Header active="Rooms" />
      <main>
        <section className="detail-hero" style={{ background: color }}>
          <span className="crumb">
            <style.Icon size={15} />
            ROOM {style.num} · {panels.length} EXHIBITS
          </span>
          <h1>{room.name}</h1>
          <p className="es">{room.nameEs}</p>
          <p className="lede">{style.desc}</p>
        </section>

        <section className="container" style={{ paddingTop: 64, paddingBottom: 72, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h2 style={{ fontSize: 30, fontWeight: 700 }}>Exhibits</h2>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "var(--ink-soft)", marginTop: 4 }}>
              {panels.length} exposiciones · walk the wall left to right
            </p>
          </div>

          {panels.map((panel, i) => (
            <article key={`${panel.wall}-${panel.slot}`} className="exhibit">
              <div className="exhibit-bar" style={{ background: color }}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{panel.title}</h3>
              </div>
              <div className="exhibit-body">
                {panel.subtitle && (
                  <div>
                    <div className="micro-label">THE RULE</div>
                    <p className="exhibit-rule">{panel.subtitle}</p>
                  </div>
                )}
                {panel.subtitle && <div className="exhibit-divider" />}
                <div>
                  <div className="micro-label" style={{ marginBottom: 10 }}>
                    EXAMPLES
                  </div>
                  <div className="exhibit-examples">
                    {panel.body.map((line, j) => (
                      <div key={j} className="exhibit-example">
                        <i style={{ background: color }} />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {panel.footnote && <p className="exhibit-foot">{panel.footnote}</p>}
              </div>
            </article>
          ))}

          <nav className="room-nav">
            <Link href={`/rooms/${prev.slug}`}>
              <span className="arrow" style={{ background: `var(${prevStyle.color})` }}>
                <ArrowLeft size={20} />
              </span>
              <span>
                <span className="micro-label">PREVIOUS ROOM</span>
                <strong>{prev.name}</strong>
              </span>
            </Link>
            <Link href={`/rooms/${next.slug}`} className="next">
              <span>
                <span className="micro-label">NEXT ROOM</span>
                <strong>{next.name}</strong>
              </span>
              <span className="arrow" style={{ background: `var(${nextStyle.color})` }}>
                <ArrowRight size={20} />
              </span>
            </Link>
          </nav>

          <a
            className="btn btn-primary btn-lg"
            style={{ alignSelf: "center", background: color }}
            href={MUSEUM_URL}
          >
            Walk this room in 3D
            <ArrowRight size={17} />
          </a>
        </section>
      </main>
      <Footer />
    </>
  )
}

export function generateStaticParams() {
  return landingRooms.map((room) => ({ slug: room.slug }))
}
