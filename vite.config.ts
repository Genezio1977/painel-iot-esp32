import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Caminhos relativos para funcionar no GitHub Pages (usuario.github.io/nome-do-repo/)
  base: './',
})
