import type { Metadata } from "next"
import { ArrowRight, BadgeCheck, Landmark, Mail, UnlockKeyhole, UserX } from "lucide-react"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { landingRooms, MUSEUM_URL } from "../../lib/rooms"

export const metadata: Metadata = {
  title: "About — The Grammar Museum",
}

const OPEN_CARDS = [
  {
    Icon: BadgeCheck, color: "--room-verb-tenses", title: "Completely free",
    desc: "Every room, every exhibit, every device — free today and free tomorrow.",
  },
  {
    Icon: UnlockKeyhole, color: "--room-connectors", title: "Open access",
    desc: "Share the link and anyone can walk straight in, anywhere in the world.",
  },
  {
    Icon: UserX, color: "--room-conditionals", title: "No account needed",
    desc: "No sign-ups, no passwords, no tracking walls between you and the grammar.",
  },
]

export default function AboutPage() {
  return (
    <>
      <Header active="About" />
      <main>
        <section className="page-hero">
          <span className="pill">
            <Landmark size={15} color="var(--room-passive)" />
            About
          </span>
          <h1>About the museum</h1>
          <p className="es" style={{ color: "var(--room-passive)" }}>
            Sobre el museo
          </p>
          <p className="lede">
            The Grammar Museum turns English grammar into a place. Instead of memorizing rules
            from a list, you walk through them — one color-coded room at a time.
          </p>
        </section>

        <section className="band band-surface" style={{ paddingTop: 64, paddingBottom: 64, flexDirection: "row", gap: 56, flexWrap: "wrap" }}>
          <div style={{ width: 380, display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            <span className="kicker" style={{ color: "var(--room-passive)" }}>
              OUR MISSION
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.15 }}>
              Grammar you can walk through
            </h2>
          </div>
          <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ fontSize: 17, lineHeight: 1.6 }}>
              Our goal is to make English grammar spatial and memorable. Abstract rules —
              conditionals, the passive, phrasal verbs — become rooms you can enter, look around,
              and move through at your own pace.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-soft)" }}>
              When a rule has a location, a color, and a shape, it stops being a line in a
              textbook and becomes somewhere you&apos;ve been. That&apos;s what makes it stick.
            </p>
          </div>
        </section>

        <section className="band band-floor" style={{ paddingTop: 64, paddingBottom: 64, gap: 32 }}>
          <div className="band-head" style={{ gap: 8 }}>
            <span className="kicker" style={{ color: "var(--room-connectors)" }}>
              WAYFINDING BY COLOR
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 600 }}>Navigate by color, not a minimap</h2>
            <p className="section-sub" style={{ maxWidth: 780 }}>
              Every grammar topic owns a color. There&apos;s no minimap and no menu to memorize —
              you simply learn that the green room is Conditionals, the terracotta room is the
              Passive, and let color guide you through the space.
            </p>
          </div>
          <div className="card" style={{ padding: 32, gap: 22 }}>
            <span className="micro-label" style={{ fontSize: 12, letterSpacing: 1.5 }}>
              NINE ROOMS · NINE COLORS
            </span>
            <div className="legend">
              {landingRooms.map((room) => (
                <div key={room.slug} className="legend-swatch">
                  <i style={{ background: `var(${room.color})` }} />
                  <span>{room.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="band band-surface" style={{ paddingTop: 64, paddingBottom: 64, gap: 28 }}>
          <div className="band-head" style={{ gap: 6 }}>
            <span className="kicker" style={{ color: "var(--room-verb-tenses)" }}>
              OPEN &amp; FREE
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 600 }}>Free for everyone, always</h2>
          </div>
          <div className="grid-3">
            {OPEN_CARDS.map((card) => (
              <div key={card.title} className="card" style={{ padding: 28 }}>
                <span className="chip chip-52" style={{ background: `var(${card.color})` }}>
                  <card.Icon size={26} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div className="about-cta">
            <span className="kicker" style={{ color: "var(--room-conditionals)" }}>
              GET IN TOUCH
            </span>
            <h2>Ready to step inside?</h2>
            <p>Questions, ideas, or using it with a class? We&apos;d love to hear from you.</p>
            <a className="email-chip" href="mailto:hello@grammarmuseum.org">
              <Mail size={18} color="var(--room-conditionals)" />
              hello@grammarmuseum.org
            </a>
            <a className="btn btn-primary btn-xl" style={{ borderRadius: 14 }} href={MUSEUM_URL}>
              Enter the Museum
              <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
