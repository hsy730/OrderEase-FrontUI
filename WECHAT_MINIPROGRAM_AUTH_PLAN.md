# 微信小程序认证实现方案

## 一、现状分析

### 1.1 前端现状

**已有文件与功能：**
- `src/composables/useAuth.js`: 包含 `handleWeChatLogin` 函数
  - 调用 `uni.login()` 获取 code
  - 调用 `uni.getUserProfile()` 获取用户授权信息
  - 准备调用 `/user/wechat-login` 接口
- `src/utils/api.js`: 已定义 `userWeChatLogin` 接口调用

**配置问题：**
- `src/manifest.json` 中 `appid` 为空
- `requiredPrivateInfos` 数组为空，缺少 `getUserProfile` 权限声明

### 1.2 后端现状

**已有实现：**
- `src/contexts/thirdparty/`: 完整的第三方认证框架
- `src/models/user_thirdparty_binding.go`: 第三方绑定数据表模型
- `src/config/config.yaml`: 微信配置部分

**但存在关键问题：**
- 后端只有**微信公众号 OAuth** 实现（使用 `/sns/oauth2/access_token`）
- **缺少微信小程序登录接口**（需要使用 `jscode2session` API）
- 前端调用的 `/user/wechat-login` 接口不存在

### 1.3 核心差异

| 特性 | 微信公众号 | 微信小程序 |
|------|-----------|-----------|
| API 端点 | `/sns/oauth2/access_token` | `/sns/jscode2session` |
| 返回内容 | access_token, openid | openid, session_key |
| 流程 | 授权回调模式 | code 换取 openid |
| 用户信息 | 需要调用 `/sns/userinfo` | 通过 `encryptedData` 解密 |

---

## 二、实现方案

### 2.1 后端实现

#### 文件 1: 新增小程序 API 客户端
**新建文件**: `D:\selfcoding\gowork\OrderEase-Golang\src\contexts\thirdparty\infrastructure\external\wechat\miniprogram_client.go`

```go
package wechat

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// MiniProgramClient 微信小程序 API 客户端
type MiniProgramClient struct {
	httpClient *http.Client
	appID      string
	appSecret  string
}

// NewMiniProgramClient 创建小程序客户端
func NewMiniProgramClient(appID, appSecret string) *MiniProgramClient {
	return &MiniProgramClient{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		appID:     appID,
		appSecret: appSecret,
	}
}

// Code2Session 通过 code 换取 openid 和 session_key
// 文档: https://developers.weixin.qq.com/miniprogram/dev/OpenAPIDoc/user-login/code2Session.html
func (c *MiniProgramClient) Code2Session(ctx context.Context, code string) (*SessionInfo, error) {
	url := fmt.Sprintf(
		"https://api.weixin.qq.com/sns/jscode2session??appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
		c.appID,
		c.appSecret,
		code,
	)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("create request failed: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("send request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response body failed: %w", err)
	}

	var result SessionInfo
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("unmarshal response failed: %w", err)
	}

	if result.IsErroroka() {
		return nil, result.GetError()
	}

	return &result, nil
}

// SessionInfo 小程序 session 信息
type SessionInfo struct {
	OpenID     string `json:"openid"`      // 用户唯一标识
	SessionKey  string `json:"session_key"` // 会话密钥
	UnionID     string `json:"unionid,omitempty"` // 在开放平台下的唯一标识符
	ErrCode     int    `json:"errcode,omitempty"`
	ErrMsg      string `json:"errmsg,omitempty"`
}

// IsErroroka 检查是否为错误响应
func (ser *SessionInfo) IsErroroka() bool {
	return ser.ErrCode != 0
}

// GetError 获取错误信息
func (ser *SessionInfo) GetError() *WeChatError {
	if !ser.IsErroroka() {
		return nil
	}
	return &WeChatError{
		ErrCode: WeChatErrorCode(ser.ErrCode),
		ErrMsg:  ser.ErrMsg,
	}
}

// DecryptUserInfo 解密用户信息（可选，用于验证加密数据）
func (c *MiniProgramClient) DecryptUserInfo(encryptedData, iv, sessionKey string) (map[string]interface{}, error) {
	// 使用 AES-128-CBC 解密
	// 具体实现参考微信文档
	// 注意：小程序端已通过 getUserProfile 获取用户信息，后端可以不做解密
	// 如果需要验证，可以实现此方法
	return nil, nil
}
```

