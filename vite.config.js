import { defineConfig } from 'vite'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const uni = require('@dcloudio/vite-plugin-uni')
const uniPlugin = typeof uni.default === 'function' ? uni.default() : uni

export default defineConfig({
  plugins: [uniPlugin],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: "0.0.0.0",
    port: "3001",
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
