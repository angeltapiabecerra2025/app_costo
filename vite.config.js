import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/app_costo/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
