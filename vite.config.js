import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.UNI_INPUT_DIR = process.env.UNI_INPUT_DIR || path.resolve(__dirname, 'src')

const require = createRequire(import.meta.url)

function copyStaticPlugin() {
  return {
    name: 'copy-static-plugin',
    writeBundle: async (options) => {
      const fs = await import('fs')
      const fsPromises = await import('fs/promises')

      const staticDir = path.resolve(__dirname, 'static')
      const outputDir = options.dir

      if (fs.existsSync(staticDir) && outputDir) {
        const outputStaticDir = path.join(outputDir, 'static')
        await fsPromises.cp(staticDir, outputStaticDir, { recursive: true, force: true })
      }
    }
  }
}

export default defineConfig(({ command, mode }) => {
  const platform = process.env.UNI_PLATFORM || 'h5'
  const isH5 = platform === 'h5'

  const uni = require('@dcloudio/vite-plugin-uni')
  const uniPlugin = typeof uni.default === 'function' ? uni.default() : uni

  return {
    base: isH5 ? '/order-ease-iui/' : '/',
    plugins: [
      uniPlugin,
      platform.includes('mp') ? copyStaticPlugin() : null
    ].filter(Boolean),
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
    },
    publicDir: 'public'
  }
})
