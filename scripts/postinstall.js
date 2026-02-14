#!/usr/bin/env node

/**
 * postinstall script
 *
 * uni-app 3.0.0-alpha 版本的 H5 编译器代码中引用了 `isInSSRComponentSetup` 和 `injectHook` API
 * 但这些 API 在 Vue 3.2.47 中不存在。
 *
 * 此脚本在 npm install 后自动修复 node_modules 中的 uni-app.es.js 文件
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const filePath = path.join(__dirname, '../node_modules/@dcloudio/uni-app/dist/uni-app.es.js')

if (!fs.existsSync(filePath)) {
  console.log('postinstall: uni-app.es.js not found, skipping fix')
  process.exit(0)
}

try {
  let content = fs.readFileSync(filePath, 'utf8')

  // 移除 isInSSRComponentSetup 导入
  content = content.replace(/isInSSRComponentSetup\s*,\s*/g, '')
  content = content.replace(/,\s*isInSSRComponentSetup/g, '')

  // 移除 injectHook 导入
  content = content.replace(/injectHook\s*,\s*/g, '')
  content = content.replace(/,\s*injectHook/g, '')

  // 替换代码中的使用
  content = content.replace(/\bisInSSRComponentSetup\b/g, 'false')
  content = content.replace(/\binjectHook\b/g, 'undefined')

  fs.writeFileSync(filePath, content)
  console.log('postinstall: patched uni-app.es.js for H5 build compatibility')
} catch (error) {
  console.error('postinstall: error patching uni-app.es.js:', error.message)
  process.exit(1)
}
