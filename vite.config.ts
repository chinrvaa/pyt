import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project URL: https://USER.github.io/REPO/ — base must match repo name or assets 404 (blank page).
// Local dev keeps base "/" so you open http://127.0.0.1:5173/ (not /pyt/).
// Rename the repo? Change `/pyt/` here (or set VITE_BASE in the workflow).
const pagesBase = process.env.VITE_BASE ?? '/pyt/'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : pagesBase,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
}))
