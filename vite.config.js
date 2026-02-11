import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 18794,
    allowedHosts: ['organisation-frames-minute-electric.trycloudflare.com', '.trycloudflare.com'],
  },
})
