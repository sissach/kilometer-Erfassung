import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // use relative paths so built assets load on GitHub Pages
  server: {
    host: true, // bind dev server to 0.0.0.0 for remote/dev environments
    port: 5173
  },
  build: {
    outDir: 'dist'
  }
})