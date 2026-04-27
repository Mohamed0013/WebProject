import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const apiProxyTarget = process.env.VITE_PROXY_TARGET || 'http://nginx'

export default defineConfig(({ command }) => ({
  // Use root path in dev so http://localhost:5173/ stays on "/".
  // VITE_BASE_PATH can be set at build time to override the production base (e.g. /WebProject/ for GitHub Pages).
  base: command === 'serve' ? '/' : (process.env.VITE_BASE_PATH ?? '/spa/'),
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    https: {},
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: process.env.VITE_BUILD_OUTDIR ?? '../backend/public/spa',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: ({ name }) => {
          if (name?.endsWith('.css')) {
            return 'assets/app.css';
          }

          return 'assets/[name][extname]';
        },
      },
    },
  },
}))
