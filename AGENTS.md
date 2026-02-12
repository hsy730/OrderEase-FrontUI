# OrderEase-FrontUI 项目上下文

## 项目概述

OrderEase-FrontUI 是一个基于 Vue 3 和 uni-app 的跨平台移动点单系统前端项目，支持 H5 网页和微信小程序双平台部署。该项目是一个完整的商品点单系统，用户可以按类别浏览商品、选择规格选项加入购物车、提交订单。

## 技术栈

- **框架**: Vue 3 (Composition API, `<script setup>`)
- **跨平台**: uni-app (支持 H5 + 微信小程序)
- **构建工具**: Vite 5.x
- **HTTP 客户端**: Axios
- **UI 组件**: uni-app 原生组件为主（uni-ui 可选）
- **状态管理**: 统一存储 API（localStorage/uni.getStorageSync）

## 开发命令

```bash
# H5 开发
npm run dev               # 启动 H5 开发服务器（端口 3001）

# 微信小程序开发
npm run dev:mp-weixin     # 构建微信小程序（输出到 dist/dev/mp-weixin）

# 生产构建
npm run build             # 构建 H5 生产版本（输出到 dist/h5）
npm run build:mp-weixin   # 构建微信小程序生产版本
npm run build:prod        # 以生产模式构建 H5
npm run preview           # 本地预览生产构建
```

## Docker 部署

```bash
# 构建 Docker 镜像
docker build -t order-ease-frontend .

# 运行容器
docker run -d -p 3001:80 --name order-ease-app order-ease-frontend

# 或使用 docker-compose
docker-compose up -d
```

访问地址：`http://localhost:3001/`

## 核心架构概念

### 跨平台架构

项目使用 **uni-app** 构建单一代码库，可部署到：
- **H5**: Web 浏览器（开发: `npm run dev`，生产: `npm run build`）
- **微信小程序**: 微信生态（开发: `npm run dev:mp-weixin`，生产: `npm run build:mp-weixin`）

`vite.config.js` 中的构建配置根据 `UNI_PLATFORM` 环境变量自动检测平台。

### 路径配置

H5 应用部署在根路径 `/`（从 `/order-ease-iui/` 更新）。配置位置：
- `vite.config.js` - H5 构建的 `base: '/'`
- `pages.json` - uni-app 页面路由配置
- `nginx.conf` - location 块使用根路径

微信小程序使用 `pages.json` 中定义的路由系统。

### 认证流程

认证通过以下方式处理：
1. **基于 Token**: JWT token 使用统一存储 API（`storage.getItem('token')`）
2. **用户信息**: 使用统一存储 API（`storage.getItem('user_info')`）
3. **统一存储**: `src/store/index.js` 提供平台无关的存储：
   - H5: 使用 `localStorage`
   - 小程序: 使用 `uni.getStorageSync()`

其他认证方式：
- **Token 登录**: `/pages/token-login/token-login` 路由，用于基于临时店铺的认证
- **微信 OAuth**: 通过 URL 参数（`shop_id`、`user_id`）配置，存储到统一存储

### API 客户端架构

`src/api/index.js` 中的 Axios 实例具有自动参数注入：

**请求拦截器**:
- 如果存在 token，自动添加 `Authorization: Bearer <token>` 请求头
- 自动从统一存储注入 `shop_id` 和 `user_id` 到：
  - 无 body 的 GET 请求的查询参数
  - POST/PUT 的 JSON 数据请求体
  - FormData（文件上传）的查询参数

**响应拦截器**:
- 处理 401 错误，清除认证数据并跳转到登录页面（使用 uni-app 导航）

**API 基础 URL**: 在 `src/utils/constants.js` 中配置为 `http://127.0.0.1:8080/api/order-ease/v1`

### URL 参数处理

对于 H5：URL 参数（`shop_id`、`user_id`）被提取并存储到统一存储，用于店铺上下文和用户识别。

对于小程序：参数通过导航选项传递或直接存储。

### 商品规格系统

商品可以有可自定义的选项（`option_categories` 数组）：
- 每个类别有 `is_required`（布尔值）用于单选/多选行为
- 选项有 `price_adjustment`，会加到基础价格上
- 带有选项的购物车项目生成唯一的 `cartItemId` 键，基于选中的选项
- 完整实现参见 `src/views/home/index.vue` 中的选项选择和购物车管理

### 组件结构

**主布局**（`pages.json` + TabBar）:
- uni-app 导航系统，带 tab bar 配置
- 页面：首页（`pages/index/index`）、订单（`pages/orders/orders`）、我的（`pages/mine/mine`）

**关键页面**:
- `pages/index/index.vue` - 主点单页面，带类别侧边栏和商品网格
- `pages/orders/orders.vue` - 订单历史
- `pages/mine/mine.vue` - 用户个人资料
- `pages/login/login.vue` - 用户登录
- `pages/register/register.vue` - 用户注册
- `pages/token-login/token-login.vue` - 基于 Token 的登录

**关键组件**（位于 `src/components/`）:
- `CategoryList` - 商品类别左侧侧边栏
- `ProductList` - 商品网格，带加入购物车功能
- `ShoppingCart` - 底部购物车栏，带项目管理弹出窗口
- `ProductCard` - 单个商品展示
- `CommonNavBar` - 共享顶部导航栏

### 路径别名

`@` 别名配置为解析到 `src/` 目录（在 `vite.config.js` 中）。

### UI 库使用

**uni-app 原生组件**是跨平台兼容性的主要 UI 元素。关键组件：
- `view` - 容器元素（替代 `div`）
- `text` - 文本元素（替代 `span`）
- `image` - 图片元素（替代 `img`）
- `button` - 按钮元素（替代 `<van-button>`）
- `input` - 输入元素（替代 `<van-field>`）
- `scroll-view` - 可滚动容器
- `swiper` - 轮播/滑动组件

