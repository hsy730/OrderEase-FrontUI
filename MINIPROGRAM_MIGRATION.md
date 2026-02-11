# OrderEase 小程序改造文档

## 概述

本文档记录了 OrderEase 点单系统从 Vue 3 Web 应用改造为 uni-app 微信小程序的过程。

## 改造时间

2026年2月

## 技术栈变化

| 原技术 | 小程序技术 |
|--------|-----------|
| Vue 3 + Vue Router | uni-app (Vue 3) |
| Axios | uni.request |
| Vant / Element Plus | uni-app 原生组件 |
| localStorage | uni.getStorageSync / uni.setStorageSync |
| window.location | uni.navigateTo / uni.redirectTo |

## 项目结构变化

```
OrderEase-FrontUI/
├── App.vue                    # 应用入口（新增）
├── main.js                    # 小程序入口（新增）
├── manifest.json              # uni-app 配置（新增）
├── pages.json                 # 页面路由配置（新增）
├── uni.scss                   # 全局样式变量（新增）
│
├── pages/                     # 页面目录（新增）
│   ├── index/
│   │   └── index.vue          # 点单首页
│   ├── orders/
│   │   └── orders.vue         # 订单列表
│   ├── mine/
│   │   └── mine.vue           # 个人中心
│   ├── login/
│   │   └── login.vue          # 登录页
│   ├── register/
│   │   └── register.vue       # 注册页
│   └── token-login/
│       └── token-login.vue    # 令牌登录页
│
├── utils/                     # 工具目录（新增）
│   ├── api.js                 # API 请求封装（uni.request）
│   ├── constants.js           # API 常量
│   └── image.js               # 图片 URL 工具
│
├── assets/                    # 资源目录（新增）
│   ├── main.css               # 全局样式
│   └── theme-blue-orange.css  # 主题色样式
│
├── static/                    # 静态资源目录（新增）
│   └── tabbar/                # 底部导航图标
│
└── src/                       # 原Web项目（保留）
    ├── api/                   # 原 API 文件
    ├── components/            # 原组件
    ├── views/                 # 原页面
    └── ...
```

## API 请求适配

### 原 Axios 适配器改造

```javascript
// 原代码 (src/api/index.js - Axios)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
})
```

```javascript
// 新代码 (utils/api.js - uni.request)
function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: options.url.startsWith('http') ? options.url : `${API_BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: options.headers || {},
      success: (res) => resolve(responseInterceptor(res)),
      fail: (err) => reject(err)
    })
  })
}
```

### 本地存储适配

| 原方法 | 小程序方法 |
|--------|-----------|
| localStorage.getItem('key') | uni.getStorageSync('key') |
| localStorage.setItem('key', val) | uni.setStorageSync('key', val) |
| localStorage.removeItem('key') | uni.removeStorageSync('key') |

### 路由跳转适配

| 原方法 | 小程序方法 |
|--------|-----------|
| router.push('/path') | uni.navigateTo({ url: '/path' }) |
| router.replace('/path') | uni.redirectTo({ url: '/path' }) |
| router.push({ path, query }) | uni.navigateTo({ url: '/path?key=val' }) |

## 页面配置

### pages.json

```json
{
  "pages": [
    { "path": "pages/index/index", "style": { "navigationBarTitleText": "点单系统", "navigationStyle": "custom" } },
    { "path": "pages/orders/orders", "style": { "navigationBarTitleText": "我的订单", "navigationStyle": "custom" } },
    { "path": "pages/mine/mine", "style": { "navigationBarTitleText": "我的", "navigationStyle": "custom" } },
    { "path": "pages/login/login", "style": { "navigationBarTitleText": "登录" } },
    { "path": "pages/register/register", "style": { "navigationBarTitleText": "注册" } },
    { "path": "pages/token-login/token-login", "style": { "navigationBarTitleText": "令牌登录" } }
  ],
  "tabBar": {
    "color": "#7d7e80",
    "selectedColor": "#1989fa",
    "backgroundColor": "#ffffff",
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/orders/orders", "text": "订单" },
      { "pagePath": "pages/mine/mine", "text": "我的" }
    ]
  }
}
```

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | Web 开发模式 |
| `npm run dev:mp-weixin` | 小程序开发模式 |
| `npm run build` | Web 构建 |
| `npm run build:mp-weixin` | 小程序构建 |

## 已完成事项

- [x] 创建 uni-app 项目基础结构
- [x] 配置 manifest.json 和 pages.json
- [x] 创建 App.vue 应用入口
- [x] 创建 main.js 小程序入口
- [x] 适配 API 请求（uni.request 替代 axios）
- [x] 创建工具类（api.js, constants.js, image.js）
- [x] 创建 6 个功能页面
- [x] 配置底部导航栏
- [x] 适配本地存储 API
- [x] 样式单位转换（px → rpx）

## 待完成事项

- [ ] 添加 PNG 格式的 tabbar 图标（当前为 SVG）
- [ ] 修复页面中的组件引用路径
- [ ] 测试各页面功能
- [ ] 微信开发者工具调试
- [ ] 处理小程序特有的 API 限制
- [ ] 添加分包加载配置（如需要）

## 注意事项

### 1. 图标格式
小程序 tabbar 图标必须为 PNG 格式，不支持 SVG。需要将 `static/tabbar/` 下的 SVG 图标转换为 PNG。

### 2. 样式单位
小程序使用 rpx 作为响应式单位，原项目 px 需要转换（1px ≈ 2rpx 在 750px 设计稿下）。

### 3. 生命周期
小程序页面生命周期与 Vue 组件不同：
- Vue: `onMounted`, `onUnmounted`
- 小程序: `onLoad`, `onShow`, `onHide`, `onUnload`

### 4. API_BASE_URL
需要根据实际部署环境调整 `utils/constants.js` 中的 API 地址。

### 5. 路由参数
微信小程序路由参数需要通过字符串传递：
```javascript
// 原写法
router.push({ path: '/detail', query: { id: 123 } })

// 小程序写法
uni.navigateTo({ url: '/pages/detail/detail?id=123' })
```

## 开发工具

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 在 HBuilderX 中运行到微信开发者工具
3. 或使用 `npm run dev:mp-weixin` 构建后导入项目

## 扩展阅读

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [uni-app API 文档](https://uniapp.dcloud.net.cn/api/)
