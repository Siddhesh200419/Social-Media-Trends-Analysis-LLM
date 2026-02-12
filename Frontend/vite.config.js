import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Standard Vite + React config, with alias support for "@/..."
// and a proxy to the Flask backend on port 5000.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/pipeline': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        timeout: 60000,
      },
    },
  },
});
