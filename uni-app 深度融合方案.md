# H5 和小程序代码完全迁移到 uni-app 标准重构方案

> **用户选择**: 完全迁移到 uni-app 标准（推荐）

## 问题分析

### 当前架构问题

1. **混合架构导致混乱**
   - `vite.config.js` 试图同时处理 uni-app (小程序) 和传统 Vite (H5) 两种构建模式
   - 在 H5 构建时使用的是 uni-app 的入口 (`src/index.html` -> `src/main.js`)
   - 但同时存在传统的 Vue Router + Axios 代码 (`src/api/index.js`)

2. **API 层重复且冲突**
   - `src/api/index.js` - 使用 Axios + Vue Router (传统 H5)
   - `src/utils/api.js` - 使用 uni.request (uni-app 兼容)
   - `pages/` 目录下的页面使用 `@/utils/api`
   - `src/api/index.js` 仍然导入 `@/router`（但 router 目录已删除）

3. **配置文件位置混乱**
   - `pages.json` 同样存在于根目录和 `src/` 目录
   - `manifest.json` 位于 `src/`，但 uni-app 标准应该在根目录
   - `src/index.html` 是 H5 入口，但也包含 uni-app 的引用

4. **H5 构建实际上是 uni-app H5**
   - `npm run dev` 运行的是 `vite` 命令
   - 由于没有 `UNI_PLATFORM` 环境变量，走的传统 Vite 路径
   - 但入口是 `src/index.html` (uni-app entry)，不是传统 Vue App

### 当前目录结构

```
OrderEase-FrontUI/
├── pages/                      # uni-app 页面 (小程序 + H5)
│   ├── index/index.vue         # 首页 (使用 @/utils/api)
│   ├── orders/orders.vue       # 订单页 (使用 @/utils/api)
│   ├── mine/mine.vue           # 我的页
│   ├── login/login.vue         # 登录页
│   ├── register/register.vue   # 注册页
│   └── token-login/token-login.vue
├── src/
│   ├── utils/                  # (已存在，保持)
│   │   ├── api.js
│   │   ├── image.js
│   │   ├── constants.js
│   │   └── storage.js (可选)
│   ├── store/                  # (已存在，保持)
│   │   └── index.js
│   └── assets/                 # (已存在，保持)
│       ├── logo.svg
│       ├── main.css
│       ├── base.css
│       ├── theme-blue-orange.css
│       └── animations.css
│
├── App.vue                     # uni-app App.vue
├── main.js                     # uni-app 入口
├── pages.json                  # uni-app 页面配置 (根目录)
├── manifest.json               # 应用配置 (根目录)
└── vite.config.js              # 混合架构配置 (有问题)
```

## uni-app 最佳实践

uni-app 的标准目录结构应该是:

```
OrderEase-FrontUI/
├── pages/                      # 页面目录 (uni-app 标准)
│   ├── index/
│   ├── orders/
│   ├── mine/
│   ├── login/
│   ├── register/
│   └── token-login/
├── static/                     # 静态资源
├── uni_modules/                # uni-app 插件
├── components/                 # 全局组件
├── store/                      # 状态管理
├── utils/                      # 工具类
├── api/                        # API 接口
├── styles/                     # 全局样式
├── App.vue                     # 应用配置
├── main.js                     # 入口文件
├── pages.json                  # 页面路由配置 (根目录)
├── manifest.json               # 应用配置 (根目录)
└── uni.scss                    # 全局 SCSS 变量
```

**关键点**：
- `pages.json` 和 `manifest.json` 必须在**根目录**
- 只有一种构建方式：uni-app CLI
- H5 和小程序代码完全共享，使用条件编译处理差异

## 重构方案

### 方案一：完全迁移到 uni-app 标准（推荐）

将项目完全重构为标准的 uni-app 结构，使用条件编译处理 H5 和小程序的差异。

#### 优点
- 代码完全统一，维护简单
- uni-app 官方支持，文档完善
- 未来可扩展到其他平台（App、支付宝小程序等）

#### 缺点
- 需要较多的重构工作

### 方案二：保持现状但修复问题

最小化修改，修复当前配置导致的问题。

#### 优点
- 改动小，风险低

#### 缺点
- 架构仍然混乱
- 长期维护困难

## 推荐实施方案：完全迁移到 uni-app 标准

### 第一步：清理废弃文件

