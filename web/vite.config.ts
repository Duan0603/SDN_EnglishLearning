import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
// AC2: Frontend MUST run on port 3000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    strictPort: true, // Fail if port 8081 is already in use
    proxy: {
      // Proxy API requests to backend — avoids CORS issues in dev
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy Socket.io connections to backend
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
