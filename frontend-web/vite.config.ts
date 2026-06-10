import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy /v1 -> backend Nova (Bootstrap, perfil http). Evita CORS en desarrollo.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/v1': {
        target: 'http://localhost:5109',
        changeOrigin: true,
      },
    },
  },
})
