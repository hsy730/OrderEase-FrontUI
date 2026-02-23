#!/usr/bin/env node

/**
 * postinstall script
 *
 * uni-app 3.0.0-alpha 版本的 H5 编译器代码中引用了 `injectHook` API
 * 但这个 API 是 Vue 内部 API，没有公开导出。
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

  // 检查是否已经有正确的 injectHook 实现（简化版本）
  const correctImpl = `// Injected by postinstall.js - injectHook is an internal Vue API not exported publicly
// Simplified implementation for uni-app lifecycle hooks
function injectHook(type, hook, target) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      return hook(...args);
    });
    hooks.push(wrappedHook);
    return wrappedHook;
  }
}`

  if (content.includes('// Injected by postinstall.js - injectHook is an internal Vue API not exported publicly\n// Simplified implementation for uni-app lifecycle hooks')) {
    // 检查是否有重复定义，如果有则移除
    const implRegex = /\/\/ Injected by postinstall\.js[\s\S]*?^}/gm
    const matches = content.match(implRegex)
    
    if (matches && matches.length > 1) {
      // 移除所有 postinstall 注入的实现
      content = content.replace(implRegex, '')
      // 移除多余的空行
      content = content.replace(/\n{3,}/g, '\n\n')
      // 添加正确的实现
      content = content.replace(
        /(import \{ shallowRef, ref, getCurrentInstance \} from 'vue';)/,
        `$1\n\n${correctImpl}\n`
      )
      fs.writeFileSync(filePath, content)
      console.log('postinstall: fixed duplicate injectHook implementations')
    } else {
      console.log('postinstall: uni-app.es.js already has correct injectHook implementation')
    }
    process.exit(0)
  }

  // 简化的 injectHook 实现 - 不依赖 Vue 内部 API
  const injectHookImpl = `
${correctImpl}
`

  // 检查是否需要修复 - 如果从 vue 导入 injectHook 或有 undefined 调用
  if (content.includes("import { shallowRef, ref, getCurrentInstance, injectHook } from 'vue'") ||
      content.includes("import { shallowRef, ref, getCurrentInstance, setCurrentInstance } from 'vue'") ||
      content.includes('undefined(lifecycle, hook, target)')) {

    // 移除 injectHook 和 setCurrentInstance 从 vue 的导入
    content = content.replace(
      /import \{ shallowRef, ref, getCurrentInstance(, injectHook|, setCurrentInstance)* \} from 'vue'/,
      "import { shallowRef, ref, getCurrentInstance } from 'vue'"
    )

    // 在第一个 import 之后添加 injectHook 实现
    content = content.replace(
      /(import \{ shallowRef, ref, getCurrentInstance \} from 'vue';)/,
      `$1\n${injectHookImpl}`
    )

    // 替换 undefined(lifecycle, hook, target) 为 injectHook(lifecycle, hook, target)
    content = content.replace(/undefined\(lifecycle, hook, target\)/g, 'injectHook(lifecycle, hook, target)')

    fs.writeFileSync(filePath, content)
    console.log('postinstall: fixed uni-app.es.js - added injectHook implementation')
  } else {
    console.log('postinstall: uni-app.es.js does not need patching')
  }
} catch (error) {
  console.error('postinstall: error patching uni-app.es.js:', error.message)
  process.exit(1)
}
