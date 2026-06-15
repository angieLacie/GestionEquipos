import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'node:path'
import {basePath} from "./src/helpers";

// https://vite.dev/config/
export default defineConfig({
    base: basePath,
    plugins: [react()],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    // Proxy /v1 -> backend Nova (Bootstrap, perfil http). Evita CORS en desarrollo.
    server: {
        proxy: {
            '/v1': {
                target: 'http://localhost:5109',
                changeOrigin: true,
            },
        },
    },
})