#### 文件 2: 新增小程序配置
**新建文件**: `D:\selfcoding\gowork\OrderEase-Golang\src\contexts\thirdparty\infrastructure\config\miniprogram_config.go`

```go
package config

import (
	"github.com/spf13/viper"
)

// MiniProgramConfig 微信小程序配置
type MiniProgramConfig struct {
	Enabled   bool   // 是否启用小程序登录
	AppID     string // 小程序 AppID
	AppSecret string // 小程序 AppSecret
}

// LoadMiniProgramConfig 加载小程序配置
func LoadMiniProgramConfig() *MiniProgramConfig {
	return &MiniProgramConfig{
		Enabled:   viper.GetBool("thirdparty.wechat.miniprogram.enabled"),
		AppID:     viper.GetString("thirdparty.wechat.miniprogram.app_id"),
		AppSecret: viper.GetString("thirdparty.wechat.miniprogram.app_secret"),
	}
}

// Validate 验证配置
func (c *MiniProgramConfig) Validate() error {
	if !c.Enabled {
		return nil
	}
	if c.AppID == "" {
		return &ConfigError{Field: "miniprogram.app_id", Message: "小程序 app_id is required when enabled"}
	}
	if c.AppSecret == "" {
		return &ConfigError{Field: "miniprogram.app_secret", Message: "小程序 app_secret is required when enabled"}
	}
	return nil
}

// IsEnabled 检查是否启用
func (c *MiniProgramConfig) IsEnabled() bool {
	return c.Enabled && c.AppID != "" && c.AppSecret != ""
}
```

#### 文件 3: 新增小程序登录接口
**新建文件**: `D:\selfcoding\gowork\OrderEase-Golang\src\contexts\ordercontext\application\handlers\miniprogram_auth.go`

