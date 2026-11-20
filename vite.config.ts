import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Repo de usuario (fjaguayo.github.io): se sirve desde la raíz.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
