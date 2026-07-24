import type { Metadata } from "next"
import { ChevronDown, Compass, Glasses, Globe, Lock, Monitor, Smartphone, Zap } from "lucide-react"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"

export const metadata: Metadata = {
  title: "How It Works · VR — The Grammar Museum",
}

const CONTROL_CARDS = [
  {
    Icon: Monitor, color: "--room-modals", title: "Desktop",
    desc: "WASD to move, mouse to look around, click to interact.",
  },
  {
    Icon: Smartphone, color: "--room-passive", title: "Touch",
    desc: "Virtual on-screen joystick to move, drag to look around.",
  },
  {
    Icon: Glasses, color: "--room-relative", title: "Meta Quest VR",
    desc: "Teleport to move, snap turn to rotate, point to read panels.",
  },
]

const REQUIREMENTS = [
  {
    Icon: Globe, color: "--room-modals", title: "Modern browser",
    desc: "Works in Chrome, Edge and Safari — keep it up to date.",
  },
  {
    Icon: Lock, color: "--room-connectors", title: "Served over HTTPS",
    desc: "A secure connection is all it takes to run.",
  },
  {
    Icon: Zap, color: "--room-verb-tenses", title: "No install, no download",
    desc: "Instant in the browser — nothing to set up.",
  },
]

const FAQS = [
  {
    q: "Is it free?",
    a: "Yes, completely free and open to everyone.",
    open: true,
  },
  {
    q: "Do I need a VR headset?",
    a: "No — the museum works fully on desktop and mobile. A Meta Quest headset simply adds the option of walking the rooms in immersive VR.",
  },
  {
    q: "Do I need to install anything?",
    a: "Nothing. The museum runs directly in your browser, including on the Quest's built-in browser.",
  },
  {
    q: "Is it good for classrooms?",
    a: "Yes — teachers use it for lessons and homework. Send students the link to the room you're teaching and they can walk it on any device.",
  },
  {
    q: "What English level is it for?",
    a: "The exhibits are written for A2–B2 learners, with Spanish subtitles on every room sign to help you find your way.",
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <Header active="How It Works" />
      <main>
        <section className="page-hero">
          <span className="pill">
            <Compass size={15} color="var(--room-modals)" />
            How It Works · VR
          </span>
          <h1>How it works</h1>
          <p className="es" style={{ color: "var(--room-modals)" }}>
            Cómo funciona
          </p>
          <p className="lede">
            Walk through rooms of English grammar right in your browser — or step inside in full
            VR. No account, no download. Here&apos;s how to move, look, and interact.
          </p>
        </section>

        <section id="vr" className="band band-surface" style={{ paddingTop: 64, paddingBottom: 64, gap: 28 }}>
          <div className="band-head" style={{ gap: 6 }}>
            <span className="kicker" style={{ color: "var(--room-modals)" }}>
              CONTROLS
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 600 }}>Move, look, interact</h2>
            <p className="section-sub" style={{ fontSize: 16, maxWidth: 620 }}>
              The same museum adapts to whatever you&apos;re on — keyboard, touch, or a headset.
            </p>
          </div>
          <div className="grid-3">
            {CONTROL_CARDS.map((card) => (
              <div key={card.title} className="card" style={{ padding: 28 }}>
                <span
                  className="chip chip-52"
                  style={{ width: 54, height: 54, background: `var(${card.color})` }}
                >
                  <card.Icon size={26} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="band band-floor" style={{ paddingTop: 64, paddingBottom: 64, gap: 28 }}>
          <div className="band-head" style={{ gap: 6 }}>
            <span className="kicker" style={{ color: "var(--room-connectors)" }}>
              REQUIREMENTS
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 600 }}>What you need</h2>
          </div>
          <div className="req-card">
            {REQUIREMENTS.map((req, i) => (
              <>
                {i > 0 && <div key={`div-${i}`} className="req-divider" />}
                <div key={req.title} className="req-col">
                  <span className="chip-soft" style={{ background: `color-mix(in srgb, var(${req.color}) 13%, transparent)` }}>
                    <req.Icon size={22} color={`var(${req.color})`} />
                  </span>
                  <h3>{req.title}</h3>
                  <p>{req.desc}</p>
                </div>
              </>
            ))}
          </div>
        </section>

        <section className="band band-surface" style={{ paddingTop: 64, paddingBottom: 80, gap: 28, alignItems: "center" }}>
          <div className="band-head" style={{ gap: 6, width: "min(100%, 920px)" }}>
            <span className="kicker" style={{ color: "var(--room-gerunds)" }}>
              FAQ
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 600 }}>Frequently asked questions</h2>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "var(--room-gerunds)" }}>
              Preguntas frecuentes
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "min(100%, 920px)" }}>
            {FAQS.map((faq) => (
              <details key={faq.q} className="faq" open={faq.open}>
                <summary>
                  {faq.q}
                  <ChevronDown size={22} />
                </summary>
                <div className="faq-answer">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
