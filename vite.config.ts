import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
  watch: {
  // JSON Server reescribe db.json en cada alta/edición/baja; sin esto Vite
  // recarga la página completa y los toasts desaparecen al instante.
  ignored: ['**/db.json'],
  },
 },

})
