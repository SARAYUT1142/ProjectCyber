import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],

  server: {
    host: true,  // อนุญาตให้เข้าถึงผ่าน Network
    allowedHosts: true // (สำคัญ) อนุญาตให้ Host ภายนอกอย่าง Ngrok เข้าถึงได้
  }
})
