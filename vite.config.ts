import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    hmr: {
      clientPort: 5173,
      host: 'localhost'
    }
  },
  preview: {
    allowedHosts: ['team2.cs144.org']
  },
  plugins: [
    react()
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  publicDir: 'public'
})

