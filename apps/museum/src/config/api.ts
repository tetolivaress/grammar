export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3003"

/** Uploaded images are stored as /uploads/... paths relative to the API. */
export function assetUrl(path: string) {
  return path.startsWith("http") ? path : `${API_URL}${path}`
}
