# 部署架构说明：H5 与微信小程序

本文档详细说明 OrderEase-FrontUI 项目中 H5 版本和微信小程序版本在部署和运行方式上的差异。

## 概述

OrderEase-FrontUI 基于 uni-app 框架，使用单一代码库同时支持 H5 Web 应用和微信小程序两个平台。虽然代码逻辑相同，但两个平台的部署和运行方式完全不同。

## 部署方式对比

| 维度 | H5 版本 | 微信小程序版本 |
|------|---------|---------------|
| **运行环境** | 浏览器 (Chrome, Safari, etc.) | 微信 App 内的 WebView |
| **托管方式** | 自托管 (需要自己的服务器) | 微信平台托管 |
| **部署流程** | 构建静态文件 → 部署到服务器 | 构建代码 → 上传微信开发者工具 → 提交审核 → 发布后由微信托管 |
| **访问方式** | HTTP/HTTPS URL | 微信 App 内打开 |
| **服务器需求** | 需要 (Nginx/Docker/CDN) | 不需要 |
| **更新方式** | 重新部署静态文件 | 提交新版本审核 |
| **URL 路径** | 支持路径前缀 (`/order-ease-iui/`) | 无 URL 概念 |

## H5 部署详解

### 部署架构

H5 版本作为独立的微服务部署，适合容器化或静态文件部署。

```
┌─────────────────────────────────────────────────┐
│               用户浏览器                         │
└────────────────┬────────────────────────────────┘
                 │ HTTP/HTTPS
                 ▼
┌─────────────────────────────────────────────────┐
│  Web 服务器 (Nginx/Apache/Docker)              │
│  ┌──────────────────────────────────────────┐  │
│  │ Location: /order-ease-iui/               │  │
│  │ ┌────────────────────────────────────┐  │  │
│  │ │  H5 静态文件 (dist/h5/)            │  │  │
│  │ │  - index.html                      │  │  │
│  │ │  - assets/ (JS, CSS, images)       │  │  │
│  │ └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 部署选项

#### 1. Docker 容器部署

```bash
# 构建镜像
docker build -t order-ease-frontend .

# 运行容器
docker run -d -p 3001:80 --name order-ease-app order-ease-frontend

# 访问地址
http://localhost:3001/order-ease-iui/
```

#### 2. Docker Compose 部署

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

#### 3. 静态文件部署到 Nginx

```bash
# 1. 构建 H5 版本
npm run build:h5
# 输出目录: dist/h5/

# 2. 部署到 Nginx
# 将 dist/h5/ 目录复制到 Nginx 静态资源目录

# 3. 配置 Nginx
location /order-ease-iui/ {
    alias /path/to/dist/h5/;
    index index.html;
    try_files $uri $uri/ /order-ease-iui/index.html;
}
```

#### 4. 部署到 CDN

```bash
# 1. 构建 H5 版本
npm run build:h5

# 2. 上传 dist/h5/ 目录到 CDN
# 3. 配置 CDN 回源规则
```

### H5 Base Path 配置

H5 使用 `/order-ease-iui/` 作为基础路径前缀。

**配置文件**：`vite.config.js`

```javascript
export default defineConfig(({ command, mode }) => {
  const platform = process.env.UNI_PLATFORM || 'h5'
  const isH5 = platform === 'h5'

  return {
    base: isH5 ? '/order-ease-iui/' : '/',
    // ...
  }
})
```

**使用 `/order-ease-iui/` 前缀的原因**：

统一部署架构下，多个服务共享同一域名，使用不同的路径前缀区分：

```
http://your-domain.com/
├── /api/order-ease/v1/          # 后端 API
├── /order-ease-adminiui/         # 管理后台 UI
└── /order-ease-iui/              # 客户端 H5
```

这种架构的优势：
- 统一域名管理
- 跨域请求更简单 (同源策略)
- 代理配置更集中
- 便于 Nginx 负载均衡和缓存配置

## 微信小程序部署详解

### 部署架构

微信小程序运行在微信 App 内，由微信平台提供托管服务。

```
┌─────────────────────────────────────────────────┐
│               微信 App                            │
│  ┌──────────────────────────────────────────┐  │
│  │  微信小程序运行时 (WeChat Runtime)       │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  OrderEase 小程序                   │  │  │
│  │  │  - pages/                          │  │  │
│  │  │  - components/                     │  │  │
│  │  │  - static/                         │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                 │ API 调用
                 ▼
┌─────────────────────────────────────────────────┐
│  OrderEase 后端 API                              │
│  http://your-domain.com/api/order-ease/v1/     │
└─────────────────────────────────────────────────┘
```

### 部署流程

#### 1. 开发阶段

```bash
# 构建开发版本
npm run dev:mp-weixin
# 输出目录: dist/dev/mp-weixin/

# 使用微信开发者工具打开 dist/dev/mp-weixin/ 目录
# 进行调试和测试
```

#### 2. 生产部署

```bash
# 1. 构建生产版本
npm run build:mp-weixin
# 输出目录: dist/build/mp-weixin/

# 2. 使用微信开发者工具打开 dist/build/mp-weixin/ 目录

# 3. 在开发者工具中点击"上传"
#    - 输入版本号 (如: 1.0.0)
#    - 输入项目备注