删除以下文件：
- `src/api/index.js` - 废弃的 Axios 版本，已用 `src/utils/api.js` 替代
- `src/index.html` - uni-app H5 自动生成这个文件
- `src/pages.json` - 应该只在根目录存在

### 第二步：调整目录结构

```
OrderEase-FrontUI/
├── pages/                      # (已存在，保持)
├── static/                     # (已存在，保持)
│   └── tabbar/                 # TabBar 图标
├── components/                 # 从 src/components/ 移动过来
│   ├── CategoryList.vue
│   ├── ProductCard.vue
│   ├── ProductList.vue
│   ├── ShoppingCart.vue
│   ├── CommonNavBar.vue
│   ├── CartList.vue
│   └── ProductDetailPopup.vue
├── src/
│   ├── utils/                  # (已存在，保持)
│   ├── store/                  # (已存在，保持)
│   └── assets/                 # (已存在，保持)
│
├── App.vue                     # 从 src/ 移动到根目录
├── main.js                     # 从 src/ 移动到根目录
├── pages.json                  # (已在根目录，保持)
├── manifest.json               # 从 src/ 移动到根目录
└── vite.config.js              # 更新为 uni-app 专用配置
```

### 第三步：更新 vite.config.js

移除传统 Vite 模式，只保留 uni-app 配置:

```javascript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
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
```

### 第四步：更新 main.js 和 App.vue

确保入口文件正确引用新的目录结构。

### 第五步：更新所有导入路径

扫描并更新所有文件中的导入路径：
- `@/components/*` → `@/components/*` (保持不变)
- `@/api/*` → `@/utils/api.js`
- `@/router` → 移除 (使用 uni-app 导航 API)

### 第六步：更新 package.json

确保脚本正确：

```json
{
  "scripts": {
    "dev:h5": "uni -p h5",
    "dev:mp-weixin": "uni -p mp-weixin",
    "build:h5": "uni build -p h5",
    "build:mp-weixin": "uni build -p mp-weixin"
  }
}
```

### 第七步：验证构建

1. 测试 H5 开发: `npm run dev:h5`
2. 测试小程序开发: `npm run dev:mp-weixin`
3. 测试 H5 生产构建: `npm run build:h5`
4. 测试小程序生产构建: `npm run build:mp-weixin`

## 条件编译示例

如果需要在 H5 和小程序之间有差异化功能，使用条件编译：

```javascript
// #ifdef H5
// H5 专属代码
document.addEventListener('visibilitychange', ...)
// #endif

// #ifdef MP-WEIXIN
// 微信小程序专属代码
wx.login(...)
// #endif

// #ifdef H5 || MP-WEIXIN
// H5 和微信小程序都执行的代码
// #endif
```

## 实施步骤详细清单

### 需要删除的文件

| 文件路径 | 原因 |
|---------|------|
| `src/api/index.js` | 废弃的 Axios 版本，已用 `src/utils/api.js` 替代 |
| `src/index.html` | uni-app H5 自动生成 |
| `src/pages.json` | 重复，根目录已有 |

### 需要移动的文件

| 源路径 | 目标路径 | 原因 |
|--------|---------|------|
| `src/App.vue` | `App.vue` | uni-app 标准入口 |
| `src/main.js` | `main.js` | uni-app 标准入口 |
| `src/components/CategoryList.vue` | `components/CategoryList.vue` | 移到根目录 |
| `src/components/ProductCard.vue` | `components/ProductCard.vue` | 移到根目录 |
| `src/components/ProductList.vue` | `components/ProductList.vue` | 移到根目录 |
| `src/components/ShoppingCart.vue` | `components/ShoppingCart.vue` | 移到根目录 |
| `src/components/CommonNavBar.vue` | `components/CommonNavBar.vue` | 移到根目录 |
| `src/components/CartList.vue` | `components/CartList.vue` | 移到根目录 |
| `src/components/ProductDetailPopup.vue` | `components/ProductDetailPopup.vue` | 移到根目录 |
| `src/manifest.json` 内容 | 合并到根目录 `manifest.json` | uni-app 标准 |

### 需要修改的文件

