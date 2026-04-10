import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const apiProxyTarget = process.env.VITE_PROXY_TARGET || 'http://nginx'
const basePath = process.env.VITE_BASE_PATH
const buildOutDir = process.env.VITE_OUT_DIR || '../backend/public/spa'

export default defineConfig(({ command }) => ({
  // Use root path in dev so http://localhost:5173/ stays on "/".
  base: command === 'serve' ? '/' : (basePath || '/spa/'),
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
    outDir: buildOutDir,
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
