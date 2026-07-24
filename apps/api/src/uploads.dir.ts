import { mkdirSync } from "node:fs"
import { join } from "node:path"

/** Wall images live on disk next to the API; served statically at /uploads. */
export const UPLOADS_DIR = join(process.cwd(), "uploads")
mkdirSync(UPLOADS_DIR, { recursive: true })
