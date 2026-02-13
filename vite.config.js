import { defineConfig } from 'vite'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const uni = require('@dcloudio/vite-plugin-uni')
const uniPlugin = typeof uni.default === 'function' ? uni.default() : uni

// Vite 插件：复制 static 目录到输出目录
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

  return {
    plugins: [
      uniPlugin,
      // 只在小程序平台添加静态资源复制插件
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
    // 确保 public 目录被复制
    publicDir: 'public'
  }
})
