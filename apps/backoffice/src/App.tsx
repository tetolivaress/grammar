import { Admin } from "./Admin"
import { AuthPage } from "./AuthPage"
import { useSession } from "./auth"

export default function App() {
  const { data: session, isPending } = useSession()
  if (isPending) return <div className="loading">Loading…</div>
  return session ? <Admin /> : <AuthPage />
}
