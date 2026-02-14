# 微信小程序授权登录流程说明

## 概述

本文档描述 OrderEase-FrontUI 项目中微信小程序授权登录的完整实现流程，包括前端与微信 API、服务端的交互方式。

## 授权登录流程

```
用户点击"微信授权登录"
      ↓
1. 调用 uni.login() 获取微信 code
      ↓
2. 调用 uni.getUserProfile() 获取用户授权信息
   - nickName (昵称)
   - avatarUrl (头像)
   - encryptedData, iv (加密数据)
   - signature (签名)
      ↓
3. 调用后端接口 POST /user/wechat-login
      ↓
4. 后端处理并返回 { user, token }
      ↓
5. 存储用户信息到本地 (user_id, user_info, token)
      ↓
6. 跳转页面 (返回上一页或首页)
```

## 前端实现

### 1. 授权入口

**文件**: `src/pages/login/login.vue`

```vue
<template>
  <!-- 微信环境显示授权登录按钮 -->
  <button @click="handleWeChatLogin">微信授权登录</button>
</template>

<script setup>
import { handleWeChatLogin } from '@/composables/useAuth.js'
</script>
```

### 2. 核心授权逻辑

**文件**: `src/composables/useAuth.js`

```javascript
// 微微信登录处理函数
export const handleWeChatLogin = async () => {
  try {
    // 步骤 1：获取微信登录 code
    const code = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => {
          if (res.code) {
            resolve(res.code)
          } else {
            reject(new Error('获取微信登录 code 失败'))
          }
        },
        fail: reject
      })
    })

    // 步骤 2：获取用户授权信息
    const userInfo = await new Promise((resolve, reject) => {
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve({
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl,
            gender: res.userInfo.gender,
            encryptedData: res.encryptedData,
            iv: res.iv,
            rawData: res.rawData,
            signature: res.signature
          })
        },
        fail: () => reject(new Error('用户拒绝授权'))
      })
    })

    // 步骤 3：调用后端接口
    const response = await userWeChatLogin({ code, userInfo })

    // 步骤 4：处理登录成功
    handleLoginSuccess(response)
    return true
  } catch (error) {
    // 错误处理
    if (error.message === '用户拒绝授权') {
      uni.showToast({ title: '您取消了授权', icon: 'none' })
    } else {
      uni.showToast({ title: '微信登录失败，请重试', icon: 'none' })
    }
    return false
  }
}
```

### 3. 登录成功处理

```javascript
// 登录成功后的处理
const handleLoginSuccess = (response) => {
  if (response.data?.message === '登录成功') {
    // 存储用户信息
    storage.setItem('user_id', response.data.user.id)
    storage.setItem('user_info', response.data.user)
    storage.setItem('token', response.data.token)

    // 显示成功提示
    uni.showToast({ title: '登录成功', icon: 'success' })

    // 页面跳转
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      uni.switchTab({ url: '/pages/index/index' })
    }
    return true
  }
  return false
}
```

### 4. API 接口定义

**文件**: `src/utils/api.js`

```javascript
// 微信小程序授权登录
export const userWeChatLogin = (wechatData) => {
  return api.post('/user/wechat-login', wechatData)
}
```

## 服务端接口规范

### 请求接口

**URL**: `POST /api/order-ease/v1/user/wechat-login`

### 请求参数

```json
{
  "code": "071aBcGa1w9Jl2F...",        // 微信登录 code
  "nickName": "张三",                   // 用户昵称
  "avatarUrl": "https://...",           // 用户头像 URL
  "gender": 1,                        // 性别 (0:未知, 1:男, 2:女)
  "encryptedData": "CiyzA1...",         // 加密的用户信息
  "iv": "r7B20Kk...",                 // 加密向量
  "rawData": "{\"nickName\":\"张三\",...}", // 原始数据字符串
  "signature": "3d3b7f18..."          // 数据签名
}
```

### 响应数据

```json
{
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "zhangsan",
      "nickName": "张三",
      "avatarUrl": "https://...",
      "gender": 1,
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "createTime": "2024-01-01T00:00:00"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 错误响应

```json
{
  "message": "登录失败，微信 code 无效",
  "code": 4001
}
```

## 服务端实现指南

### 1. 配置微信小程序

```javascript
// 微信小程序配置
const WECHAT_CONFIG = {
  appId: 'your_appid',              // 小程序 AppID
  appSecret: 'your_appsecret',        // 小程序 AppSecret
  apiBaseUrl: 'https://api.weixin.qq.com'
}
```

### 2. 验证微信 code

```javascript
// 步骤 1：通过 code 换取 session_key 和 openid
async function getSessionInfo(code) {
  const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: {
      appid: WECHAT_CONFIG.appId,
      secret: WECHAT_CONFIG.appSecret,
      js_code: code,
      grant_type: 'authorization_code'
    }
  })

  const { openid, session_key, unionid } = response.data
  return { openid, session_key, unionid }
}
```

### 3. 解密用户信息

```javascript
// 步骤 2：使用 session_key 解密 encryptedData
const crypto = require('crypto')