```go
package handlers

import (
	"fmt"
	"net/http"
	"orderease/contexts/thirdparty/domain/oauth"
	"orderease/contexts/thirdparty/infrastructure/config"
	"orderease/contexts/thirdparty/infrastructure/external/wechat"
	"orderease/contexts/thirdparty/infrastructure/persistence/repositories"
	"orderease/models"
	"orderease/utils"
	"orderease/utils/log2"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// MiniProgramLoginRequest 小程序登录请求
type MiniProgramLoginRequest struct {
	Code string `json:"code" binding:"required"`
	UserInfo struct {
		NickName      string `json:"nickName"`
		AvatarURL     string `json:"avatarUrl"`
		Gender        int    `json:"gender"`
		EncryptedData string `json:"encryptedData"`
		IV            string `json:"iv"`
		RawData       string `json:"rawData"`
		Signature     string `json:"signature"`
	} `json:"userInfo"`
}

// MiniProgramAuthHandler 小程序认证处理器
type MiniProgramAuthHandler struct {
	db                *gorm.DB
	miniProgramClient *wechat.MiniProgramClient
	config            *config.MiniProgramConfig
	bindingRepo       *repositories.UserThirdpartyBindingRepository
}

// NewMiniProgramAuthHandler 创建小程序认证处理器
func NewMiniProgramProgramAuthHandler(db *gorm.DB) (*MiniProgramAuthHandler, error) {
	miniConfig := config.LoadMiniProgramConfig()
	if err := miniConfig.Validate(); err != nil {
		return nil, fmt.Errorf("invalid miniprogram config: %w", err)
	}

	miniClient := wechat.NewMiniProgramClient(miniConfig.AppID, miniConfig.AppSecret)
	bindingRepo := repositories.NewUserThirdpartyBindingRepository(db)

	return &MiniProgramAuthHandler{
		db:                db,
		miniProgramClient: miniClient,
		config:            miniConfig,
		bindingRepo:       bindingRepo,
	}, nil
}

// WeChatMiniProgramLogin 微信小程序登录
// POST /api/order-ease/v1/user/wechat-login
func (h *MiniProgramAuthHandler) WeChatMiniProgramLogin(c *gin.Context) {
	var req MiniProgramLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log2.Errorf("参数绑定失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "无效的参数",
			"error":   err.Error(),
		})
		return
	}

	log2.Debugf("微信小程序登录请求: code=%s, nickName=%s", req.Code, req.UserInfo.NickName)

	// 1. 通过 code 换取 openid 和 session_key
	sessionInfo, err := h.miniProgramClient.Code2Session(c.Request.Context(), req.Code)
	if err != nil {
		log2.Errorf("Code2Session 失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "微信登录失败",
			"error":   "获取用户信息失败",
		})
		return
	}

	log2.Debugf("获取到 openid: %s", sessionInfo.OpenID)

	// 2. 查找或创建用户
	user, isNewUser, err := h.findOrCreateUser(sessionInfo, &req.UserInfo)
	if err != nil {
		log2.Errorf("查找或创建用户失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "登录失败",
			"error":   "用户处理失败",
		})
		return
	}

	// 3. 生成 JWT token
	token, expiredAt, err := utils.GenerateToken(uint64(user.ID), user.Name)
	if err != nil {
		log2.Errorf("生成 token 失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "登录失败",
			"error":   "生成令牌失败",
		})
		return
	}

	log2.Infof("微信小程序登录成功: ID=%d, OpenID=%s, isNewUser=%v", user.ID, sessionInfo.OpenID, isNewUser)

	// 4. 返回登录结果
	c.JSON(http.StatusOK, gin.H{
		"message": "登录成功",
		"data": gin.H{
			"user": gin.H{
				"id":         user.ID,
				"name":       user.Name,
				"nickname":   user.Nickname,
				"avatarUrl":  h.extractAvatarURL(user, sessionInfo.OpenID),
				"gender":     h.extractGender(user),
				"role":       user.Role,
				"type":       user.Type,
				"created_at": user.CreatedAt.Format(time.RFC3339),
			},
			"token":       token,
			"expiredAt":   expiredAt.Unix(),
			"first_login": isNewUser,
		},
	})
}

// findOrCreateUser 查找或创建用户
func (h *MiniProgramAuthHandler) findOrCreateUser(sessionInfo *wechat.SessionInfo, userInfo *MiniProgramLoginRequest.UserInfo) (*models.User, bool, error) {
	providerUserID := sessionInfo.OpenID

	// 1. 先通过绑定表查找用户
	binding, err := h.bindingRepo.FindByProviderAndUserID(oauth.ProviderWeChat, providerUserID)
	if err == nil && binding != nil {
		// 找到绑定，获取用户
		var user models.User
		if err := h.db.First(&user, binding.UserID).Error; err != nil {
			return nil, false, fmt.Errorf("find user by binding failed: %w", err)
		}

		// 更新绑定信息
		now := time.Now()
		binding.LastLoginAt = &now
		if sessionInfo.UnionID != "" && binding.UnionID == "" {
			binding.UnionID = sessionInfo.UnionID
		}
		if userInfo.NickName != "" && binding.Nickname != userInfo.NickName {
			binding.Nickname = userInfo.NickName
		}
		if userInfo.AvatarURL != "" && binding.AvatarURL != userInfo.AvatarURL {
			binding.AvatarURL = userInfo.AvatarURL
		}
		if err := h.bindingRepo.Update(binding); err != nil {
			log2.Warnf("update binding failed: %v", err)
		}

		return &user, false, nil
	}

	if err != gorm.ErrRecordNotFound {
		return nil, false, fmt.Errorf("query binding failed: %w", err)
	}

	// 2. 用户不存在，创建新用户
	username := h.generateUsername(sessionInfo.OpenID, userInfo.NickName)

	user := &models.User{
		ID:       utils.GenerateSnowflakeID(),
		Name:     username,
		Nickname: userInfo.NickName,
		Type:     "public_user",
		Role:     "public_user",
	}

	// 开始事务
	tx := h.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 创建用户
	if err := tx.Create(user).Error; err != nil {
		tx.Rollback()
		return nil, false, fmt.Errorf("create user failed: %w", err)
	}

	// 创建绑定
	binding = &models.UserThirdpartyBinding{
		UserID:         uint64(user.ID),
		Provider:       oauth.ProviderWeChat.String(),
		ProviderUserID: providerUserID,
		UnionID:        sessionInfo.UnionID,
		Nickname:       userInfo.NickName,
		AvatarURL:      userInfo.AvatarURL,
		Gender:         userInfo.Gender,
		Metadata:       h.buildMetadata(userInfo),
		IsActive:       true,
		LastLoginAt:    &[]time.Time{time.Now()}[0],
	}

	if err := tx.Create(binding).Error; err != nil {
		tx.Rollback()
		return nil, false, fmt.Errorf("create binding failed: %w", err)
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return nil, false, fmt.Errorf("commit transaction failed: %w", err)
	}

	log2.Infof("创建新微信用户: ID=%d, OpenID=%s, Username=%s", user.ID, providerUserID, username)

	return user, true, nil
}

// generateUsername 生成用户名
func (h *MiniProgramAuthHandler) generateUsername(openID, nickName string) string {
	if nickName != "" {
		// 使用昵称，加上后缀避免重复
		return fmt.Sprintf("wx_%s", nickName)
	}
	// 使用 OpenID 后6位
	if len(openID) >= 6 {
		return fmt.Sprintf("wx_user_%s", openID[len(openID)-6:])
	}
	return fmt.Sprintf("wx_user_%s", openID)
}

// extractAvatarURL 提取头像 URL
func (h *MiniProgramAuthHandler) extractAvatarURL(user *models.User, openID string) string {
	// 优先返回用户表的 avatar_url
	if user.Nickname != "" {
		return user.Nickname
	}
	return ""
}

// extractGender 提取性别
func (h *MiniProgramAuthHandler) extractGender(user *models.User) int {
	// 从绑定表查询
	var binding models.UserThirdpartyBinding
	if err := h.db.Where("user_id = ? AND provider = ?", user.ID, oauth.ProviderWeChat.String()).First(&binding).Error; err == nil {
		return binding.Gender
	}
	return 0
}

// buildMetadata 构建 metadata
func (h *MiniProgramAuthHandler) buildMetadata(userInfo *MiniProgramLoginRequest.UserInfo) models.Metadata {
	metadata := make(models.Metadata)
	metadata["encrypted_data"] = userInfo.EncryptedData
	metadata["signature"] = userInfo.Signature
	metadata["raw_data"] = userInfo.RawData
	metadata["login_at"] = time.Now().Unix()
	return metadata
}
```

