# 微信小程序静默登录实现方案

## 一、问题分析

### 当前实现的问题
1. **缺少自动静默登录机制**：小程序启动时不会自动登录
2. **Token 过期处理**：Token 过期后只能手动重新授权
3. **用户体验差**：每次 Token 过期都需要用户手动操作
4. **依赖用户主动授权**：没有实现真正的"一次授权，永久使用"体验

### 标准微信小程序登录流程

| 层级 | 触发方式 | 目的 | 是否需要用户操作 |
|------|---------|------|------------------|
| **静默登录** | 小程序启动时自动执行 | `uni.login()` → 获取 code → 后端换取 openid/session_key → 维持会话 | ❌ 无感 |
| **用户授权** | 首次或需要时触发 | 获取头像、昵称等用户信息 | ✅ 需要用户同意 |

## 二、解决方案

### 核心改进
1. **增加 App.vue 启动时的静默登录逻辑**
2. **添加后端静默登录接口**
3. **实现 Token 自动续期机制**
4. **优化用户登录状态管理**

### 技术架构

```
小程序启动 (App.vue onLaunch)
      ↓
【自动】uni.login() → 获取 code
      ↓
POST /user/silent-login { code }
      ↓
后端：code → openid → 查找用户 → 返回新 token
      ↓
前端：更新本地存储的 token
      ↓
用户正常使用，无需感知
```

## 三、详细实现步骤

### 步骤 1：前端修改 - App.vue

**文件**：`src/App.vue`

**修改内容**：
1. 导入必要的工具函数
2. 在 `onAppLaunch` 中添加静默登录逻辑
3. 实现静默登录函数

```javascript
<script setup>
import { onAppLaunch, onAppShow, onAppHide } from '@dcloudio/uni-app'
import { storage } from '@/store/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { wxLogin } from '@/utils/wechat-auth'
import { userWeChatLogin } from '@/utils/api'

// 原有的 URL 参数处理逻辑...

/**
 * 静默登录 - 小程序启动时自动执行
 */
const silentLogin = async () => {
  // #ifdef MP-WEIXIN
  try {
    console.log('[静默登录] 开始执行')
    
    // 获取微信登录 code
    const code = await wxLogin()
    
    // 调用后端静默登录接口
    const response = await userWeChatLogin({
      code,
      silent: true // 标识为静默登录
    })
    
    if (response.data?.token) {
      // 更新存储的认证信息
      storage.setItem(STORAGE_KEYS.USER_ID, response.data.user?.id)
      storage.setItem(STORAGE_KEYS.USER_INFO, response.data.user)
      storage.setItem(STORAGE_KEYS.TOKEN, response.data.token)
      console.log('[静默登录] 成功')
    } else {
      console.log('[静默登录] 失败:', response.data?.error)
    }
  } catch (error) {
    console.error('[静默登录] 异常:', error)
    // 静默登录失败不影响小程序启动
  }
  // #endif
}

onAppLaunch((options) => {
  console.log('App Launch', options)

  // #ifdef H5
  handleUrlParams()
  // #endif

  // #ifndef H5
  handleMiniProgramParams(options?.query)
  // 小程序环境执行静默登录
  silentLogin()
  // #endif
})

onAppShow(() => {
  console.log('App Show')
  // 每次小程序显示时也检查登录状态
  // #ifndef H5
  silentLogin()
  // #endif
})

onAppHide(() => {
  console.log('App Hide')
})
</script>
```

### 步骤 2：前端修改 - wechat-auth.js

**文件**：`src/utils/wechat-auth.js`

**修改内容**：
1. 导出 `checkSession` 函数（已存在，确认可用）

```javascript
/**
 * 检查微信登录状态
 * @returns {Promise<boolean>} 返回登录状态，true 表示已登录，false 表示未登录或已过期
 */
export const checkSession = () => {
  return new Promise((resolve) => {
    uni.checkSession({
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}
```

### 步骤 3：后端修改 - 添加静默登录接口

**文件**：`src/contexts/ordercontext/application/handlers/miniprogram_auth.go`

**修改内容**：
1. 修改 `MiniProgramLoginRequest` 结构体，增加 `Silent` 字段
2. 调整登录逻辑，支持静默登录模式

```go
// MiniProgramLoginRequest 小程序登录请求
type MiniProgramLoginRequest struct {
	Code     string     `json:"code" binding:"required"`
	Silent   bool       `json:"silent"` // 静默登录标识
	UserInfo *UserInfo  `json:"user_info"`
}

// WeChatMiniProgramLogin 微信小程序登录
func (h *MiniProgramAuthHandler) WeChatMiniProgramLogin(c *gin.Context) {
	var req MiniProgramLoginRequest
	if err := c.ShouldBindJSON(err); err != nil {
		// 错误处理...
		return
	}

	// 1. 通过 code 换取 openid 和 session_key
	sessionInfo, err := h.miniProgramClient.Code2Session(c.Request.Context(), req.Code)
	if err != nil {
		// 错误处理...
		return
	}

	// 2. 查找或创建用户
	// 静默登录模式下，不需要用户信息
	var userInfo *UserInfo
	if !req.Silent && req.UserInfo != nil {
		userInfo = req.UserInfo
	}
	
	user, isNewUser, err := h.findOrCreateUser(sessionInfo, userInfo)
	if err != nil {
		// 错误处理...
		return
	}

	// 3. 生成 JWT token
	token := generateToken(user)

	// 4. 返回结果
	c.JSON(http.StatusOK, gin.H{
		"message": "登录成功",
		"data": gin.H{
			"user":  user,
			"token": token,
		},
	})
}
```

### 步骤 4：前端修改 - API 拦截器优化