**uni-ui** 组件（可选）可用于更复杂的 UI 需求：
- `uni-popup` - 模态弹出窗口（替代 `<van-popup>`）
- `uni-number-box` - 数字步进器（替代 `<van-stepper>`）
- `uni-nav-bar` - 导航栏（替代 `<van-nav-bar>`）

添加新组件时，确保它们在 H5 和小程序平台上都能工作。

### 状态管理

使用统一存储进行持久化（目前无 Pinia/Vuex）：
- 组件级 `ref()` 和 `reactive()` 用于本地状态
- 统一 `storage` API 在 `src/store/index.js` 中，用于：
  - token、user_info、shop_id、user_id 持久化
  - 平台无关的存储（H5 上为 localStorage，小程序上为 uni.getStorageSync）
- Props/events 和 `$emit()` 用于组件通信

### 可用的 API 端点

位于 `src/api/index.js`：
- `getTagBoundProducts(params)` - 按类别获取商品
- `createOrder(data)` - 提交订单
- `getOrders(params)` - 带分页的订单历史
- `getShopDetail()` - 店铺信息
- `getOrderDetail(orderId)` - 单个订单详情
- `userRegister(userData)` - 用户注册
- `userLogin(userData)` - 标准登录
- `userLoginByToken(tokenData)` - 基于 Token 的登录
- `getTags()` - 类别列表

### 图片处理

后端图片使用 `src/utils/image.js` 中的工具：
```javascript
getImageUrl(imagePath) // 返回完整的后端 URL
```
将相对路径转换为 `${API_BASE_URL}/product/image?path=${imagePath}`。

### 购物车交互模式

**有规格的商品**:
- 始终显示"选规格"（Select Options）按钮
- 数量徽章显示购物车中所有变体的总数
- 点击打开选项弹出窗口
- 无法从商品列表中减少数量（必须使用购物车弹出窗口）

**无规格的商品**:
- 直接步进器控制增加/减少
- 更改立即同步到购物车

**购物车项目识别**:
同一商品的不同选项组合创建独立的购物车项目。唯一的 `cartItemId` 键包含序列化的选项数据：
```javascript
const getCartItemKey = (item) => {
  if (item.selectedOptions?.length > 0) {
    return `${item.id}-${JSON.stringify(sortedOptions)}`
  }
  return `${item.id}`
}
```

### 项目迁移状态

项目已成功从传统 H5 + Vue Router 迁移到 **uni-app 跨平台架构**。

**已完成的迁移步骤**:
1. ✅ 创建统一存储层（`src/store/index.js`）以实现跨平台兼容性
2. ✅ 合并工具文件并更新 API 层以使用统一存储
3. ✅ 将所有页面从 `src/views/` 迁移到 `pages/` 目录
4. ✅ 配置 `pages.json` 用于 uni-app 路由系统
5. ✅ 删除 Vue Router 依赖
6. ✅ 更新 H5 根路径部署的构建配置
7. ✅ 删除过时的 `src/views/` 和 `src/router/` 目录
8. ✅ 更新项目文档

**关键变更**:
- 所有导航现在使用 uni-app API（`uni.navigateTo`、`uni.switchTab` 等）
- 存储操作使用 `src/store/index.js` 中的统一 `storage` API
- 平台特定代码可使用条件编译：`// #ifdef H5` 或 `// #ifdef MP-WEIXIN`
- Vant 和 Element Plus 正逐步淘汰，改用 uni-app 原生组件

## 开发规范

### 代码风格
- 使用 Vue 3 Composition API 和 `<script setup>` 语法
- 使用 `ref()` 和 `reactive()` 进行响应式状态管理
- 组件使用 PascalCase 命名
- 文件名使用 kebab-case 命名（页面）或 PascalCase（组件）

### 条件编译
使用 uni-app 的条件编译来处理平台特定代码：
```javascript
// #ifdef H5
// H5 特定代码
// #endif

// #ifdef MP-WEIXIN
// 微信小程序特定代码
// #endif
```

### 导航 API
- 页面跳转：`uni.navigateTo({ url: '/pages/orders/orders' })`
- Tab 切换：`uni.switchTab({ url: '/pages/index/index' })`
- 返回上一页：`uni.navigateBack({ delta: 1 })`
- 页面重定向：`uni.redirectTo({ url: '/pages/login/login' })`

### 存储操作
始终使用 `src/store/index.js` 中的统一 `storage` API：
```javascript
import { storage } from '@/store'

// 设置
storage.setItem('key', value)

// 获取
const value = storage.getItem('key')

// 删除
storage.removeItem('key')

// 清除所有
storage.clear()
```

### API 调用
使用 `src/api/index.js` 中定义的 API 函数，会自动处理认证和参数注入。

## 注意事项

1. **路由系统**: 项目已完全迁移到 uni-app 路由系统，不再使用 Vue Router
2. **存储**: 必须使用统一存储 API，不能直接使用 localStorage
3. **导航**: 必须使用 uni-app 导航 API，不能使用 router.push 等
4. **UI 组件**: 优先使用 uni-app 原生组件，避免使用 Vant/Element Plus
5. **平台差异**: 编写代码时考虑 H5 和小程序的 API 差异
6. **条件编译**: 需要平台特定功能时使用条件编译指令
7. **图片路径**: 后端图片使用 `getImageUrl()` 工具函数转换

## 当前分支信息

- 当前分支: `feature/miniprogram`
- 最近提交: "完成H5和小程序融合改造 - 删除原生页面和路由，更新文档"
- 远程仓库: `git@github.com:hsy730/OrderEase-FrontUI.git`