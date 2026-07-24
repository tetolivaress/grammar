/** Query key factories — single source for cache identity + invalidation. */
export const roomKeys = {
  all: ["rooms"] as const,
}

export const userKeys = {
  all: ["users"] as const,
}
