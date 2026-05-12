import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/dashboard-v2-main-/',
  plugins: [react()],
})
