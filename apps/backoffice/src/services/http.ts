export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3003"

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly errors?: { path: string; message: string }[],
  ) {
    super(message)
  }

  /** Message plus per-field validation details, ready for display. */
  get fullMessage() {
    if (!this.errors?.length) return this.message
    return [this.message, ...this.errors.map((e) => `${e.path}: ${e.message}`)].join(" · ")
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: init?.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...init,
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(data?.message ?? `Request failed (${res.status})`, data?.errors)
  }
  return data as T
}
