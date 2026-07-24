import Link from "next/link"
import { Landmark } from "lucide-react"
import { landingRooms } from "../lib/rooms"

const NAV = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "VR", href: "/how-it-works#vr" },
  { label: "About", href: "/about" },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="logo">
            <span className="logo-mark" style={{ width: 30, height: 30, borderRadius: 8 }}>
              <Landmark size={18} />
            </span>
            <span className="logo-text">The Grammar Museum</span>
          </div>
          <p>
            A free, walkable 3D museum where you learn English grammar by exploring color-coded
            rooms — in your browser and in VR.
          </p>
        </div>
        <div className="footer-col">
          <h4>EXPLORE</h4>
          {NAV.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="footer-col">
          <h4>ROOMS</h4>
          {landingRooms.map((room) => (
            <Link key={room.slug} href={`/rooms/${room.slug}`} className="footer-room">
              <i style={{ background: `var(${room.color})` }} />
              {room.name}
            </Link>
          ))}
        </div>
        <div className="footer-col">
          <h4>LANGUAGE</h4>
          <div className="lang-switch dark" title="Español próximamente">
            <span className="on">EN</span>
            <span>ES</span>
          </div>
        </div>
      </div>
      <div className="footer-divider" />
      <div className="footer-bottom">
        <span>© 2026 The Grammar Museum · Free &amp; open access</span>
        <span>Built with React Three Fiber · WebXR</span>
      </div>
    </footer>
  )
}
