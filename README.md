# The Grammar Museum — monorepo

A walkable 3D English-learning museum with a CMS. pnpm workspaces:

| Workspace | What | Port |
|---|---|---|
| `apps/museum` | The 3D museum (Vite + react-three-fiber + WebXR) | 5173 |
| `apps/api` | NestJS + Prisma (SQLite) + Better Auth. Rooms/panels CRUD, image uploads | 3003 |
| `apps/backoffice` | Vite React CMS: login, edit every wall/door, upload wall images | 5174 |
| `apps/landing` | Next.js marketing landing | 3000 |
| `packages/shared` | zod schemas (single source of validation) + default curriculum | — |

## First run

```bash
pnpm install
pnpm --filter @grammar-museum/shared build
pnpm --filter api prisma:generate
pnpm --filter api prisma:push
pnpm db:seed                      # loads the 10-room default curriculum

pnpm dev:api                      # http://localhost:3003
pnpm dev:backoffice               # http://localhost:5174  (create your admin account here)
pnpm dev:museum                   # http://localhost:5173
pnpm dev:landing                  # http://localhost:3000
```

`pnpm build` builds everything (shared first).

## How content flows

- The backoffice edits rooms (max **10**) and their wall panels through the API;
  every request is validated with the shared zod schemas on both client and
  server (title/body length limits, wall/slot rules per room kind, upload
  mime/size limits).
- Wall images: upload from the panel editor (PNG/JPEG/WebP/GIF, ≤4 MB) —
  stored under `apps/api/uploads/`, served at `/uploads/...`, rendered on the
  3D panel's lower half.
- The museum fetches `GET /rooms` on load and recomputes the radial layout for
  however many rooms exist (1–10). If the API is down it falls back to the
  bundled curriculum from `packages/shared`.
- Auth is Better Auth (email/password) with the session cookie shared to the
  backoffice via CORS + trusted origins. Mutating endpoints require a session.
- **User management** (backoffice → Users tab, Better Auth admin plugin):
  admins list/create accounts, switch roles (admin ↔ user), ban/unban and
  delete users. The first account ever created becomes admin automatically;
  later sign-ups start as "user" (can edit content, cannot manage users).

## Database

ER diagram: [`docs/database.mmd`](docs/database.mmd) (Mermaid — renders on
GitHub, VS Code with a Mermaid extension, or [mermaid.live](https://mermaid.live)).
Schema source of truth: `apps/api/prisma/schema.prisma`.

Inspect the data visually with `pnpm db:studio` (Prisma Studio on
http://localhost:5555).

## Env

Each app has a `.env.example` documenting its variables — copy to `.env` and
adjust. Only the API's is required (`DATABASE_URL`, `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`, `PORT`, plus `TRUSTED_ORIGINS` and optional `COOKIE_DOMAIN`
in production); the frontends fall back to `http://localhost:3003` for the API
when `VITE_API_URL` / `NEXT_PUBLIC_API_URL` are unset, so local dev needs no
env setup. All real `.env*` files are gitignored (only the examples are
committed).

## Deploy

Ready-made `.env.production` files exist per app with fresh secrets —
**replace every `YOUR-DOMAIN` placeholder** with your real domains:

- `apps/api/.env.production` → copy to `.env` on the server. `TRUSTED_ORIGINS`
  must list the exact HTTPS origins of the backoffice/museum/landing, or
  logins will fail CORS. HTTPS `BETTER_AUTH_URL` enables secure cookies.
- `apps/museum/.env.production`, `apps/backoffice/.env.production` — read
  automatically by `vite build`; deploy the resulting `dist/` anywhere static.
- `apps/landing/.env.production` — read by `next build`.

The API needs a host with a persistent disk (SQLite file + `uploads/`):
a VPS, Railway, Fly.io, Render — not serverless.
