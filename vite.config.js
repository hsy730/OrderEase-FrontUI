import { defineConfig, loadEnv } from 'vite'
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
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  const platform = process.env.UNI_PLATFORM || 'h5'
  const isH5 = platform === 'h5'

  const uni = require('@dcloudio/vite-plugin-uni')
  const uniPlugin = typeof uni.default === 'function' ? uni.default() : uni

  return {
    base: isH5 ? '/order-ease-iui/' : '/',
    plugins: [
      uniPlugin,
      copyStaticPlugin()
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    define: {
      // 将环境变量注入到代码中，供 manifest.json 使用
      'import.meta.env.VITE_MP_WEIXIN_APP_ID': JSON.stringify(env.VITE_MP_WEIXIN_APP_ID || ''),
      'import.meta.env.VITE_DEBUG_MODE': JSON.stringify(env.VITE_DEBUG_MODE || 'false'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || ''),
      'import.meta.env.VITE_API_PREFIX': JSON.stringify(env.VITE_API_PREFIX || '')
    },
    build: {
      // 为构建产物添加内容哈希，解决浏览器缓存问题
      rollupOptions: {
        output: {
          // 入口文件添加哈希
          entryFileNames: 'js/[name]-[hash].js',
          // 代码分割的 chunk 文件添加哈希
          chunkFileNames: 'js/[name]-[hash].js',
          // 资源文件（CSS、图片、字体等）添加哈希
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            // 图片文件
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
              return 'img/[name]-[hash][extname]'
            }
            // 字体文件
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return 'fonts/[name]-[hash][extname]'
            }
            // CSS 文件
            if (ext === 'css') {
              return 'css/[name]-[hash][extname]'
            }
            // 其他资源文件
            return '[ext]/[name]-[hash][extname]'
          }
        }
      }
    },
    server: {
      host: "0.0.0.0",
      port: "3001",
      proxy: env.VITE_PROXY_TARGET ? {
        '/api': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      } : undefined
    },
    publicDir: 'public'
  }
})
