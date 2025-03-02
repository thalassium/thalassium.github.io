import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: "/thalassium.github.io/", // Mets bien le nom du repo ici
  plugins: [vue()],
})
