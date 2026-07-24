# The Grammar Museum — Development Spec

A walkable 3D English-learning space built with react-three-fiber. One central lobby connects 9 themed rooms, each teaching a grammar topic through read-only wall exhibits. Works on desktop (WASD + mouse, game-style) and on Meta Quest via WebXR (teleport locomotion).

**Target user:** Spanish-speaking English learners (A2–B2). All exhibit content is in English; room signage may include a small Spanish subtitle.

---

## 1. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Build tool | Vite + React 18 + TypeScript | No SSR needed; fastest iteration |
| 3D | `@react-three/fiber`, `@react-three/drei` | drei for `Text`, `RoundedBox`, `Float`, `Sky` |
| VR | `@react-three/xr` v6 | `createXRStore()`, teleport locomotion |
| Physics | `@react-three/rapier` | Fixed capsule collider for player, trimesh/cuboid for walls |
| State | `zustand` | Current room, control mode, settings |
| Text in 3D | drei `<Text>` (troika) | **Never use drei `<Html>` — it does not render in VR** |
| Deploy | Vercel | HTTPS out of the box (required for WebXR) |

Install:

```bash
pnpm create vite grammar-museum --template react-ts
pnpm add three @react-three/fiber @react-three/drei @react-three/xr @react-three/rapier zustand
pnpm add -D @types/three
```

---

## 2. File structure

```
src/
  main.tsx
  App.tsx                    # Canvas, XR store, entry overlay
  store/
    useAppStore.ts           # zustand: mode, currentRoomId, settings
  config/
    rooms.config.ts          # ALL content lives here (section 5)
    theme.ts                 # palette, fonts, sizes
  world/
    Museum.tsx               # lobby + rooms from config
    Lobby.tsx                # central hub, signage, doors
    Room.tsx                 # procedural room generator
    WallPanel.tsx            # exhibit panel (title / rule / examples)
    Doorway.tsx              # opening in wall + overhead sign
    Props.tsx                # low-poly decorations (plants, benches, lamps)
    Lighting.tsx             # ambient + directional, no shadows in XR
  controls/
    usePlayerRig.ts          # rapier capsule + setLinvel, input-agnostic
    DesktopControls.tsx      # PointerLock + WASD → feeds rig
    TouchControls.tsx        # virtual joystick + drag-look → feeds rig
    VRLocomotion.tsx         # teleport targets + snap turn
  ui/
    EntryOverlay.tsx         # DOM: title, "Play (desktop)" / "Enter VR"
    Crosshair.tsx            # DOM: desktop only
  hooks/
    useIsPresenting.ts       # XR session state
```

---

## 3. World layout

Radial plan: an octagonal lobby (16 m across) with 9 doorways. Rooms are rectangular boxes attached to the lobby's faces. Verb Tenses is a long corridor (timeline), everything else is a 12×12 m room, 4 m ceilings.

```
                [Tenses corridor →→→ 24m]
                        |
   [Idioms]         [LOBBY]          [Conditionals]
        \\          8 doors           /
   [Phrasals]    (octagon 16m)    [Passive - living room]
        /                            \\
   [Gerunds]  [Connectors]  [Relatives]  [Modals hall]
```

Exact positions are defined in `rooms.config.ts` (`position` + `rotationY` per room). The generator must derive doorway placement from the room's facing so all rooms open toward the lobby.

**Wayfinding is color.** Each room has a signature accent color used on: its doorway frame, its overhead sign, its floor trim, and its panels' header bars. A learner can say "the green room is conditionals." This replaces a minimap in V1.

---

## 4. Visual design

Low-poly stylized. Flat colors, `meshStandardMaterial` with `flatShading`, no textures in V1 (color + geometry only — great for Quest).

**Palette (`theme.ts`):**

