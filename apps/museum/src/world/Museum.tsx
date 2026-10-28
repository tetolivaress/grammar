import { useAppStore } from "../store/useAppStore"
import { Lobby } from "./Lobby"
import { Room } from "./Room"
import { Doorway } from "./Doorway"

/** The whole walkable world: a lobby per floor joined by stairs, plus every themed room with its doorway. */
export function Museum() {
  const roomConfigs = useAppStore((s) => s.roomConfigs)
  return (
    <group>
      <Lobby />
      {roomConfigs.map((config) => (
        <group key={config.slug}>
          <Room config={config} />
          <Doorway config={config} />
        </group>
      ))}
    </group>
  )
}