| 文件 | 修改内容 |
|-----|---------|
| `vite.config.js` | 移除传统 Vite 模式，只保留 uni-app 配置 |
| `package.json` | 更新开发脚本为 `uni` 命令 |
| `pages/orders/orders.vue` | 修复 storage 统一使用问题 (lines 144, 175) |
| `pages/login/login.vue` | 检查 storage 使用 |
| `pages/token-login/token-login.vue` | 检查 storage 使用 |
| `pages/mine/mine.vue` | 检查 storage 使用 |
| `src/store/index.js` | 确认 `process.env.UNI_PLATFORM` 检测正确 |

### 需要修复的 API 引用问题

在以下文件中，有直接使用 `uni.setStorageSync` / `uni.getStorageSync` 的地方，应统一使用 `storage` API：

| 文件 | 行号 | 问题 |
|-----|------|------|
| `pages/orders/orders.vue` | 144 | `uni.getStorageSync('user_id')` |
| `pages/login/login.vue` | 90-92 | `uni.setStorageSync` x3 |
| `pages/token-login/token-login.vue` | 73-80 | `uni.setStorageSync` x4 |

**修复方案**：将直接使用 `uni.setStorageSync` / `uni.getStorageSync` 的地方改为使用 `storage.setItem()` / `storage.getItem()`

## 实施完成清单

### 已完成的步骤

- ✅ 删除`src/api/index.js` (废弃的 Axios 版本)
- ✅ 删除`src/index.html` (uni-app H5 自动生成)
- ✅ 删除`src/pages.json` (重复，根目录已有)
- ✅ 移动组件从 `src/components/` 到根目录 `components/`
- ✅ 保留 `src/manifest.json`, `src/pages.json`, `src/App.vue`, `src/main.js` (uni-app CLI 需要)
- ✅ 复制 `pages/` 到 `src/pages/` (uni-app CLI 需要)
- ✅ 修复 `pages/orders/orders.vue` - 使用 `storage.getItem('user_id')`
- ✅ 修复 `pages/login/login.vue` - 使用 `storage.setItem()` 统一 API
- ✅ 修复 `pages/token-login/token-login.vue` - 使用 `storage.setItem()` 统一 API
- ✅ 更新 `vite.config.js` - 移除传统 Vite 模式，只保留 uni-app 配置
- ✅ 更新 `package.json` - 更新开发脚本为 `uni` 命令

### 构建验证结果

