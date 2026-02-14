# 构建指南

## 概述

本文档说明 OrderEase-FrontUI 项目的构建配置、已知问题和解决方案。

## 构建命令

| 命令 | 说明 | 状态 |
|------|------|------|
| `npm run dev:h5` | H5 开发模式 | ⚠️ 已知问题 |
| `npm run dev:mp-weixin` | 小程序开发模式 | ✅ 可用 |
| `npm run build:h5` | H5 生产构建 | ⚠️ 已知问题 |
| `npm run build:mp-weixin` | 小程序生产构建 | ✅ 可用 |
| `npm run preview` | H5 预览构建 | ⚠️ 已知问题 |

## 当前构建状态

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

### ⚠️ H5 构建 - 已知问题

```bash
npm run build:h5
```

**错误信息**:
```
"isInSSRComponentSetup" is not exported by "node_modules/vue/dist/vue.runtime.esm-bundler.js"
```

**问题原因**: uni-app alpha 版本与 Vue 3.5.x 版本不兼容。

## 依赖版本问题

### 当前使用的版本

```json
{
  "vue": "3.5.28",
  "@dcloudio/uni-app": "^3.0.0-alpha-5000120260211001",
  "@dcloudio/uni-components": "^3.0.0-alpha-5000120260211001",
  "@dcloudio/uni-mp-weixin": "^3.0.0-alpha-5000120211001",
  "@dcloudio/vite-plugin-uni": "^3.0.0-alpha-5000120211001"
}
```

### 问题分析

uni-app alpha 版本期望 Vue 3.4.21，但当前安装的是 Vue 3.5.28。

- **Vue 3.5.28**: 最新稳定版本
- **uni-app alpha-5000120260211001**: 测试版本，硬依赖 Vue 3.4.21

## 解决方案

### 方案 1: 等待 uni-app 正式版（推荐）

uni-app alpha 版本尚未正式发布 H5 支持到 Vue 3.5。建议等待 uni-app 正式版发布。

### 方案 2: 使用兼容版本配置

如果需要同时构建 H5 和小程序，可以配置 Vue 3.4.21：

```json
{
  "dependencies": {
    "vue": "3.4.21"
  },
  "devDependencies": {
    "@dcloudio/types": "3.4.28"
  }
}
```

**安装命令**:
```bash
npm install vue@3.4.21 @dcloudio/types@3.4.28 --save-exact
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**注意**: 此配置下小程序构建成功，但 H5 仍然存在问题。

### 方案 3: 仅使用小程序开发

目前项目主要用于小程序开发，建议专注于小程序构建：

```bash
# 小程序开发
npm run dev:mp-weixin

# 小程序构建
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

### H5 输出目录结构（当前不可用）

```
dist/build/h5/
├── index.html           # 入口文件
├── assets/             # 编译后的资源
├── static/             # 静态资源
└── ...
```

## 常见问题

### Q1: H5 构建失败怎么办？

A: 当前 H5 构建存在已知兼容问题，建议使用小程序开发。如果必须构建 H5，可以尝试联系 uni-app 官方获取支持。

### Q2: 如何切换 Vue 版本？

A: 修改 `package.json` 中的版本号，然后重新安装依赖：

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

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

## 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-02-14 | 初始文档，记录 H5 构建兼容性问题 |
| 2026-02-14 | 添加微信授权登录功能 |

## 参考资料

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
