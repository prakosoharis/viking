import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Development server (npm run dev)
  server: {
    port: 3200,
    host: true,
    strictPort: false
  },

  // Preview server (npm run preview) - untuk production testing
  preview: {
    port: 3200,
    host: true,
    strictPort: true,
    // Allowed hosts untuk production (update sesuai domain Anda)
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'deluwang.online',
      'www.deluwang.online',
      // Tambahkan IP server jika perlu
      // 'your-server-ip'
    ]
  }
})
