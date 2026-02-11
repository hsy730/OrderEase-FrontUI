import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// https://vitejs.dev/config/
const isUni = process.env.UNI_PLATFORM !== undefined

export default defineConfig(async () => {
  // uni-app builds
  if (isUni) {
    // Use CommonJS require to get the default export properly
    const uni = require('@dcloudio/vite-plugin-uni')
    // uni.default is the function from CJS module
    const plugins = typeof uni.default === 'function' ? uni.default() : (typeof uni === 'function' ? uni() : [])
    return {
      plugins: Array.isArray(plugins) ? plugins : [plugins],
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
    }
  }

  // H5 build configuration (web app with Vue Router and Vant)
  return {
    base: '/order-ease-iui/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: {
      outDir: 'dist/h5',
      emptyOutDir: true
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
  }
})