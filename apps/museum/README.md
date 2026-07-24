# The Grammar Museum · El Museo de la Gramática

A walkable 3D English-learning space built with react-three-fiber. A central
10-sided lobby connects 10 themed rooms, each teaching a grammar topic through
read-only wall exhibits. Aimed at Spanish-speaking English learners (A2–B2).

## Rooms

| Room | Accent | Layout |
|---|---|---|
| Verb Tenses | amber | 24 m timeline corridor (PAST → PRESENT → FUTURE) |
| Conditionals | teal | 12×12 room |
| Passive Voice | terracotta | 12×12 room, living-room themed |
| Relative Clauses | violet | 12×12 room |
| Modal Verbs Hall | steel blue | 12×12 room |
| Reported Speech | magenta | 12×12 room |
| Connectors | orange | 12×12 room |
| Gerunds & Infinitives | sage | 12×12 room |
| Phrasal Verbs | green | 12×12 room |
| Idioms | brick red | 12×12 room |

All exhibit content lives in `src/config/rooms.config.ts`; the world is
generated procedurally from it (`src/world/`). Wayfinding is color: each
room's accent appears on its doorway frame, overhead sign, floor trim, and
panel headers.

## Controls

- **Desktop** — click Explore (pointer lock): WASD move, mouse look, Shift run, Esc menu.
- **Mobile** — left thumb: dynamic joystick (move, push hard to run); right thumb: drag to look.
- **Meta Quest (WebXR)** — Enter VR: left thumbstick walks (head-relative, press stick to run), right thumbstick snap-turns 45°, with full wall collision. Hand tracking (e.g. dead controller batteries) falls back to point-and-pinch teleport on floors.

On localhost you can test XR without a headset via the built-in emulator
(Cmd/Win + Option/Alt + E).

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # production build in dist/
```

WebXR requires HTTPS — deploy (e.g. `vercel deploy`) or tunnel to test on a
real Quest headset.

## Stack

Vite · React · TypeScript · @react-three/fiber · drei · @react-three/xr v6 ·
@react-three/rapier · zustand · nipplejs. Text is troika (drei `<Text>`) with
two local Inter font files — no `<Html>` anywhere, so every panel renders in VR.