function decryptUserInfo(encryptedData, iv, session_key) {
  const decipher = crypto.createDecipheriv(
    'aes-128-cbc',
    Buffer.from(session_key, 'base64'),
    Buffer.from(iv, 'base64')
  )
  decipher.setAutoPadding(false)
  const decrypted = decipher.update(Buffer.from(encryptedData, 'base64'))
  decrypted.concat(decipher.final())

  return JSON.parse(decrypted.toString('utf8'))
}
```

### 4. 创建或查找用户

```javascript
// 步骤 3：根据 openid 查找或创建用户
async function findOrCreateUser(openid, userInfo) {
  let user = await db.users.findOne({ openid })

  if (!user) {
    // 新用户，创建账户
    user = await db.users.create({
      openid,
      username: generateUsername(),     // 生成唯一用户名
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      createTime: new Date()
    })
  } else {
    // 已存在用户，更新信息
    user = await db.users.update(user.id, {
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender
    })
  }

  return user
}
```

### 5. 生成 JWT Token

```javascript
// 步骤 4：生成认证 token
const jwt = require('jsonwebtoken')

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, openid: user.openid },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}
```

### 6. 完整接口实现

```javascript
// 完整的微信登录接口
async function wechatLogin(req, res) {
  try {
    const { code, nickName, avatarUrl, gender, encryptedData, iv, rawData, signature } = req.body

    // 1. 验证必要参数
    if (!code || !encryptedData || !iv) {
      return res.status(400).json({ message: '缺少必要参数' })
    }

    // 2. 获取微信 session 信息
    const { openid, session_key } = await getSessionInfo(code)

    // 3. 解密（可选：验证用户信息）
    // const decryptedUserInfo = decryptUserInfo(encryptedData, iv, session_key)

    // 4. 查找或创建用户
    const user = await findOrCreateUser(openid, {
      nickName, avatarUrl, gender
    })

    // 5. 生成 JWT token
    const token = generateToken(user)

    // 6. 返回结果
    res.json({
      message: '登录成功',
      data: { user, token }
    })
  } catch (error) {
    console.error('微信登录失败:', error)
    res.status(500).json({ message: '登录失败' })
  }
}
```

## 小程序配置

**文件**: `src/manifest.json`

```json
{
  "mp-weixin": {
    "appid": "",                           // ⚠️ 需要配置真实 AppID
    "setting": {
      "urlCheck": false,                    // 开发时关闭域名校验
      "es6": true,
      "enhance": true,
      "postcss": true,
      "minified": true
    },
    "usingComponents": true,
    "permission": {
      "scope.userLocation": {
        "desc": "用于获取配送地址"
      }
    },
    "requiredPrivateInfos": ["getUserProfile"],  // 声明需要用户信息权限
    "lazyCodeLoading": "requiredComponents"
  }
}
```

### 配置说明

- `appid`: 小程序的唯一标识，需要到微信公众平台注册获取
- `urlCheck`: 生产环境应设为 `true`
- `requiredPrivateInfos`: 必须声明 `getUserProfile` 才能调用 `uni.getUserProfile()`

## 数据存储

**文件**: `src/store/index.js`

```javascript
// 统一存储封装，兼容 localStorage (H5) 和 uni.getStorageSync (小程序)

// 存储用户信息
storage.setItem('user_id', userId)
storage.setItem('user_info', userInfo)
storage.setItem('token', token)

// 获取用户信息
const token = storage.getItem('token')
const userInfo = storage.getItem('user_info')

// 清除用户信息（退出登录）
storage.removeItem('token')
storage.removeItem('user_id')
storage.removeItem('user_info')
```

## 错误处理

### 常见错误

| 错误 | 原因 | 处理方式 |
|------|------|----------|
| 用户拒绝授权 | 用户点击了"拒绝"按钮 | 提示用户需要授权才能使用 |
| code 无效 | code 已过期或伪造 | 提示重新登录 |
| network error | 网络请求失败 | 提示检查网络连接 |
| 微信 API 超时 | 微信服务响应慢 | 提示稍后重试 |

### 401 自动跳转登录

**文件**: `src/utils/api.js`

```javascript
// 响应拦截器
if (response.status === 401) {
  // 清除认证信息
  storage.removeItem('token')
  storage.removeItem('user_id')
  storage.removeItem('user_info')

  // 跳转登录页
  uni.redirectTo({ url: '/pages/login/login' })
}
```

## 测试指南

### 前端测试

```bash
# 1. 构建小程序
npm run build:mp-weixin

# 2. 使用微信开发者工具打开 dist/build/mp-weixin 目录

# 3. 配置 AppID（测试环境可用测试号）

# 4. 测试授权登录流程
# - 点击"微信授权登录"
# - 查看网络请求确认参数正确
# - 查看存储确认 token 和用户信息正确
```

### 服务端测试

```bash
# 使用 Postman 或 curl 测试

curl -X POST http://localhost:8080/api/order-ease/v1/user/wechat-login \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test_code",
    "nickName": "测试用户",
    "avatarUrl": "https://example.com/avatar.png",
    "gender": 1,
    "encryptedData": "...",
    "iv": "...",
    "rawData": "{}",
    "signature": "..."
  }'
```

## 安全注意事项

1. **AppSecret 保护**: 服务端的 AppSecret 必须妥善保管，不能泄露给前端
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **Token 过期**: JWT token 设置合理的过期时间（如 7 天）
4. **数据校验**: 服务端应校验 signature 确保数据未被篡改
5. **Code 一次性使用**: 微信 code 只能使用一次，重复使用会失败

## 参考文档

- [微信小程序登录流程](https://developers.weixin.qq.com/miniprogram/dev/OpenAPIDoc/user-login/login-by-weixin.html)
- [uni.getUserProfile](https://uniapp.dcloud.net.cn/api/providers/login.html#getuserprofile)
- [微信数据解密算法](https://developers.weixin.qq.com/miniprogram/dev/OpenAPIDoc/user-info/encrypted-data.html)
