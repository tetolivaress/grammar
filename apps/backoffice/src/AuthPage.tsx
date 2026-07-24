import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { signIn, signUp } from "./auth"

const credentialsSchema = z.object({
  name: z.string().trim().max(60).optional(),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
})

type Credentials = z.infer<typeof credentialsSchema>

export function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({ resolver: standardSchemaResolver(credentialsSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    const result =
      mode === "signup"
        ? await signUp.email({
            email: values.email,
            password: values.password,
            name: values.name || values.email.split("@")[0],
          })
        : await signIn.email({ email: values.email, password: values.password })
    if (result.error) setServerError(result.error.message ?? "Authentication failed")
  })

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h1>Grammar Museum</h1>
        <p className="muted">Content backoffice</p>

        {mode === "signup" && (
          <label>
            Name
            <input type="text" {...register("name")} placeholder="Ada" />
          </label>
        )}
        <label>
          Email
          <input type="email" {...register("email")} placeholder="you@example.com" />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </label>
        <label>
          Password
          <input type="password" {...register("password")} placeholder="••••••••" />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </label>

        {serverError && <p className="error">{serverError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
        <button
          type="button"
          className="link"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        >
          {mode === "signup" ? "Already have an account? Sign in" : "First time? Create an account"}
        </button>
      </form>
    </div>
  )
}
