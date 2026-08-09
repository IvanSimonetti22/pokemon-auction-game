// 📂 client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000, // Puerto estándar para desarrollo
        proxy: {
            '/bluemap': {
                target: 'http://nodopersistente.duckdns.org:8100',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/bluemap/, '')
            },
            '/api/plan': {
                target: 'http://23.175.40.14:25117',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/plan/, '')
            }
        }
    }
})