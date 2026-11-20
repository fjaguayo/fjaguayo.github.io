import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// fjaguayo.github.io es un repo de usuario, así que la web vive en la raíz "/"
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