#### 文件 4: 添加小程序路由
**修改文件**: `D:\selfcoding\gowork\OrderEase-Golang\src\contexts\ordercontext\routes\frontend\front_no_auth.go`

```go
package frontend

import (
	"orderease/config"
	ordercontextHandlers "orderease/contexts/ordercontext/application/handlers"
	"orderease/middleware"

	"github.com/gin-gonic/gin"
)

func SetupFrontNoAuthRoutes(r *gin.Engine, h *ordercontextHandlers.Handler, miniProgramHandler *ordercontextHandlers.MiniProgramAuthHandler) {
	basePath := config.AppConfig.Server.BasePath

	// 公开路由组 - 不需要认证
	public := r.Group(basePath)
	public.Use(middleware.RateLimitMiddleware())

	// 原有接口
	public.POST("/user/login", h.FrontendUserLogin)
	public.POST("/user/register", h.FrontendUserRegister)
	public.GET("/user/check-username", h.CheckUsernameExists)

	// 新增：微信小程序登录接口
	if miniProgramHandler != nil {
		public.POST("/user/wechat-login", miniProgramHandler.WeChatMiniProgramLogin)
	}
}
```

#### 文件 5: 更新配置文件
**修改文件**: `D:\selfcoding\gowork\OrderEase-Golang\src\config\config.yaml`