# 4. 登录微信公众平台 (https://mp.weixin.qq.com)
#    进入"管理后台" → "版本管理"

# 5. 找到刚上传的版本，点击"提交审核"

# 6. 审核通过后，点击"全量发布"
#    或设置为"体验版"供内测用户使用
```

### 小程序无 Base Path

微信小程序不支持 URL 路径配置，原因：

1. **运行环境不同**：小程序运行在微信 App 内，不是 Web 浏览器
2. **路由系统独立**：使用微信自己的路由系统 (`pages.json` 定义)
3. **无 URL 概念**：小程序没有 HTTP/HTTPS URL 的概念
4. **微信托管**：整个应用由微信平台托管，无需路径前缀

**路由代码** (在 `pages.json` 中定义)：

```json
{
  "pages": [
    {"path": "pages/index/index", "style": {"navigationBarTitleText": "首页"}},
    {"path": "pages/orders/orders", "style": {"navigationBarTitleText": "订单"}},
    {"path": "pages/mine/mine", "style": {"navigationBarTitleText": "我的"}}
  ]
}
```

**导航代码** (使用 uni-app API)：

```javascript
// 跳转到登录页
uni.navigateTo({ url: '/pages/login/login' })

// 切换到首页 (Tab)
uni.switchTab({ url: '/pages/index/index' })

// 重定向到订单页
uni.redirectTo({ url: '/pages/orders/orders' })
```

## 路由兼容性

虽然 H5 和小程序的部署方式不同，但代码可以保持一致。

### uni-app 自动处理

| 配置/代码 | H5 行为 | 小程序行为 |
|-----------|----------|-----------|
| `vite.config.js` 中的 `base` | 影响 H5 静态资源路径 | 无影响 (不编译此配置) |
| `uni.navigateTo({ url: '/pages/xxx' })` | 路由跳转 (可能带 hash) | 直接路由跳转 |
| 静态资源引用 (`@/assets/xxx.png`) | 自动添加 `/order-ease-iui/` 前缀 | 直接打包 |
| API 请求 | 使用 `constants.js` 中的地址 | 使用 `constants.js` 中的地址 |

### 路由跳转示例

```javascript
// 以下代码在 H5 和小程序中都能正常工作

uni.navigateTo({ url: '/pages/login/login' })
uni.switchTab({ url: '/pages/index/index' })
uni.redirectTo({ url: '/pages/orders/orders' })
uni.reLaunch({ url: '/pages/mine/mine' })
```

**H5 中的实际 URL**：
```
http://localhost:3001/order-ease-iui/#/pages/login/login
```

**小程序中的行为**：
```
直接打开 pages/login/login 页面 (无 URL)
```

## 开发和测试

### H5 开发

```bash
# 启动开发服务器
npm run dev:h5

# 访问地址
http://localhost:3001/order-ease-iui/

# 特性：
# - 热重载
# - 开发者工具 (Chrome DevTools)
# - 代理 /api 到后端
```

### 小程序开发

```bash
# 构建代码
npm run dev:mp-weixin

# 1. 打开微信开发者工具
# 2. 选择"小程序"项目
# 3. 导入项目，选择项目目录: dist/dev/mp-weixin/
# 4. 点击"编译"查看效果

# 特性：
# - 微信开发者工具调试
# - 真机预览 (扫码)
# - 微信 API 测试
```

## 常见问题

### Q1: H5 能去掉 `/order-ease-iui/` 前缀吗？

**A**: 可以，修改 `vite.config.js` 中的 `base` 配置：
```javascript
base: '/',  // 改为根路径
```
但需要同步修改 Nginx 配置和部署流程。

### Q2: 小程序支持 HTTPS URL 参数吗？

**A**: 支持。小程序可以通过 URL 参数启动：
```
# 微信内打开小程序链接
weixin://dl/business/?t=xxx&shop_id=123&user_id=456
```

### Q3: 如何区分当前运行平台？

**A**: 使用条件编译：

```javascript
// #ifdef H5
console.log('运行在 H5 浏览器')
// #endif

// #ifdef MP-WEIXIN
console.log('运行在微信小程序')
// #endif

// #ifdef H5
export const IS_H5 = true
// #endif
// #ifdef MP-WEIXIN
export const IS_H5 = false
// #endif
```

### Q4: 静态资源路径在不同平台如何处理？

**A**: uni-app 编译器自动处理：

```javascript
// 代码中直接使用相对路径
<image src="@/static/logo.png" />

// H5 编译后: <image src="/order-ease-iui/static/logo.png" />
// 小程序编译后: <image src="static/logo.png" />
```

## 总结

- **H5**：自托管微服务，需要服务器，使用 `/order-ease-iui/` 前缀实现统一部署
- **小程序**：微信平台托管，无需服务器，无 URL 路径概念
- **代码复用**：使用 uni-app 框架实现单一代码库，平台差异通过编译配置处理
- **路由兼容**：uni-app 自动处理不同平台的路由差异，开发代码保持一致

## 参考文件

- `vite.config.js` - H5 base path 配置
- `pages.json` - 小程序页面路由配置
- `nginx.conf` - H5 Nginx 部署配置
- `Dockerfile` - Docker 容器配置
