# How This Works

A guide to the museum app for future-me who forgot how three.js and react-three-fiber work.

## The mental model: React, but for 3D

**three.js** is the low-level 3D library. Everything on screen lives in a *scene graph* — a tree of objects. A `mesh` (a visible thing) = a *geometry* (the shape, e.g. `boxGeometry`) + a *material* (the surface, color/shininess). A `group` is an invisible folder that lets you position/rotate its children together. A camera looks at the scene, and a render loop redraws it ~60 times per second.

**react-three-fiber (R3F)** lets you build that scene graph with JSX instead of imperative code. Inside a `<Canvas>`, lowercase tags like `<mesh>`, `<group>`, `<boxGeometry>` aren't HTML — R3F translates each one into the matching three.js object. So this, from `Room.tsx`:

```jsx
<mesh position={[0, h / 2, hd]} material={mat(theme.walls)}>
  <boxGeometry args={[w, h, T]} />
</mesh>
```

means "create a box of width `w`, height `h`, depth `T`, at this position, painted like a wall." React handles creating/removing objects when props or state change, exactly like it does with DOM elements.

The other key R3F concept is **`useFrame(callback)`**: the callback runs once per rendered frame (~60×/sec). That's where anything continuous happens — movement, reading input. You'll see it in `PlayerRig.tsx` and `DesktopControls.tsx`.

On top of that the app uses three helper libraries:

- **@react-three/drei** — grab-bag of ready-made components (`<Text>`, `<Sky>`, `<PointerLockControls>`, `<KeyboardControls>`).
- **@react-three/rapier** — physics engine. Wrap meshes in `<RigidBody>` and they get collision. `type="fixed"` = immovable (walls); `type="dynamic"` = affected by forces (the player).
- **@react-three/xr** — VR headset support.

## What this app is

A walkable 3D grammar museum: a polygonal lobby with up to 10 themed rooms arranged radially around it, each room containing wall panels with grammar content. Works on desktop (WASD + mouse), touch (virtual joystick), and VR.

## How it fits together, top down

**`src/App.tsx`** is the root. It does two things:

1. Loads room content from the CMS API via `useRoomContent()` (`src/hooks/useRoomContent.ts`) — a TanStack Query hook over the one request this app makes (`src/services/rooms.service.ts`). The hook pushes the result into the zustand store; if the API is down it retries once and the store silently keeps the curriculum bundled in the `@grammar-museum/shared` package. It's set to `staleTime: Infinity` with focus-refetching off *on purpose*: a background refetch would rebuild the walls around you mid-walk, so content loads once per visit.
2. Renders the `<Canvas>` (the 3D world) plus regular HTML UI on top of it (`EntryOverlay`, `Crosshair`, `HudHints`, `TouchControls` — those are normal DOM, *outside* the Canvas).

Inside the Canvas: fog + `<Sky>`, lighting, then `<Physics>` wrapping everything that needs collision — a giant ground collider, the `<Museum>`, and the player controls.

**State** lives in a small zustand store (`src/store/useAppStore.ts`). The important field is `roomConfigs`: it starts as the bundled default and gets replaced when the CMS responds. It also tracks whether the entry overlay is showing (which pauses movement) and the input mode.

**Layout math** is in `src/config/rooms.config.ts`. `buildRoomConfigs` takes the CMS room list and computes where each room sits: rooms are spaced evenly in a circle (`360/N` degrees apart), each rotated to face the lobby, alternating between a near ring and a far ring so 12 m-wide rooms don't overlap (the big comment at the top of that file explains the geometry). So the world layout is *derived* — add a room in the CMS and the museum rebuilds itself.

**`src/world/Museum.tsx`** just maps over `roomConfigs`: one `<Lobby>` plus a `<Room>` + `<Doorway>` per config.

**`src/world/Room.tsx`** is a procedural room generator. Given a config (size, position, rotation, panels), it builds:

- Walls, ceiling, and a doorway (the lobby-facing wall is split into left piece + right piece + lintel to leave a door hole) — all inside a `<RigidBody type="fixed">` so you can't walk through them.
- A floor that's also a VR `<TeleportTarget>`.
- The wall panels: `panelTransform` converts a config like `{wall: "north", slot: 1}` into an actual position/rotation on that wall.

**`src/world/WallPanel.tsx`** renders one exhibit: a rounded backing box, an accent bar, and drei `<Text>` for title/subtitle/bullets (troika text — expensive, hence the `memo`).

## How movement works

This is the most "3D-specific" part:

1. **Input is decoupled from physics** via a plain shared object, `rigInput` in `src/controls/usePlayerRig.ts` — `{move: {x, y}, run, lookDX, lookDY}`. It's deliberately *not* React state, because it changes 60×/sec and you don't want re-renders.
2. **Writers:** `src/controls/DesktopControls.tsx` reads WASD each frame via drei's `useKeyboardControls` and writes into `rigInput`; mouse look is handled by drei's `<PointerLockControls>` (clicking "Explore" locks the pointer, Esc brings the overlay back). `TouchControls` (nipplejs joystick) writes the same fields.
3. **Reader:** `src/controls/PlayerRig.tsx` is the player's physical body — an invisible capsule inside a `<RigidBody type="dynamic">`. Its `useFrame` runs every frame: take the camera's facing direction, flatten it to the ground plane, combine with `rigInput.move` into a velocity, and push the capsule with `setLinvel`. Rapier then handles collisions — walls stop you, gravity keeps you grounded. Finally the camera is snapped to the capsule's position + 0.7 m, putting your eyes at 1.6 m.

So: input devices write intent → physics capsule moves and collides → camera follows the capsule. In VR, this whole rig is swapped out for `VRLocomotion` (thumbstick/teleport) — that's the `ScreenControls` check in `App.tsx`.

## Running it

```sh
pnpm dev   # in apps/museum (Vite)
```

The API being down is fine — you'll get the bundled content.
