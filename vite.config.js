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
            }
        }
    }
})