#### H5 平台
- ✅ `npm run dev:h5` 正常启动开发服务器 (http://localhost:3001)
- ✅ H5 API 请求正常 (通过 proxy)
- ✅ H5 导航正常 (uni.navigateTo, uni.switchTab 等)
- ✅ H5 storage 正常 (localStorage)

#### 小程序平台
- ✅ `npm run dev:mp-weixin` 构建成功 (dist/dev/mp-weixin)
- ✅ `npm run build:mp-weixin` 构建成功 (dist/build/mp-weixin)
- ✅ 生成的文件结构正确 (app.js, app.json, pages/, common/, store/, utils/)

### 问题解决记录

#### 关键发现：uni-app CLI 仍然需要 `src/` 目录下的文件

经过实际测试发现，uni-app CLI 仍然需要以下文件在 `src/` 目录下：
- `src/manifest.json` 必须存在
- `src/pages.json` 必须存在
- `src/App.vue` 必须存在
- `src/main.js` 必须存在
- `src/pages/` 必须存在（而不是根目录的 pages/）

**原因**：`@dcloudio/vite-plugin-uni` 插件在构建时硬编码了这些路径查找逻辑。

因此，根目录的 `App.vue`、`main.js`、`pages.json`、`manifest.json` 等文件需要保留作为副本或参考，实际运行时使用 `src/` 下的版本。

#### 小程序构建失败问题解决

**发现的问题**：`npm run dev:mp-weixin` 构建失败

**错误信息**：
```
Cannot find module '@dcloudio\uni-app\dist\uni-app.es.js'
```

**原因分析**：
- `@dcloudio/uni-app` 包是为 Vue 2 设计的，与 Vue 3 项目不兼容
- `@dcloudio/vite-plugin-uni` (alpha 版本) 在构建时会尝试查找 `@dcloudio/uni-app` 包
- 目前版本的 `@dcloudio/vite-plugin-` 插件与 Vue 3 的 uni-app 项目存在兼容性问题

**解决尝试**：
1. 尝试安装 `@dcloudio/uni-app@2.0.2-4080720251210002` - 失败（peer dependency 冲突）
2. 尝试使用社区插件 `@uni-helper/plugin-uni` - 仍然失败
3. 创建占位符文件 `node_modules/@dcloudio/uni-app/dist/uni-app.es.js` - 无法解决根本问题

**最终解决**：
安装匹配版本的 @dcloudio/uni-app 包：

```bash
npm install --save-dev @dcloudio/uni-app@3.0.0-alpha-5000120260211001 --legacy-peer-deps
```

**结果**：
- ✅ 小程序开发构建成功 (`npm run dev:mp-weixin`)
- ✅ 小程序生产构建成功 (`npm run build:mp-weixin`)

**当前依赖版本**：
```json
{
  "dependencies": {
    "vue": "^3.4.21"
  },
  "devDependencies": {
    "@dcloudio/types": "^3.4.29",
    "@dcloudio/uni-components": "^3.0.0-alpha-5000120260211001",
    "@dcloudio/uni-mp-weixin": "^3.0.0-alpha-5000120260211001",
    "@dcloudio/uni-app": "^3.0.0-alpha-5000120260211001",  // 新增
    "@dcloudio/vite-plugin-uni": "^3.0.0-alpha-5000120260211001",
    "@vitejs/plugin-vue": "^5.0.5",
    "vite": "5.2.8"
  }
}
```

## 最终目录最终结构

```
OrderEase-FrontUI/
├── pages/                      # uni-app 页面目录
│   ├── index/index.vue         # 首页
│   ├── orders/orders.vue       # 订单页
│   ├── mine/mine.vue           # 我的页
│   ├── login/login.vue         # 登录页
│   ├── register/register.vue   # 注册页
│   └── token-login/token-login.vue
├── static/                     # 静态资源
│   └── tabbar/                 # TabBar 图标
├── components/                 # 全局组件
│   ├── CategoryList.vue
│   ├── ProductCard.vue
│   ├── ProductList.vue
│   ├── ShoppingCart.vue
│   ├── CommonNavBar.vue
│   ├── CartList.vue
│   └── Product
DetailPopup.vue
├── src/                        # 源代码目录
│   ├── manifest.json           # uni-app 需要
│   ├── pages.json              # uni-app 需要
│   ├── pages/                 # uni-app 需要
│   │   ├── index/
│   │   ├── orders/
│   │   ├── mine/
│   │   ├── login/
│   │   ├── register/
│   │   └── token-login/
│   ├── App.vue                 # uni-app 需要
│   ├── main.js                 # uni-app 需要
│   ├── utils/                  # 工具类
│   │   ├── api.js              # uni.request 封装
│   │   ├── image.js            # 图片处理
│   │   └── constants.js        # 常量
│   ├── store/                  # 统一存储
│   │   └── index.js            # storage API
│   └── assets/                 # 静态资源
│       ├── logo.svg
│       ├── main.css
│       ├── base.css
│       ├── theme-blue-orange.css
│       └── animations.css
├── App.vue                     # 应用入口
├── main.js                     # 入口文件
├── pages.json                  # 页面路由配置
├── manifest.json               # 应用配置
├── vite.config.js              # Vite 配置 (uni-app 专用)
└── package.json                # 项目配置
```

## 关键修改点总结

### 1. vite.config.js - 移除混合模式
**当前问题**: 同时支持 uni-app 和传统 Vite 模式
**修复方案**: 只保留 uni-app 配置，移除条件判断

### 2. package.json - 更新脚本命令
**当前问题**: 使用 `vite` 和 `uni` 混合命令
**修复方案**:
```json
"scripts": {
  "dev:h5": "uni -p h5",
  "dev:mp-weixin": "uni -p mp-weixin",
  "build:h5": "uni build -p h5",
  "build:mp-weixin": "uni build -p mp-weixin"
}
```

### 3. Storage 统一使用
**当前问题**: 部分文件直接使用 `uni.setStorageSync`，部分使用 `storage` API
**修复方案**: 全部统一使用 `src/store/index.js` 导出的 `storage` API

### 4. 小程序构建问题
**当前问题**: 缺少 `@dcloudio/uni-app` 包
**修复方案**: 安装 `@dcloudio/uni-app@3.0.0-alpha-5000120260211001`

### 5. 目录结构
**重要发现**：uni-app CLI 仍然需要 `src/` 目录下的文件
- `src/manifest.json`、`src/pages.json`、`src/App.vue`、`src/main.js`、`src/pages/` 必须存在
- 根目录的对应文件作为副本或参考
