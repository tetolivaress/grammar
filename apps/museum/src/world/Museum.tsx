import { useAppStore } from "../store/useAppStore"
import { Lobby } from "./Lobby"
import { Room } from "./Room"
import { Doorway } from "./Doorway"

/** The whole walkable world: hub + up to 10 themed rooms with doorways. */
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
