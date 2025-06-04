import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID)
  },
  server: {
    host: true,
    port: 5173
  },
  preview: {
    allowedHosts: ['team2.cs144.org']
  },
  plugins: [
    react()
  ]
})

