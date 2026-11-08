import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// TinyOS is a fully client-side app: no server, no API, no secrets.
export default defineConfig({
  // Relative base so the same build works at a domain root or under /<repo>/ on GitHub Pages.
  base: './',
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: { target: 'es2019', outDir: 'dist' },
})
