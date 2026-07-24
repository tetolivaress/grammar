import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // linked workspace package ships CJS — pre-bundle it for dev-server ESM interop
  optimizeDeps: { include: ['@grammar-museum/shared'] },
})
