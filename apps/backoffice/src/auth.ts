import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { API_URL } from "./services/http"

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [adminClient()],
})

export const { useSession, signIn, signUp, signOut } = authClient

export type AdminUser = (typeof authClient.$Infer.Session)["user"]
