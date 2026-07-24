import { defaultRooms, type RoomContent } from "@grammar-museum/shared"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003"
const MUSEUM_URL = process.env.NEXT_PUBLIC_MUSEUM_URL ?? "http://localhost:5173"
const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL ?? "http://localhost:5174"

const ACCENT_HEX: Record<string, string> = {
  conditionals: "#2a9d8f",
  passive: "#e76f51",
  modals: "#457b9d",
  tenses: "#e9c46a",
  relatives: "#8e7dbe",
  connectors: "#f4a261",
  phrasals: "#6a994e",
  idioms: "#bc4b51",
  gerunds: "#5f7470",
  reported: "#d264a0",
}

async function getRooms(): Promise<Pick<RoomContent, "slug" | "name" | "nameEs" | "accent">[]> {
  try {
    const res = await fetch(`${API_URL}/rooms`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error(String(res.status))
    return await res.json()
  } catch {
    return defaultRooms
  }
}

export default async function Home() {
  const rooms = await getRooms()

  return (
    <main>
      <section className="hero">
        <p className="kicker">El Museo de la Gramática</p>
        <h1>Learn English grammar by walking through it.</h1>
        <p className="lede">
          The Grammar Museum is a small 3D world: a lobby, {rooms.length} color-coded rooms, and
          every wall teaching one thing with clear examples. Built for Spanish-speaking learners
          (A2–B2). Works in your browser — desktop, phone, or Meta Quest.
        </p>
        <div className="cta">
          <a className="btn primary" href={MUSEUM_URL}>
            Visit the museum
          </a>
          <a className="btn" href={BACKOFFICE_URL}>
            Content backoffice
          </a>
        </div>
      </section>

      <section className="rooms">
        <h2>The rooms</h2>
        <ul>
          {rooms.map((room) => (
            <li key={room.slug} style={{ borderTopColor: ACCENT_HEX[room.accent] ?? "#1f2430" }}>
              <strong>{room.name}</strong>
              <span>{room.nameEs}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="how">
        <h2>How it works</h2>
        <ol>
          <li>
            <strong>Walk.</strong> WASD or arrows on desktop, two thumbs on a phone, the left
            joystick in VR.
          </li>
          <li>
            <strong>Read.</strong> Each room teaches one topic through wall exhibits — formulas,
            examples, tips, and images.
          </li>
          <li>
            <strong>Edit.</strong> Teachers manage every wall, sign and image from the backoffice —
            up to ten rooms.
          </li>
        </ol>
      </section>

      <footer>
        <p>The Grammar Museum · built with react-three-fiber, NestJS and Better Auth</p>
      </footer>
    </main>
  )
}
