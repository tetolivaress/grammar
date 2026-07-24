import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  // linked workspace package ships CJS — pre-bundle it for dev-server ESM interop
  optimizeDeps: { include: ["@grammar-museum/shared"] },
})
