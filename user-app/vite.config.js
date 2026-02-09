import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin untuk serve static pages
function staticPagesPlugin() {
  return {
    name: 'static-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/about' || req.url === '/about/') {
          const filePath = path.resolve(__dirname, 'public/about.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            const html = fs.readFileSync(filePath, 'utf-8')
            res.end(html)
            return
          }
        }
        if (req.url === '/privacy' || req.url === '/privacy/') {
          const filePath = path.resolve(__dirname, 'public/privacy.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            const html = fs.readFileSync(filePath, 'utf-8')
            res.end(html)
            return
          }
        }
        if (req.url === '/terms' || req.url === '/terms/') {
          const filePath = path.resolve(__dirname, 'public/terms.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            const html = fs.readFileSync(filePath, 'utf-8')
            res.end(html)
            return
          }
        }
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), staticPagesPlugin()],

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
      'clickz.co.no',
      // Tambahkan IP server jika perlu
      // 'your-server-ip'
    ]
  }
})
