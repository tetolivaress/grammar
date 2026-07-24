# Pencil.dev prompt — Grammar Museum landing site

Copy-paste the block below into pencil.dev to generate the multi-page, bilingual, responsive landing site for The Grammar Museum.

---

```text
Design a multi-page, responsive marketing website for "The Grammar Museum" — a walkable 3D
English-learning museum built with React Three Fiber that runs in the browser (desktop WASD +
mouse) and on Meta Quest via WebXR. Target audience: Spanish-speaking English learners (A2–B2)
and teachers. The site must present the same content as the museum, but as a landing site.

=== BRAND / VISUAL DIRECTION ===
Match the museum's in-world art direction: warm, low-poly, gallery-like.
- Base palette: floor/bg #e8e2d4 (warm bone), surfaces #f5f1e8 (off-white), cards #fffdf7,
  text #1f2430 (near-black ink).
- Each of the 9 rooms has a signature accent color used for its card, badge, and detail page
  header (e.g. Conditionals = teal #2a9d8f, Passive Voice = terracotta #e76f51,
  Modals = steel blue #457b9d). Wayfinding-by-color is a core product idea — make it a core
  visual idea of the site too.
- Typography: a friendly geometric sans for headings, highly readable sans for body. Generous
  whitespace, soft rounded corners, flat colors, no gradients or photos — use flat/low-poly
  style illustrations and color blocks instead.

=== LANGUAGES ===
The site is bilingual: English and Spanish. Add a visible EN/ES language switcher in the
header (and in the mobile menu). Design every page in both languages (or show the switcher
state clearly). All grammar exhibit content stays in English; UI copy, headings and
descriptions get Spanish variants — mirroring how the museum itself works (English exhibits,
Spanish subtitles on signage).

=== PAGES & NAVIGATION ===
Global sticky header: logo "The Grammar Museum", nav links (Home, Rooms, How It Works, VR,
About), language switcher EN/ES, and a primary CTA button "Enter the Museum" / "Entrar al
museo". On mobile: hamburger menu with a full-screen drawer. Global footer: short mission
line, nav links, room quick-links (color-coded), language switcher, credits.

1. HOME (landing) — several sections:
   a. Hero: headline like "Walk through English grammar" / "Camina por la gramática inglesa",
      subheadline explaining it's a free 3D museum in the browser and VR, two CTAs
      ("Enter the Museum", "Watch how it works"), and a stylized low-poly illustration of the
      octagonal lobby with 9 color-coded doorways.
   b. Room gallery: a responsive grid of 9 cards, one per grammar room, each with its accent
      color, English name + Spanish subtitle, and a one-line description:
      Verb Tenses (Tiempos verbales), Conditionals (Condicionales), Passive Voice (Voz pasiva),
      Modal Verbs (Verbos modales), Relative Clauses (Oraciones de relativo), Connectors
      (Conectores), Gerunds & Infinitives (Gerundios e infinitivos), Phrasal Verbs, Idioms
      (Modismos). Cards link to the room detail pages.
   c. How it works: 3-step strip (1. Open in your browser, 2. Walk with WASD/joystick or
      teleport in VR, 3. Learn from wall exhibits at your own pace).
   d. Platforms section: Desktop / Mobile touch / Meta Quest VR, each with a small icon and note.
   e. Who it's for: Spanish-speaking learners A2–B2, self-learners, classrooms/teachers.
   f. Final CTA band with the museum's bone/ink colors and the "Enter the Museum" button.

2. ROOMS (index page): all 9 rooms as a richer list — accent color header, what you'll learn,
   number of exhibits, small floor-plan thumbnail showing where the room sits around the
   octagonal lobby.

3. ROOM DETAIL (design one template, e.g. Conditionals): hero band in the room's accent color
   with English name + Spanish subtitle; then the room's exhibit content presented as
   wall-panel-style cards (panel title, grammar rule, 2–3 example sentences with the key part
   highlighted) — visually echoing the museum's exhibit panels (#fffdf7 card, accent header
   bar, ink text); prev/next room navigation at the bottom.

4. HOW IT WORKS / VR page: controls explained for desktop (WASD + mouse), touch (virtual
   joystick), and Quest (teleport + snap turn); requirements (modern browser, HTTPS, no
   install); FAQ accordion.

5. ABOUT: mission (making grammar spatial and memorable), the color-wayfinding idea,
   open/free access, contact.

=== RESPONSIVE ===
Design desktop (1440), tablet (768), and mobile (390) for at least Home; the 9-room grid goes
3×3 → 2 columns → 1 column. Header collapses to hamburger on mobile. Touch-friendly targets.
```

---

## Notes

- **Color wayfinding is the design hook.** In the museum, "the green room is conditionals" replaces a minimap; carrying it into the site keeps the result distinctive instead of a generic template.
- **Room names come from `grammar-museum-spec.md`.** The museum app loads real room content from the API at runtime (`apps/museum/src/config/rooms.config.ts`) — if the API names differ, update the room gallery list before pasting.
- To make the ROOM DETAIL template stronger, paste 2–3 real exhibit panels (rule + example sentences) into that section so it's designed around real content lengths.
