import Link from "next/link"
import { ArrowRight, Landmark } from "lucide-react"
import { MUSEUM_URL } from "../lib/rooms"

const NAV = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "VR", href: "/how-it-works#vr" },
  { label: "About", href: "/about" },
]

export function Header({ active }: { active?: string }) {
  return (
    <header className="header">
      <Link href="/" className="logo">
        <span className="logo-mark">
          <Landmark size={19} />
        </span>
        <span className="logo-text">The Grammar Museum</span>
      </Link>
      <nav className="nav">
        {NAV.map((item) => (
          <Link key={item.label} href={item.href} className={active === item.label ? "active" : ""}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <div className="lang-switch" title="Español próximamente">
          <span className="on">EN</span>
          <span>ES</span>
        </div>
        <a className="btn btn-primary" href={MUSEUM_URL}>
          Enter the Museum
          <ArrowRight size={16} />
        </a>
      </div>
    </header>
  )
}