```yaml
# ... 原有配置 ...

# 第三方平台配置
thirdparty:
  wechat:
    # 微信公众号配置
    enabled: false
    app_id: ""
    app_secret: ""
    redirect_uri: "https://your-domain.com/api/order-ease/v1/thirdparty/wechat/callback"
    scope: "snsapi_base"

    # 微信小程序配置
    miniprogram:
      enabled: false  # 需要配置后设为 true
      app_id: ""     # 小程序 AppID
      app_secret: "" # 小程序 AppSecret
```

#### 文件 6: 更新 Handler 结构体
**修改文件**: `D:\selfcoding\gowork\OrderEase-Golang\src\contexts\ordercontext\application\handlers\handlers.go`

```go
package handlers

// 在 Handler 结构体中添加
type Handler struct {
	// ... 原有字段 ...

	miniProgramAuthHandler *MiniProgramAuthHandler
}

// 在 NewHandler 函数中添加初始化
func NewHandler(...) {
	// ... 原有代码 ...

	miniProgramHandler, err := NewMiniProgramProgramAuthHandler(db)
	if err != nil {
		logger.Warnf("小程序认证处理器初始化失败: %v", err)
		miniProgramHandler = nil
	}

	return &Handler{
		// ...
		miniProgramAuthHandler: miniProgramHandler,
	}, nil
}

// 添加 Getter
func (h *Handler) GetMiniProgramAuthHandler() *MiniProgramAuthHandler {
	return h.miniProgramAuthHandler
}
```

#### 文件 7: 更新 main.go 集成
**修改文件**: `D:\selfcoding\gowork\OrderEase-Golang\src\main.go`

```go
// 在路由注册部分
frontend.SetupFrontNoAuthRoutes(
    router,
    orderHandler,
    orderHandler.GetMiniProgramAuthHandler(),
)
```

### 2.2 前端实现

#### 文件 1: 更新小程序配置
**修改文件**: `D:\selfcoding\jswork\OrderEase-FrontUI\src\manifest.json`

```json
{
  "mp-weixin": {
    "appid": "your_wx_appid_here",  // ⚠️ 需要配置真实 AppID
    "setting": {
      "urlCheck": false,
      "es6": true,
      "enhance": true,
      "postcss": true,
      "minified": true
    },
    "usingComponents": true,
    "permission": {},
    "requiredPrivateInfos": ["getUserProfile"],  // ⚠️ 添加此声明
    "lazyCodeLoading": "requiredComponents"
  }
}
```

#### 文件 2: 确认 API 接口
**文件**: `D:\selfcoding\jswork\OrderEase-FrontUI\src\utils\api.js` (确认存在)

```javascript
// 确认此接口存在
export const userWeChatLogin = (wechatData) => {
  return api.post('/user/wechat-login', wechatData)
}
```

#### 文件 3: 确认登录页面
**文件**: `D:\selfcoding\jswork\OrderEase-FrontUI\src\pages\login\login.vue` (确认)

确认小程序环境显示微信授权登录按钮，并调用 `handleWeChatLogin` 函数。

---

## 三、数据库设计

### 3.1 已有表结构

