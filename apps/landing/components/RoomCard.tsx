import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { LandingRoom } from "../lib/rooms"

export function RoomCard({ room }: { room: LandingRoom }) {
  const color = `var(${room.color})`
  return (
    <Link href={`/rooms/${room.slug}`} className="room-card">
      <div className="room-card-top" style={{ background: color }}>
        <span className="num-badge">{room.num}</span>
        <room.Icon size={26} />
      </div>
      <div className="room-card-body">
        <div>
          <h3>{room.name}</h3>
          <div className="room-card-es" style={{ color }}>
            {room.nameEs}
          </div>
        </div>
        <p className="room-card-desc">{room.desc}</p>
        <span className="room-card-link" style={{ color }}>
          Explore room
          <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  )
}
