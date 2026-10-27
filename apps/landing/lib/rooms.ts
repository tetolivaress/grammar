import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRight,
  Blocks,
  Clock,
  GitBranch,
  Hourglass,
  KeyRound,
  Languages,
  Link2,
  MessageSquareQuote,
  Sparkles,
  Split,
  Waypoints,
} from "lucide-react"

/**
 * Marketing room data straight from design.pen (numbers, icons, colors and
 * copy are the design's), with one exception: the relatives desc/learn copy
 * was rewritten here, not in design.pen, when that room gained whom, whose
 * and the defining vs. non-defining panels. Keep it when re-syncing from the
 * design. `slug` matches the CMS room slugs so the detail pages can pull live
 * exhibit content from the API.
 */
export interface LandingRoom {
  num: string
  slug: string
  name: string
  nameEs: string
  desc: string
  learn: string
  color: string // CSS variable name
  Icon: LucideIcon
  ThumbIcon: LucideIcon
}

export const landingRooms: LandingRoom[] = [
  {
    num: "01", slug: "tenses", name: "Verb Tenses", nameEs: "Tiempos verbales",
    desc: "Past, present and future forms and when to use them.",
    learn: "Master past, present and future across simple, continuous and perfect forms.",
    color: "--room-verb-tenses", Icon: Clock, ThumbIcon: Hourglass,
  },
  {
    num: "02", slug: "conditionals", name: "Conditionals", nameEs: "Condicionales",
    desc: "If-then patterns for real, unreal and past situations.",
    learn: "Build real, unreal and past hypotheticals with confidence.",
    color: "--room-conditionals", Icon: GitBranch, ThumbIcon: GitBranch,
  },
  {
    num: "03", slug: "passive", name: "Passive Voice", nameEs: "Voz pasiva",
    desc: "Focus on the action when the doer is unknown or unimportant.",
    learn: "Shift focus to the action across every tense and register.",
    color: "--room-passive", Icon: ArrowLeftRight, ThumbIcon: ArrowLeftRight,
  },
  {
    num: "04", slug: "modals", name: "Modal Verbs", nameEs: "Verbos modales",
    desc: "Can, must, should and might for ability, obligation and possibility.",
    learn: "Express ability, obligation, advice and deduction naturally.",
    color: "--room-modals", Icon: KeyRound, ThumbIcon: KeyRound,
  },
  {
    num: "05", slug: "relatives", name: "Relative Clauses", nameEs: "Oraciones de relativo",
    desc: "Who, whom, whose, which and that to add detail to nouns.",
    learn: "Tell defining from non-defining clauses and pick the right relative pronoun.",
    color: "--room-relative", Icon: Link2, ThumbIcon: Link2,
  },
  {
    num: "06", slug: "connectors", name: "Connectors", nameEs: "Conectores",
    desc: "Link ideas: however, therefore, although, so that.",
    learn: "Join ideas smoothly with contrast, cause, purpose and sequence.",
    color: "--room-connectors", Icon: Waypoints, ThumbIcon: Waypoints,
  },
  {
    num: "07", slug: "gerunds", name: "Gerunds & Infinitives", nameEs: "Gerundios e infinitivos",
    desc: "-ing vs to + verb and which one to choose.",
    learn: "Choose correctly between -ing forms and to + verb.",
    color: "--room-gerunds", Icon: Split, ThumbIcon: Split,
  },
  {
    num: "08", slug: "phrasals", name: "Phrasal Verbs", nameEs: "Phrasal Verbs",
    desc: "Verb + particle combos used in everyday English.",
    learn: "Decode get up, put off and the combos native speakers use daily.",
    color: "--room-phrasal", Icon: Blocks, ThumbIcon: Blocks,
  },
  {
    num: "09", slug: "idioms", name: "Idioms", nameEs: "Modismos",
    desc: "Common expressions whose meaning is more than the words.",
    learn: "Understand expressions that mean more than their words.",
    color: "--room-idioms", Icon: Sparkles, ThumbIcon: Sparkles,
  },
]

/** CMS rooms not present in the design get a sensible fallback style. */
export const extraRoomStyles: LandingRoom[] = [
  {
    num: "10", slug: "reported", name: "Reported Speech", nameEs: "Estilo indirecto",
    desc: "Turn direct words into reported ones — one tense back.",
    learn: "Report statements, questions and commands with the right backshift.",
    color: "--room-reported", Icon: MessageSquareQuote, ThumbIcon: MessageSquareQuote,
  },
  {
    num: "11", slug: "translation", name: "Lost in Translation", nameEs: "Perdido en la traducción",
    desc: "Spanish phrases that sound wrong when translated word for word.",
    learn: "Say what you mean in natural English instead of translating word for word.",
    color: "--room-translation", Icon: Languages, ThumbIcon: Languages,
  },
]

export function roomStyle(slug: string): LandingRoom | undefined {
  return landingRooms.find((r) => r.slug === slug) ?? extraRoomStyles.find((r) => r.slug === slug)
}

export const MUSEUM_URL = process.env.NEXT_PUBLIC_MUSEUM_URL ?? "http://localhost:5173"
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003"
