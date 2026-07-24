import {
  ArrowRight,
  BookOpen,
  Gamepad2,
  Glasses,
  GraduationCap,
  Landmark,
  Monitor,
  Play,
  Smartphone,
  User,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { RoomCard } from "../components/RoomCard"
import { landingRooms, MUSEUM_URL } from "../lib/rooms"

const DOORS: { color: string; x: number; y: number }[] = [
  { color: "--room-verb-tenses", x: 258, y: 38 },
  { color: "--room-conditionals", x: 375, y: 81 },
  { color: "--room-passive", x: 437, y: 188 },
  { color: "--room-modals", x: 416, y: 311 },
  { color: "--room-relative", x: 320, y: 391 },
  { color: "--room-connectors", x: 196, y: 391 },
  { color: "--room-gerunds", x: 100, y: 311 },
  { color: "--room-phrasal", x: 79, y: 188 },
  { color: "--room-idioms", x: 141, y: 81 },
]

const STEPS = [
  {
    Icon: Monitor, color: "--room-conditionals", num: "1",
    title: "Open in your browser",
    desc: "No install and no account. The museum loads instantly in any modern browser.",
  },
  {
    Icon: Gamepad2, color: "--room-modals", num: "2",
    title: "Walk with WASD or teleport in VR",
    desc: "Move with WASD and mouse on desktop, or teleport freely with your controllers in VR.",
  },
  {
    Icon: BookOpen, color: "--room-relative", num: "3",
    title: "Learn from wall exhibits",
    desc: "Read the exhibits, try the interactive examples, and revisit any room at your own pace.",
  },
]

const PLATFORMS = [
  {
    Icon: Monitor, color: "--room-connectors", title: "Desktop",
    desc: "Full walkthrough with keyboard and mouse — the best way to read every exhibit.",
  },
  {
    Icon: Smartphone, color: "--room-gerunds", title: "Mobile touch",
    desc: "Tap and drag to look around and move on any phone or tablet, no app required.",
  },
  {
    Icon: Glasses, color: "--room-phrasal", title: "Meta Quest VR",
    desc: "Step physically inside the rooms in room-scale VR through your browser with WebXR.",
  },
]

const AUDIENCES = [
  {
    Icon: GraduationCap, color: "--room-verb-tenses", title: "Learners A2–B2",
    desc: "Spanish-speaking students building from elementary to upper-intermediate English, one topic at a time.",
  },
  {
    Icon: User, color: "--room-idioms", title: "Self-learners",
    desc: "Anyone studying on their own who wants a calmer, spatial way to review and remember grammar.",
  },
  {
    Icon: Users, color: "--room-passive", title: "Classrooms & teachers",
    desc: "A free classroom resource for lessons and homework — send students straight to the room you're teaching.",
  },
]

export default function Home() {
  return (
    <>
      <Header active="Home" />
      <main>
        <section className="hero">
          <div className="hero-text">
            <span className="eyebrow">FREE · WALKABLE 3D · META QUEST VR</span>
            <h1 className="hero-title">Walk through English grammar</h1>
            <p className="hero-es">Camina por la gramática inglesa</p>
            <p className="hero-lede">
              The Grammar Museum is a free, three-dimensional museum you can walk through right in
              your browser — and step inside with Meta Quest VR. Explore nine color-coded rooms,
              one for each corner of English grammar, at your own pace.
            </p>
            <div className="hero-ctas">
              <a className="btn btn-primary btn-lg" href={MUSEUM_URL}>
                Enter the Museum
                <ArrowRight size={17} />
              </a>
              <Link className="btn btn-secondary btn-lg" href="/how-it-works">
                <Play size={17} />
                Watch how it works
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden>
            <div className="octagon walls" />
            <div className="octagon floor" />
            <div className="skylight">
              <Landmark size={40} />
            </div>
            {DOORS.map((door) => (
              <i
                key={door.color}
                className="door"
                style={{ left: door.x, top: door.y, background: `var(${door.color})` }}
              />
            ))}
          </div>
        </section>

        <section className="band band-surface">
          <div className="band-head">
            <span className="eyebrow" style={{ color: "var(--room-verb-tenses)" }}>
              THE ROOMS · LAS SALAS
            </span>
            <h2 className="section-title">Nine rooms, one museum</h2>
            <p className="section-sub">
              Each room is a color-coded space dedicated to one grammar topic. Walk in, read the
              wall exhibits, and try the interactive examples — no account needed.
            </p>
          </div>
          <div className="grid-3">
            {landingRooms.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
        </section>

        <section className="band band-floor">
          <div className="band-head">
            <span className="eyebrow" style={{ color: "var(--room-modals)" }}>
              HOW IT WORKS · CÓMO FUNCIONA
            </span>
            <h2 className="section-title">Three steps to start exploring</h2>
          </div>
          <div className="grid-3">
            {STEPS.map((step) => (
              <div key={step.num} className="card">
                <div className="step-top">
                  <span className="chip chip-52" style={{ background: `var(${step.color})` }}>
                    <step.Icon size={26} />
                  </span>
                  <span className="step-num">{step.num}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="band band-surface" style={{ gap: 40 }}>
          <div className="band-head">
            <span className="eyebrow" style={{ color: "var(--room-connectors)" }}>
              WHERE IT RUNS · DÓNDE FUNCIONA
            </span>
            <h2 className="section-title">One museum, three ways in</h2>
          </div>
          <div className="grid-3">
            {PLATFORMS.map((platform) => (
              <div key={platform.title} className="platform">
                <span className="chip chip-48" style={{ background: `var(${platform.color})` }}>
                  <platform.Icon size={24} />
                </span>
                <h3>{platform.title}</h3>
                <p>{platform.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="band band-floor">
          <div className="band-head">
            <span className="eyebrow" style={{ color: "var(--room-idioms)" }}>
              WHO IT&apos;S FOR · PARA QUIÉN
            </span>
            <h2 className="section-title">Made for Spanish-speaking learners</h2>
          </div>
          <div className="grid-3">
            {AUDIENCES.map((audience) => (
              <div key={audience.title} className="card">
                <span className="chip chip-52" style={{ background: `var(${audience.color})` }}>
                  <audience.Icon size={26} />
                </span>
                <h3>{audience.title}</h3>
                <p>{audience.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-band">
          <h2>Ready to walk in?</h2>
          <p className="cta-es">
            El museo es gratis y siempre lo será. Entra y empieza a explorar la gramática inglesa.
          </p>
          <a className="btn btn-primary btn-xl" href={MUSEUM_URL}>
            Enter the Museum
            <ArrowRight size={18} />
          </a>
        </section>
      </main>
      <Footer />
    </>
  )
}
