# H5 与小程序代码融合状态文档

> 本文档记录 H5 和小程序代码融合的当前状态和维护指南

## 融合目标

确保 `OrderEase-FrontUI` 项目中 H5 和小程序使用同一套代码，便于维护和测试。

**为什么需要融合？**
- 一套代码便于维护，减少代码重复
- H5 测试更方便，可快速验证功能
- 小程序测试较繁琐，只需验证平台特定功能

---

## 代码融合状态

### ✅ 已完全融合的模块

| 模块 | 状态 | 文件路径 | 说明 |
|------|------|----------|------|
| **存储层** | ✅ 完美 | `src/store/index.js` | 使用 `process.env.UNI_PLATFORM` 检测平台，统一 API |
| **API层** | ✅ 完美 | `src/utils/api.js` | 使用 `uni.request`，自动注入参数和 token |
| **导航** | ✅ 完美 | 所有页面 | 统一使用 uni-app API（navigateTo, switchTab等） |
| **页面组件** | ✅ 完美 | `src/pages/` | 使用 uni-app 原生组件（view, text, image等） |
| **样式系统** | ✅ 完美 | `src/assets/` | CSS变量改为静态类，使用条件编译 |

### 📝 平台特定文件（正常）

| 文件 | 平台 | 说明 |
|------|------|------|
| `public/env-config.js` | H5 | H5 专用配置，使用 `window` 对象 |
| `index.html` | H5 | H5 入口页面 |
| `src/App.vue` | 通用 | 使用条件编译区分 H5 样式 |
| `src/assets/base.css` | 通用 | 使用条件编译区分 H5 样式 |

---

## 目录结构

```
OrderEase-FrontUI/
├── src/
│   ├── pages/              # 唯一页面源目录
│   │   ├── index/
│   │   ├── login/
│   │   ├── orders/
│   │   ├── mine/
│   │   ├── register/
│   │   └── token-login/
│   ├── store/index.js       # 统一存储层
│   ├── utils/
│   │   ├── api.js         # 统一 API 层
│   │   ├── image.js
│   │   └── constants.js
│   └── assets/            # 样式资源
├── static/                # 静态资源
│   └── tabbar/
├── components/            # 全局组件
├── public/               # H5 专用资源
├── pages.json            # uni-app 页面配置
├── manifest.json         # uni-app 应用配置
├── vite.config.js        # 构建配置
└── package.json
```

---

## 维护条件编译

当编写平台特定代码时，使用以下条件编译指令：

```javascript
// 仅在 H5 平台执行
// #ifdef H5
console.log('这是 H5 专属代码')
// #endif

// 仅在小程序平台执行
// #ifdef MP-WEIXIN
wx.login(...)
// #endif

// 在 H5 和小程序都执行
// #ifdef H5 || MP-WEIXIN
console.log('这是多平台代码')
// #endif
```

CSS 条件编译：
```css
/* 仅 H5 生效 */
/* #ifdef H5 */
body {
  font-size: 16px;
}
/* #endif */
```

---

## 开发与测试流程

### 1. 功能开发流程

1. **在 H5 上开发**（快速迭代）
   ```bash
   npm run dev:h5
   ```
   - 浏览器访问 http://localhost:3001
   - 使用浏览器 DevTools 调试
   - 快速验证功能逻辑

2. **功能验证通过后，在小程序测试**
   ```bash
   npm run dev:mp-weixin
   ```
   - 在微信开发者工具中打开 `dist/dev/mp-weixin`
   - 验证平台特定功能

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 新功能描述"
   ```

### 2. 样式开发注意事项

- **优先使用 `rpx` 单位**：在小程序和 H5 都能自适应
- **避免使用 CSS 变量**：小程序对 CSS 变量支持有限
- **H5 专属样式**：使用条件编译包裹
- **避免 px 单位**：在动画和定位中尽可能使用 rpx

### 3. API 开发注意事项

- **统一使用 `uni.request`**：不要使用 axios 或 fetch
- **使用统一存储层 `src/store/index.js`**：不要直接使用 localStorage 或 uni.setStorageSync
- **使用统一导航 API**：不要使用 window.location 或 Vue Router

---

## 常见问题

### Q: 为什么有些代码需要条件编译？

A: 以下场景需要条件编译：
- H5 浏览器特定 API（如 window、document）
- 小程序特定 API（如 wx.login、wx.getUserInfo）
- 平台特定的样式需求

### Q: 如何确认代码已完全融合？

A: 检查以下几点：
- 没有 Vue Router 导入和使用
- 没有 axios 或 fetch 直接调用
- 没有 localStorage/sessionStorage 直接调用
- 样式中主要使用 rpx 单位
- 使用统一的 storage API 和 API 层

### Q: 小程序构建失败怎么办？

A: 常见原因和解决：
1. **缺少 `@dcloudio/uni-app` 包**：运行 `npm install --save-dev @dcloudio/uni-app@3.0.0-alpha-5000120260211001`
2. **static 目录未复制**：检查 `vite.config.js` 中的 `copyStaticPlugin`
3. **pages.json 配置错误**：确保页面路径正确

### Q: H5 生产构建失败怎么办？

A: **已知问题**：`npm run build:h5` 目前会失败

**错误信息**：
```
"isInSSRComponentSetup" is not exported by "vue/runtime.esm-bundler.js"
```

**原因**：
- `@dcloudio/uni-app@3.0.0-alpha-5000120260211001` 与 Vue 3.4.x 存在兼容性问题
- uni-app alpha 版本仍在引用已移除的 Vue 内部 API

**临时解决方案**：
1. 使用开发模式 `npm run dev:h5` 进行功能验证和测试
2. 小程序生产构建 `npm run build:mp-weixin` 不受影响

**长期解决方案**：
等待 uni-app 发布与 Vue 3.4.x 兼容的稳定版本，或考虑使用 HBuilderX 官方IDE进行生产构建

**注意**：此问题仅影响 H5 生产构建，不影响：
- H5 开发模式（`npm run dev:h5`）
- 小程序开发构建（`npm run dev:mp-weixin`）
- 小程序生产构建（`npm run build:mp-weixin`）

---

## 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-02-13 | 完成 H5 与小程序代码融合审查和改进 |
| 2026-02-13 | 删除重复的 `/pages/` 目录 |
| 2026-02-13 | 替换 Vant CDN 资源为本地资源 |
| 2026-02-13 | 优化动画文件单位 px → rpx |
| 2026-02-13 | 创建本文档 |

---

## 贡献指南

当修改代码时，请确保：

1. **修改页面组件**：仅修改 `src/pages/` 下的文件
2. **添加样式**：使用 rpx 单位，避免 CSS 变量
3. **平台特定代码**：使用条件编译包裹
4. **测试**：先在 H5 测试，确认后再在小程序验证
