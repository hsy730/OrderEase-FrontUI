# 构建指南

## 概述

本文档说明 OrderEase-FrontUI 项目的构建配置和解决方案。

## 构建命令

| 命令 | 说明 | 状态 |
|------|------|------|
| `npm run dev:h5` | H5 开发模式 | ✅可用 |
| `npm run dev:mp-weixin` | 小程序开发模式 | ✅可用 |
| `npm run build:h5` | H5 生产构建 | ✅可用 |
| `npm run build:mp-weixin` | 小程序生产构建 | ✅可用 |
| `npm run preview` | H5 预览构建 | ✅可用 |

## 当前构建状态

### ✅ H5 构建 - 成功

```bash
npm run build:h5
```

**输出目录**: `dist/build/h5`

**部署方式**:
1. 将 `dist/build/h5` 目录内容部署到 Web 服务器
2. 或使用 `npm run preview` 本地预览

**开发模式**:
```bash
npm run dev:h5
```
开发服务器默认运行在 `http://localhost:3001`

### ✅ 微信小程序构建 - 成功

```bash
npm run build:mp-weixin
```

**输出目录**: `dist/build/mp-weixin`

**使用方法**:
1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `dist/build/mp-weixin` 目录
4. 填入 AppID
5. 点击"导入"

**开发模式**:
```bash
npm run dev:mp-weixin
```
开发输出目录: `dist/dev/mp-weixin`

## 依赖版本

### 当前使用的版本

```json
{
  "vue": "3.2.47",
  "@dcloudio/types": "3.4.28",
  "@dcloudio/uni-app": "^3.0.0-alpha-5000120211001",
  "@dcloudio/uni-components": "^3.0.0-alpha-5000120211001",
  "@dcloudio/uni-mp-weixin": "^3.0.0-alpha-5000120211001",
  "@dcloudio/vite-plugin-uni": "^3.0.0-alpha-5000120211001"
}
```

### 版本说明

- **Vue 3.2.47**: 与 uni-app alpha 版本兼容，解决 H5 构建问题
- **uni-app alpha-5000120211001**: 测试版本，通过 postinstall 脚本修复 H5 兼容性

## H5 构建兼容性修复

### 问题说明

uni-app 3.0.0-alpha 版本的 H5 编译器代码中引用了 `isInSSRComponentSetup` 和 `injectHook` API，但这些 API 在 Vue 3.4.21 中不存在。

### 解决方案

通过以下步骤修复：

1. **降级 Vue 到 3.2.47** - 这个版本与 uni-app alpha 版本更兼容
2. **创建 postinstall 脚本** - `scripts/postinstall.js` 自动修复 node_modules 中的 `uni-app.es.js` 文件
3. **配置自动修复** - 在 `package.json` 中添加了 `postinstall` 钩子

### postinstall 脚本

每次 `npm install` 后，`scripts/postinstall.js` 会自动：

1. 移除 `isInSSRComponentSetup` 导入，替换为 `false`
2. 移除 `injectHook` 导入，替换为 `undefined`
3. 修复 node_modules 中的 `uni-app.es.js` 文件

### 验证修复

```bash
# 重新安装依赖，postinstall 会自动修复
npm install

# 测试 H5 构建
npm run build:h5

# 测试小程序构建
npm run build:mp-weixin
```

## 开发工具推荐

### 微信开发者工具

1. 下载: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 支持实时预览和调试
3. 提供模拟器查看不同设备效果

### HBuilderX

1. 下载: https://www.dcloud.io/hbuilderx.html
2. 官方推荐的 uni-app 开发工具
3. 内置编译器，支持热重载

## 条件编译

项目使用条件编译处理平台差异：

```vue
<!-- #ifdef H5 -->
H5 特定代码
<!-- #endif -->

<!-- #ifdef MP-WEIXIN -->
小程序特定代码
<!-- #endif -->

<!-- #ifndef H5 -->
非 H5 平台代码
<!-- #endif -->
```

## 构建输出说明

### 小程序输出目录结构

```
dist/build/mp-weixin/
├── app.json              # 小程序配置
├── app.js               # 小程序入口
├── app.wxss             # 全局样式
├── project.config.json   # 项目配置
├── pages/               # 页面文件
│   ├── index/
│   ├── orders/
│   └── mine/
└── static/              # 静态资源
```

### H5 输出目录结构

```
dist/build/h5/
├── index.html           # 入口文件
├── assets/             # 编译后的资源
├── static/             # 静态资源
└── ...
```

## 常见问题

### Q1: H5 构建失败怎么办？

A: 确保 Vue 版本为 3.2.47，并且已经运行 `npm install` 触发 postinstall 脚本修复：

```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 测试构建
npm run build:h5
```

### Q2: 为什么使用 Vue 3.2.47 而不是最新版？

A: uni-app 3.0.0-alpha 版本的 H5 编译器需要与特定 Vue 版本兼容。Vue 3.2.47 与当前 uni-app alpha 版本配合最稳定。

### Q3: 小程序构建成功但运行报错？

A: 检查以下项目：
1. 微信开发者工具版本是否最新
2. 基础库版本是否支持
3. AppID 是否正确配置
4. 网络权限是否开启

### Q4: 如何开发调试？

A: 小程序开发调试：
```bash
npm run dev:mp-weixin
```
然后使用微信开发者工具打开 `dist/dev/mp-weixin` 目录。

H5 开发调试：
```bash
npm run dev:h5
```
访问 `http://localhost:3001`

## 后续计划

uni-app 3.0 正式版发布后应考虑：
1. 升级到 uni-app 正式版
2. 移除 postinstall 修复脚本
3. 尝试升级 Vue 到最新稳定版

## 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-02-14 | 修复 H5 构建问题，添加 postinstall 脚本自动修复兼容性 |
| 2026-02-14 | 添加微信授权登录功能 |
| 2026-02-14 | 测试 Vue 3.4.21 降级，确认 H5 问题为 uni-app 自身问题 |
| 2026-02-14 | 初始文档，记录 H5 构建兼容性问题 |

## 参考资料

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