`user_thirdparty_bindings` 表已存在，结构如下：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uint | 主键 |
| user_id | uint64 | 用户ID |
| provider | varchar(20) | 平台类型 (wechat) |
| provider_user_id | varchar(128) | 第三方用户ID (openid) |
| union_id | varchar(128) | 开放平台统一ID |
| nickname | varchar(100) | 第三方昵称 |
| avatar_url | varchar(500) | 第三方头像URL |
| gender | tinyint(1) | 性别 |
| metadata | json | 平台特有数据 |
| is_active | tinyint(1) | 是否激活 |
| last_login_at | datetime | 最后登录时间 |
| created_at | datetime | 绑定时间 |
| updated_at | datetime | 更新时间 |

### 3.2 无需修改

现有表结构已满足小程序登录需求，无需修改数据库。

---

## 四、实现步骤

### 步骤 1: 后端开发

1. 创建 `miniprogram_client.go` - 小程序 API 客户端
2. 创建 `miniprogram_config.go` - 小程序配置加载
3. 创建 `miniprogram_auth.go` - 小程序登录接口
4. 修改 `handlers.go` - 添加处理器初始化
5. 修改 `front_no_auth.go` - 注册新路由
6. 修改 `config.yaml` - 添加小程序配置APP_ID和AppSecret
7. 在 `main.go` 中集成小程序处理器

### 步骤 2: 前端配置

1. 配置 `manifest.json` 中的 `appid`
2. 确认 `requiredPrivateInfos` 包含 `getUserProfile`

### 步骤 3: 测试验证

1. 配置小程序 AppID 和 AppSecret
2. 构建小程序 `npm run dev:mp:weixin`
3. 使用微信开发者工具测试登录流程
4. 验证数据库中用户和绑定记录创建正确

---

## 五、关键注意事项

### 5.1 安全性

1. **AppSecret 保护**: 后端配置文件中的 AppSecret 必须保密
2. **SessionKey 不泄露**: SessionKey 仅用于服务端解密，不返回给前端
3. **Code 一次性**: 微信 code 只能使用一次

### 5.2 配置管理

1. 生产环境使用环境变量或配置中心管理敏感信息
2. 不同环境（开发/测试/生产）使用不同的小程序 AppID

### 5.3 错误处理

1. 处理微信 API 返回的各种错误码
2. 提供用户友好的错误提示
3. 记录详细的日志用于问题排查

---

## 六、测试验证清单

- [ ] 后端接口 `/api/order-ease/v1/user/wechat-login` 正常响应
- [ ] 前端小程序登录流程完整执行
- [ ] 新用户首次登录，用户和绑定记录正确创建
- [ ] 已有用户再次登录，绑定记录正确更新
- [ ] JWT token 正确生成并可用于后续请求
- [ ] 错误场景处理正确（拒绝授权、code 失效等）
- [ ] 数据库记录完整且一致

---

## 七、改造进度跟踪

### 后端改造

| 任务 | 文件 | 状态 | 备注 |
|------|------|------|------|
| 创建小程序 API 客户端 | `miniprogram_client.go` | ✅ 已完成 | |
| 创建小程序配置加载 | `miniprogram_config.go` | ✅ 已完成 | |
| 创建小程序登录接口 | `miniprogram_auth.go` | ✅ 已完成 | |
| 更新 Handler 结构体 | `handlers.go` | ✅ 已完成 | |
| 更新路由注册 | `front_no_auth.go` | ✅ 已完成 | |
| 更新配置文件 | `config.yaml` | ✅ 已完成 | |
| 集成到路由 | `module.go` | ✅ 已存在 | |

### 前端改造

| 任务 | 文件 | 状态 | 备注 |
|------|------|------|------|
| 配置小程序 AppID | `manifest.json` | ⏳ 需配置 | |
| 确认 getUserProfile 权限 | `manifest.json` | ✅ 已完成 | |
| 确认 API 接口定义 | `api.js` | ✅ 已存在 | |
| 确认登录页面逻辑 | `login.vue` | ✅ 已存在 | |