```ts
export const theme = {
  floor:   "#e8e2d4",  // warm bone
  walls:   "#f5f1e8",  // off-white
  ceiling: "#ffffff",
  panelBg: "#fffdf7",
  ink:     "#1f2430",  // near-black text
  accents: {
    conditionals: "#2a9d8f",  // teal
    passive:      "#e76f51",  // terracotta
    modals:       "#457b9d",  // steel blue
    tenses:       "#e9c46a",  // amber
    relatives:    "#8e7dbe",  // violet
    connectors:   "#f4a261",  // orange
    phrasals:     "#6a994e",  // green
    idioms:       "#bc4b51",  // brick red
    gerunds:      "#5f7470",  // sage
  },
}
```

**Type:** load one font file for troika Text — `Inter-SemiBold.woff` for titles, `Inter-Regular.woff` for body (put in `/public/fonts/`). Keep it to two files; each font is a texture atlas at runtime.

**Lighting:** `<ambientLight intensity={0.7} />` + one `<directionalLight intensity={0.8} position={[5, 10, 3]} />`. Shadows OFF in XR; on desktop, drei `<ContactShadows>` under props only.

**Atmosphere:** `<Sky />` visible through lobby skylight (an opening in the octagon ceiling), light fog `<fog attach="fog" args={["#f5f1e8", 25, 60]} />` to soften long sightlines.

**Props per room (from `Props.tsx`, all primitives):** 2 low-poly plants (cones + cylinder pot), 1 bench (boxes), 1 floor lamp (cylinder + sphere, emissive). The Passive Voice room is themed as a living room: add a sofa (boxes), rug (flat cylinder), TV panel. Keep total scene draw calls under ~120.

---

## 5. Content — `rooms.config.ts`

Types:

```ts
export type Wall = "north" | "east" | "south" | "west"

export interface Panel {
  wall: Wall
  slot: 0 | 1 | 2        // up to 3 panels per wall
  title: string
  subtitle?: string       // formula / rule line
  body: string[]          // example sentences or items
  footnote?: string       // tip / warning
}

export interface RoomConfig {
  id: string
  name: string
  nameEs: string           // Spanish subtitle for doorway sign
  accent: string           // theme.accents key
  size: [number, number, number]   // w, h, d in meters
  position: [number, number, number]
  rotationY: number
  kind: "room" | "corridor"
  panels: Panel[]
}
```

Full content below. **Claude Code: transcribe this content verbatim into the config.**

### 5.1 Conditionals (teal)

| Panel | Rule | Examples |
|---|---|---|
| **Zero Conditional** — facts & general truths | If + present simple, present simple | If you heat water to 100°C, it boils. / If it rains, the ground gets wet. / Plants die if they don't get water. |
| **First Conditional** — real future possibility | If + present simple, will + verb | If it rains tomorrow, I will stay home. / If you study, you will pass the exam. / I'll call you if I finish early. |
| **Second Conditional** — unreal present / hypothetical | If + past simple, would + verb | If I had a million dollars, I would travel the world. / If I were you, I would apologize. / She would be happier if she lived near the beach. |
| **Third Conditional** — unreal past / regret | If + past perfect, would have + past participle | If I had studied, I would have passed. / If you had told me, I would have helped you. / They wouldn't have missed the flight if they had left earlier. |
| **Mixed Conditionals** — past cause → present result | If + past perfect, would + verb | If I had saved money, I would be rich now. / If she hadn't missed the bus, she would be here. |
| Footnote panel | — | Tip: "If I **were** you..." — use *were* for all persons in the second conditional. |

### 5.2 Passive Voice — living room (terracotta)

| Panel | Rule | Examples |
|---|---|---|
| **What is the passive?** | Object becomes subject: be + past participle | Active: Shakespeare wrote Hamlet. → Passive: Hamlet was written by Shakespeare. |
| **Present passive** | am / is / are + past participle | English is spoken here. / These phones are made in Vietnam. / The house is being painted right now. |
| **Past passive** | was / were + past participle | The pyramids were built thousands of years ago. / My bike was stolen last night. / The road was being repaired when we arrived. |
| **Perfect passive** | have / has / had been + past participle | The report has been finished. / The tickets had been sold before we arrived. |
| **Modal passive** | modal + be + past participle | This form must be signed. / The problem can be solved. / Rules should be followed. |
| Footnote panel | — | Use the passive when the doer is unknown, obvious, or unimportant. Use "by + agent" only when the doer matters. |

