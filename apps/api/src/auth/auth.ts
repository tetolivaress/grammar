import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin } from "better-auth/plugins"
import { prisma } from "../prisma"

/**
 * Better Auth server instance. Email/password only — the backoffice is the
 * single client. Secret and base URL come from BETTER_AUTH_SECRET /
 * BETTER_AUTH_URL env vars. Frontends run on other localhost ports, so they
 * must be listed as trusted origins for the CSRF/origin check.
 *
 * The admin plugin powers the backoffice "Users" section (list/create/ban/
 * role/delete — admin role required). The very first account ever created
 * becomes admin automatically; everyone after that starts as "user".
 */
/**
 * Frontend origins allowed for CORS and Better Auth's origin check.
 * Comma-separated TRUSTED_ORIGINS env in production; localhost dev defaults.
 */
export const trustedOrigins = (
  process.env.TRUSTED_ORIGINS ??
  "http://localhost:3000,http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

// Set COOKIE_DOMAIN (e.g. ".example.com") when the backoffice and API live on
// different subdomains of one site, so the session cookie is shared.
const cookieDomain = process.env.COOKIE_DOMAIN

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [admin()],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const count = await prisma.user.count()
          return { data: { ...user, role: count === 0 ? "admin" : "user" } }
        },
      },
    },
  },
  trustedOrigins,
  advanced: cookieDomain
    ? { crossSubDomainCookies: { enabled: true, domain: cookieDomain } }
    : undefined,
})
