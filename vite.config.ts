import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/wanna-trip",
  server: {
    port: 4000,
    allowedHosts: ["0.tcp.jp.ngrok.io"],
  },
})