### 5.3 Modal Verbs Hall (steel blue)

| Panel | Meaning | Examples |
|---|---|---|
| **Can / Could** | ability, permission, possibility | She can swim very well. / Could you open the window? / I could read when I was four. |
| **May / Might** | possibility, formal permission | It may rain later. / She might not come to the party. / May I come in? |
| **Must / Have to** | obligation, strong deduction | You must wear a seatbelt. / I have to work on Saturday. / He must be tired — he ran a marathon. |
| **Mustn't vs. Don't have to** | prohibition vs. no obligation | You mustn't smoke here (prohibited). / You don't have to pay (it's free — not necessary). |
| **Should / Ought to** | advice, expectation | You should see a doctor. / We ought to leave now. / The bus should arrive at 9. |
| **Would / Will** | requests, habits, willingness | Would you help me, please? / When I was a kid, I would play outside all day. / I'll carry that for you. |
| **Modals of deduction** | must / might / can't + be | She must be at home — the lights are on. / He can't be the thief — he was with me. / They might be lost. |

### 5.4 Verb Tenses — timeline corridor (amber)

A 24 m corridor. Panels are placed **chronologically along both walls**: past tenses near the entrance, present in the middle, future at the far end. A colored floor stripe runs the length with three floor labels: PAST → PRESENT → FUTURE.

| Position | Tense | Formula | Example |
|---|---|---|---|
| Past zone | Past Simple | verb + -ed / irregular | I visited Caracas last year. |
| Past zone | Past Continuous | was/were + -ing | I was cooking when you called. |
| Past zone | Past Perfect | had + past participle | The train had left when we arrived. |
| Past zone | Past Perfect Continuous | had been + -ing | She had been waiting for two hours. |
| Present zone | Present Simple | verb / verb + s | Water boils at 100°C. I work from home. |
| Present zone | Present Continuous | am/is/are + -ing | I am learning English right now. |
| Present zone | Present Perfect | have/has + past participle | I have visited Mérida three times. |
| Present zone | Present Perfect Continuous | have/has been + -ing | It has been raining all day. |
| Future zone | Future Simple | will + verb | I will call you tomorrow. |
| Future zone | Going to | am/is/are going to + verb | We are going to move next month. |
| Future zone | Future Continuous | will be + -ing | This time tomorrow, I'll be flying to Madrid. |
| Future zone | Future Perfect | will have + past participle | By 2030, I will have finished my degree. |

### 5.5 Relative Clauses (violet)

| Panel | Rule | Examples |
|---|---|---|
| **Who / Which / That** | who = people, which = things, that = both (defining) | The woman who lives next door is a doctor. / The book which you lent me is great. / The car that broke down was old. |
| **Whose / Where / When** | possession, place, time | That's the man whose dog bit me. / This is the town where I grew up. / I remember the day when we met. |
| **Defining clauses** | essential info — no commas | Students who study hard get good grades. (only those students) |
| **Non-defining clauses** | extra info — with commas, never *that* | My brother, who lives in Madrid, is visiting. / Caracas, which is the capital, sits in a valley. |
| **Omitting the pronoun** | drop who/which/that when it's the object | The movie (that) we watched was boring. / The person (who) you met is my boss. |

### 5.6 Connectors (orange)

| Panel | Function | Items with examples |
|---|---|---|
| **Addition** | and, also, in addition, moreover, furthermore | She speaks English. Moreover, she is fluent in French. |
| **Contrast** | but, however, although, even though, despite, whereas | Although it was raining, we went out. / Despite the traffic, we arrived on time. |
| **Cause & Effect** | because, since, so, therefore, as a result | He was late because of the traffic. / It rained heavily; therefore, the match was cancelled. |
| **Purpose** | to, in order to, so that | I study every day in order to improve. / She spoke slowly so that everyone could understand. |
| **Sequence** | first, then, next, after that, finally, meanwhile | First, mix the ingredients. Then bake for 30 minutes. Finally, let it cool. |
| **Condition & Concession** | unless, as long as, in case, nevertheless | You'll miss the bus unless you hurry. / Take an umbrella in case it rains. |

### 5.7 Phrasal Verbs (green)

Organized by base verb — one panel per verb family.

| Panel | Items |
|---|---|
| **GET** | get up (rise from bed) — I get up at 6. / get along (have a good relationship) — We get along well. / get over (recover) — She got over the flu. / get away with (escape punishment) — He got away with cheating. |
| **TAKE** | take off (plane departs; remove) — The plane took off late. / take up (start a hobby) — I took up yoga. / take after (resemble family) — She takes after her mother. / take care of (look after) — I take care of my plants. |
| **PUT** | put on (wear) — Put on your jacket. / put off (postpone) — They put off the meeting. / put up with (tolerate) — I can't put up with this noise. |
| **LOOK** | look for (search) — I'm looking for my keys. / look after (care for) — She looks after her brother. / look forward to (anticipate) — I look forward to seeing you. / look up (search info) — Look it up in the dictionary. |
| **GIVE / GO** | give up (quit) — He gave up smoking. / give back (return) — Give me back my pen. / go on (continue) — The show must go on. / go out (socialize) — We go out on Fridays. |
| **TURN / RUN** | turn on / turn off — Turn off the lights. / turn down (reject; lower) — She turned down the job. / run out of (have none left) — We ran out of milk. / run into (meet by chance) — I ran into an old friend. |

### 5.8 Idioms (brick red)

| Panel | Items (idiom — meaning — example) |
|---|---|
| **Everyday life** | piece of cake — very easy — The test was a piece of cake. / hit the sack — go to bed — I'm exhausted; time to hit the sack. / under the weather — slightly sick — I'm feeling under the weather today. |
| **Money & work** | cost an arm and a leg — very expensive — That car costs an arm and a leg. / call it a day — stop working — Let's call it a day. / cut corners — do something cheaply/badly — Don't cut corners on safety. |
| **Communication** | break the ice — start a conversation — He told a joke to break the ice. / spill the beans — reveal a secret — Who spilled the beans about the party? / get the wrong end of the stick — misunderstand — You got the wrong end of the stick. |
| **Effort & luck** | break a leg — good luck! — Break a leg at your audition! / once in a blue moon — very rarely — We eat out once in a blue moon. / the ball is in your court — it's your decision — I made my offer; the ball is in your court. |
| **Feelings** | over the moon — very happy — She was over the moon about the news. / cold feet — sudden nervousness — He got cold feet before the wedding. / on cloud nine — extremely happy — I've been on cloud nine since I got the job. |

### 5.9 Gerunds & Infinitives (sage)

| Panel | Rule | Examples |
|---|---|---|
| **Verb + gerund** | enjoy, avoid, finish, mind, suggest, keep, practice + -ing | I enjoy swimming. / He avoided answering. / She keeps making the same mistake. / Do you mind waiting? |
| **Verb + infinitive** | want, decide, hope, plan, agree, promise, refuse + to | I want to learn English. / They decided to move. / She promised to call. / He refused to help. |
| **Both, same meaning** | begin, start, continue, like, love, hate | It started to rain. = It started raining. / I love to cook. = I love cooking. |
| **Both, DIFFERENT meaning** | remember, stop, try, forget | I stopped smoking (quit) vs. I stopped to smoke (paused in order to smoke). / Remember to lock the door (future duty) vs. I remember locking the door (past memory). |
| **After prepositions → gerund** | preposition + -ing, always | She's good at drawing. / I'm interested in learning. / Thanks for coming. / He left without saying goodbye. |
| **Gerund as subject** | -ing form starts the sentence | Swimming is great exercise. / Learning a language takes time. |

---

## 6. Core components

### 6.1 `Room.tsx` — procedural generator

Given a `RoomConfig`, builds: floor plane, 4 walls (boxes) with a doorway gap on the lobby-facing wall, ceiling, floor trim strip in the accent color, and positions `<WallPanel>`s from `panels[]`. Corridors (`kind: "corridor"`) get doorways at both ends and panels distributed lengthwise by `slot` index. Wall segments around doorways = 3 boxes (left, right, lintel). All wall boxes get `<RigidBody type="fixed" colliders="cuboid">`.

Panel placement math: for a 12 m wall with 3 slots, panel centers at x = −3.5, 0, +3.5, at y = 1.9 (eye height 1.6 in VR), offset 0.06 m off the wall surface to prevent z-fighting.

### 6.2 `WallPanel.tsx`

```
┌────────────────────────┐
│ ▎TITLE          (accent bar, 0.12m)
│  subtitle / formula     (accent color, italic feel)
│                         
│  • example one          (ink, maxWidth wraps)
│  • example two          
│                         
│  footnote               (smaller, 60% opacity)
└────────────────────────┘
```

- `RoundedBox args={[3, 2.2, 0.05]}`, `panelBg` material.
- All text via drei `<Text>`: title `fontSize 0.2`, subtitle `0.13`, body `0.115` with `maxWidth={2.6}` and `lineHeight={1.45}`, footnote `0.09`.
- `renderOrder` + `depthOffset` if flicker appears on Quest.
- Memoize panels (`React.memo`) — text geometry is the most expensive thing in the scene.

### 6.3 `usePlayerRig.ts` + `DesktopControls.tsx`

**`usePlayerRig.ts`** — shared, input-agnostic player body used by desktop AND touch:
- Rapier capsule collider (radius 0.3, half-height 0.6), camera parented at 1.6 m.
- Exposes `move(inputVec: {x, y}, run: boolean)`: reads camera direction, flattens Y, `setLinvel` each frame. Walk 3.5 m/s, run 6.
- Exposes `look(deltaYaw, deltaPitch)`: rotates camera, pitch clamped to ±85°.

**`DesktopControls.tsx`** — feeds the rig:
- drei `PointerLockControls` for look; WASD + Shift (run) via `useKeyboardControls` from drei.
- Disable entirely when `useXR` reports a presenting session.
- Esc releases pointer; entry overlay handles re-lock.

### 6.4 `VRLocomotion.tsx`

- `@react-three/xr` v6 (v6.6+). Enable teleport rays in the store config:

```tsx
const store = createXRStore({
  hand: { teleportPointer: true },
  controller: { teleportPointer: true },
})
```

- Player position lives in the zustand store; drive the rig with `<XROrigin position={position} />`.
- Wrap every **floor mesh** (each room's floor + lobby floor) in `<TeleportTarget onTeleport={setPosition}>`. Walls are NOT teleport targets.
- Snap turn 45° on right thumbstick (read via `useXRInputSourceState`).
- No smooth locomotion in V1 (comfort). Add as an opt-in setting in V2.
- Player rig starts in lobby center facing the Tenses corridor.
- **Dev tip:** v6 ships an integrated emulator (IWER) — on localhost press **Cmd/Win + Option/Alt + E** to test controllers and teleport without a headset. Test on real Quest hardware before calling phase 5 done anyway.

### 6.5 `EntryOverlay.tsx` (DOM, not 3D)

Full-screen overlay on load with mode detection:

```ts
const hasVR = !!navigator.xr && await navigator.xr.isSessionSupported("immersive-vr")
const isTouch = "ontouchstart" in window && !hasVR   // Quest Browser is touch too — VR wins
```

- Desktop: **Explore** button → locks pointer. Shows `WASD move · Mouse look · Shift run · Esc menu`.
- Touch: **Explore** button → mounts `TouchControls`. Shows `Left side: move · Right side: look`.
- VR available: additionally show **Enter VR** → `store.enterVR()`.

### 6.6 `TouchControls.tsx` (mobile)

Dual-zone touch, the standard mobile-FPS pattern. Feeds the same `usePlayerRig` — no separate physics.

- **Left half = virtual joystick (movement).** Use `nipplejs` (`pnpm add nipplejs`) in dynamic mode: the stick appears where the thumb lands. Map the joystick vector (angle + force) to `rig.move({x, y})`; force > 0.85 = run.
- **Right half = drag to look.** Track `touchmove` deltas on a full-height right-side div; call `rig.look(dx * 0.004, dy * 0.004)`. Do NOT use PointerLockControls — it doesn't exist on touch.
- Track touches by `identifier` so moving and looking work simultaneously (two thumbs).
- DOM zones sit above the canvas with `touch-action: none` to kill browser scroll/zoom gestures; also set `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">`.
- Joystick base: semi-transparent circle, accent-colored thumb, 120 px diameter, bottom-left safe-area aware (`env(safe-area-inset-*)` for iPhone notch).
- V2 options (not now): gyro look via `deviceorientation` (iOS needs `DeviceOrientationEvent.requestPermission()` behind a tap), and tap-floor-to-walk for casual users.

---

## 7. Performance budget (Quest 2 baseline)

- ≤ 120 draw calls, ≤ 150k triangles total.
- One material instance per color (share via `useMemo`/constants) so meshes batch.
- Two font atlases max. No `<Html>`, no post-processing, no shadow maps in XR.
- `frameloop="demand"` is NOT usable (continuous movement) — keep `always` but keep the scene cheap.
- Test on device early: `pnpm build && vercel deploy` (or `vite --host` + a tunneling tool) and open in Quest Browser. WebXR requires HTTPS.

---

## 8. Build phases

1. **Skeleton** — Vite project, Canvas, one hardcoded room, desktop controls with collision. *Done when: you can walk around a box room without passing through walls.*
2. **Generator + content** — `Room.tsx`, `WallPanel.tsx`, full `rooms.config.ts` with all 9 topics from section 5. *Done when: every panel is readable at 2 m distance.*
3. **Lobby + wayfinding** — octagon hub, doorways with color-coded signs (English + Spanish subtitle), fog, sky. *Done when: you can walk lobby → any room → back.*
4. **Touch controls** — `TouchControls.tsx` + mode detection in the overlay. *Done when: full walkthrough on a phone with two-thumb move + look, no page scroll/zoom.*
5. **XR layer** — XR store, teleport, snap turn, Enter VR button. *Done when: full walkthrough on a Quest headset at stable 72 fps.*
6. **Polish** — props, lamp emissives, ContactShadows (desktop only), font tuning, favicon/title.

## 9. Acceptance criteria

- [ ] All 9 rooms reachable from the lobby; every doorway sign shows name + Spanish subtitle + accent color.
- [ ] All panels from section 5 present, verbatim, readable in both modes.
- [ ] Desktop: pointer lock, WASD, run, collision on every wall.
- [ ] Mobile: left-thumb joystick + right-thumb look working simultaneously; browser gestures (scroll, pinch-zoom, pull-to-refresh) fully suppressed; joystick clears the iPhone safe area.
- [ ] Quest: enter VR from overlay, teleport on floors only, 45° snap turn, no `<Html>` anywhere.
- [ ] 72 fps on Quest 2 in the lobby (worst case: most rooms visible).
- [ ] Deployed on Vercel over HTTPS.

## 10. V2 ideas (out of scope now)

Audio narration per panel (Web Speech API or pre-recorded), quiz pedestals per room, progress tracking (visited panels), smooth locomotion toggle, hand tracking, a 10th room for reported speech.
