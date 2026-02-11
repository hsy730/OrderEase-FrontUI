import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/order-ease-iui/',
  plugins: [
    vue(),
    uni(),
  ],
  server: {
    host: "0.0.0.0",
    port: "3001",
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // 替换为实际的后端接口地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