**文件**：`src/utils/api.js`

**修改内容**：
1. 优化 401 错误处理，自动触发静默登录

```javascript
function responseInterceptor(response) {
  const { statusCode, data, errMsg } = response

  if (statusCode === 401) {
    const url = response.config?.url || ''
    const isLoginRequest = url.includes('/user/login') || url.includes('/user/wechat-login')

    if (!isLoginRequest) {
      // Token 过期，尝试静默登录
      silentLogin().then(() => {
        // 登录成功后重新发起请求
        // 这里可以实现请求重放逻辑
      }).catch(() => {
        // 静默登录失败，跳转到登录页
        storage.removeItem(STORAGE_KEYS.TOKEN)
        storage.removeItem(STORAGE_KEYS.USER_INFO)
        uni.reLaunch({ url: '/pages/login/index' })
      })
    }
  }

  return {
    status: statusCode,
    data: data,
    headers: response.header
  }
}
```

### 步骤 5：前端修改 - 登录状态检查

**文件**：`src/pages/mine/mine.vue`

**修改内容**：
1. 优化登录状态检查逻辑
2. 支持自动刷新登录状态

```javascript
import { ref, computed, onMounted, onShow } from 'vue'
import { onShow as uniOnShow } from '@dcloudio/uni-app'
import { storage } from '@/store/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { checkSession } from '@/utils/wechat-auth'
import { silentLogin } from '@/utils/login-helper' // 新建工具函数

const isLoggedIn = computed(() => {
  return !!storage.getItem(STORAGE_KEYS.USER_ID)
})

// 检查登录状态
const checkLoginStatus = async () => {
  if (isLoggedIn.value) {
    const sessionValid = await checkSession()
    if (!sessionValid) {
      // 会话过期，尝试静默登录
      await silentLogin()
    }
  }
}

onShow(() => {
  checkLoginStatus()
  refreshUserInfo()
})
```

### 步骤 6：创建登录辅助工具

**文件**：`src/utils/login-helper.js`（新建）

**内容**：
```javascript
/**
 * @fileoverview 登录相关辅助函数
 * @module utils/login-helper
 */
import { wxLogin } from './wechat-auth'
import { userWeChatLogin } from './api'
import { storage } from '@/store/storage'
import { STORAGE_KEYS } from './constants'

/**
 * 静默登录
 * @returns {Promise<boolean>} 是否登录成功
 */
export const silentLogin = async () => {
  try {
    const code = await wxLogin()
    const response = await userWeChatLogin({
      code,
      silent: true
    })

    if (response.data?.token) {
      storage.setItem(STORAGE_KEYS.USER_ID, response.data.user?.id)
      storage.setItem(STORAGE_KEYS.USER_INFO, response.data.user)
      storage.setItem(STORAGE_KEYS.TOKEN, response.data.token)
      return true
    }
    return false
  } catch (error) {
    console.error('静默登录失败:', error)
    return false
  }
}

/**
 * 检查并刷新登录状态
 * @returns {Promise<boolean>} 当前是否登录
 */
export const checkAndRefreshLogin = async () => {
  if (storage.getItem(STORAGE_KEYS.TOKEN)) {
    // 已有 token，检查会话状态
    const sessionValid = await checkSession()
    if (!sessionValid) {
      // 会话过期，尝试静默登录
      return await silentLogin()
    }
    return true
  } else {
    // 无 token，尝试静默登录
    return await silentLogin()
  }
}
```

## 四、测试验证

### 测试步骤

1. **首次登录**：
   - 打开小程序，点击"微信授权登录"
   - 完成授权流程
   - 确认本地存储有 token、user_id、user_info

2. **重新进入**：
   - 关闭小程序
   - 重新打开小程序
   - 检查控制台是否有"静默登录"日志
   - 确认无需手动操作即可进入首页

3. **Token 过期**：
   - 手动清除本地存储的 token
   - 重新打开小程序
   - 检查是否自动执行静默登录并获取新 token

4. **网络异常**：
   - 断开网络连接
   - 打开小程序
   - 确认静默登录失败但不影响小程序启动

### 预期结果

| 测试场景 | 预期行为 |
|---------|----------|
| 首次启动 | 自动执行静默登录，获取 token |
| 重新进入 | 自动执行静默登录，维持登录状态 |
| Token 过期 | 自动执行静默登录，刷新 token |
| 网络异常 | 静默登录失败，不影响小程序启动 |

## 五、注意事项

### 安全性
1. **AppSecret 保护**：后端配置文件中的 AppSecret 必须保密
2. **SessionKey 不泄露**：SessionKey 仅用于服务端解密，不返回给前端
3. **Code 一次性**：微信 code 只能使用一次，重复使用会失败

### 性能优化
1. **防抖处理**：避免频繁调用 `uni.login()`
2. **缓存策略**：合理设置 JWT token 的过期时间
3. **网络优化**：在网络差的环境下，静默登录失败不应阻塞小程序启动

### 错误处理
1. **网络错误**：静默登录失败时，应优雅降级，不影响用户使用
2. **微信 API 错误**：处理微信返回的各种错误码
3. **后端错误**：处理后端返回的错误信息，提供友好的用户提示

## 六、总结

通过实现静默登录机制，小程序可以：

1. **提升用户体验**：首次授权后，后续使用无需重复操作
2. **提高系统稳定性**：自动处理 Token 过期问题
3. **符合微信生态**：遵循微信小程序的标准登录流程
4. **增强安全性**：OpenID 只在后端使用，避免前端暴露用户唯一标识

此方案完全符合微信小程序的设计理念，为用户提供了"一次授权，永久使用"的无缝体验。
