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

Radial plan: an N-sided lobby (16 m across) with one doorway per room. Rooms are rectangular boxes attached to the lobby's faces; full rooms alternate between a near and a far ring so neighbors never overlap, and with an odd count the last room also takes the far ring (layout comment in `rooms.config.ts`). Verb Tenses is a long corridor (timeline), everything else is a 12×12 m room, 4 m ceilings.

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

North wall, left to right: the pronouns, then defining and non-defining clauses side by side. The side walls run from the north corners toward the door: the east wall starts beside the pronouns (whom, whose, where/when) and the west wall beside non-defining (the comma pair, then omitting the pronoun). Rows follow that walking order. As backoffice slots that is north 1–3, east 3–1 (east slots count from the door) and west 1–2.

| Panel | Rule | Examples |
|---|---|---|
| **Relative pronouns** | who = subject, whom = object (people) | who: The woman who called is my sister. / whom: The man whom you met is my uncle. / whose (possession): The student whose phone rang was embarrassed. / which (things): The car which is red is mine. / that (people or things): The movie that we watched was fantastic. |
| **Defining clauses** | tells you which one — no commas | The woman who called is my sister. (Which woman? The one who called.) / Students who study hard get good grades. (only those students) / "that" can replace who, whom or which. / All five pronoun examples are defining. |
| **Non-defining clauses** | extra info about a known noun — commas, never "that", keep the pronoun | Incorrect: Paris, that is the capital of France, is beautiful. / Correct: Paris, which is the capital of France, is beautiful. / Without the extra info: Paris is beautiful. |
| **Who or whom?** | whom = the object · more formal English | The man whom I met was very kind. (I met him: the man receives the action.) / The man who met me was very kind. (He met me: the man does the action.) |
| **Whose** | possession — whose replaces a word like his, her, their, our… | My neighbor lives in apartment 3D. Her cat is orange. / Her cat becomes whose cat: / My neighbor, whose cat is orange, lives in apartment 3D. |
| **Where / When** | where = place, when = time | This is the town where I grew up. / I remember the day when we met. |
| **With or without commas?** | same words, different meaning | Defining: My brother who lives in Madrid is visiting. (I have more than one brother.) / Non-defining: My brother, who lives in Madrid, is visiting. (I have only one brother.) |
| **Omitting the pronoun** | only when it's the object, and only in defining clauses | The man (whom) you met is my uncle. / The movie (that) we watched was fantastic. / Keep a subject: The car which is red is mine. / Commas? Keep it: My uncle, whom you met, is a doctor. |

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

### 5.10 Lost in Translation (indigo)

Spanish phrases learners translate word for word, and what natural English says instead. Same walking order as Relative Clauses: north 1–3, east 3–1, west 1–3, then the door wall (south 1 beside the west wall, south 3 beside the east wall). Footnotes hold alternatives and answers.

| Panel | Rule | Examples | Footnote |
|---|---|---|---|
| **Translate the meaning** | not the words | Spanish: Tengo 28 años. / Word for word: I have 28 years. / Natural English: I'm 28 years old. / Word for word keeps the Spanish structure: it can sound odd or mean something else. | |
| **Correct vs. natural** | less natural isn't always wrong | I have a doubt. → I have a question. / I made a party for my birthday. → I had a party for my birthday. / I lost the bus. → I missed the bus. / According to me, this is a bad idea. → In my opinion, this is a bad idea. | |
| **Tengo… is not I have…** | age and being right use be | Tengo 28 años → I'm 28 years old. (not: I have 28 years) / Tengo razón → I'm right. (not: I have reason) / Tengo ganas de salir → I feel like going out. (not: I have desires to go out) | feel like + verb-ing = want to do something: I feel like staying home tonight. |
| **Me da… and me cae…** | English says how you feel | Me da igual → It doesn't matter to me. (not: It gives me the same) / Me da vergüenza → I'm embarrassed. (not: It gives me shame) / Me cae bien → I like him. (not: He falls well to me) | Also: I don't mind. · I get along with him. Embarrassed = how you feel; embarrassing = what causes it. |
| **Forget, sense, miss** | make the person the subject | Se me olvidó → I forgot. (not: It forgot to me) / No tiene sentido → It doesn't make sense. (not: It doesn't have sense) / Perdí el bus → I missed the bus. (not: I lost the bus) | Also: It slipped my mind. Miss the bus = you didn't catch it; lose = you can't find it. |
| **Qué pereza** | no single perfect translation | Qué pereza → I really don't feel like it. (not: What laziness!) / What a hassle! · That sounds like too much effort. / I can't be bothered. (informal, can sound dismissive) | |
| **Fix the translation** | rewrite each one in natural English | I have 32 years, and I live in San José. / I have desires to stay home tonight. / My friend falls well to me because she's very funny. / It doesn't have sense to spend so much money on that. | Answers: I'm 32 years old… · I feel like staying home tonight. · I like my friend… · It doesn't make sense to spend… |
| **Use it naturally** | — | You forgot your best friend's birthday. Try: It slipped my mind. / A friend wants to hike, but you'd rather rest. Try: I don't feel like it. / A friend wants a pricey new phone. Try: It doesn't make sense. / You arrive late and the other person left. Try: I missed the appointment. | Use an expression from this room, then ask a follow-up question. |
| **Talk: everyday life** | — | When did you last forget something important? What happened? / Should friends always say what they really think? / Have you agreed to something you didn't feel like doing? / What do people spend money on that doesn't make sense? / Is being late serious, or does it depend? | |
| **Talk: people & opinions** | — | What makes you like someone when you first meet them? / Can you get along with someone who disagrees with you? / Have you changed your mind about someone? / Do you always tell the truth when asked your opinion? / What embarrasses you that others might not mind? | |
| **Talk: habits & decisions** | — | What do you often feel like doing but rarely have time for? / What decision seemed right then but doesn't make sense now? / Have you missed an opportunity by forgetting something? / What did you dislike before but enjoy now? / If you could change one habit, what would it be? | |

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
