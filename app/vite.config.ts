import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : '/nikkiup2u3/',
  publicDir: command === 'serve' ? '../../' : false,
  server: {
    port: 5173,
    fs: {
      allow: ['..'],
    },
  },
}))
