<template>
  <div class="login-container">
    <!-- 导航栏 -->
    <CommonNavBar title="用户登录" :show-back="true" />
    
    <div class="login-content">
      <!-- 登录表单 -->
      <div class="login-form">
        <!-- 欢迎标题 -->
        <div class="welcome-section">
          <h1 class="welcome-title">欢迎回来</h1>
          <p class="welcome-subtitle">请登录您的账户</p>
        </div>
        
        <van-form @submit="handleLogin">
          <!-- 用户名输入 -->
          <div class="input-group">
            <div class="input-icon">👤</div>
            <van-field
              v-model="form.username"
              name="username"
              placeholder="请输入用户名"
              :rules="rules.username"
              class="custom-field"
            />
          </div>

          <!-- 密码输入 -->
          <div class="input-group">
            <div class="input-icon">🔒</div>
            <van-field
              v-model="form.password"
              name="password"
              placeholder="请输入密码"
              :rules="rules.password"
              type="password"
              class="custom-field"
            />
          </div>

          <!-- 登录按钮 -->
          <div class="button-group">
            <van-button 
              round 
              block 
              type="primary"
              native-type="submit"
              :loading="loading"
              loading-text="登录中..."
              class="login-button"
            >
              登录
            </van-button>
          </div>
        </van-form>

        <!-- 注册和令牌登录链接 -->
        <div class="register-section">
          <span class="register-text">还没有账号？</span>
          <span class="register-link" @click="goToRegister">立即注册</span>
        </div>
        <div class="register-section">
          <span class="register-text">使用令牌登录？</span>
          <span class="register-link" @click="goToTokenLogin">令牌登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showFailToast } from 'vant'
import { userLogin } from '@/api'

const router = useRouter()

// 表单数据
const form = ref({
  username: '',
  password: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { pattern: /^[a-zA-Z0-9]{6}$/, message: '密码必须为6位字母或数字' }
  ]
}

// 登录状态
const loading = ref(false)

// 登录方法
const handleLogin = async () => {
  try {
    loading.value = true
    
    // 调用登录API
    const response = await userLogin({
      username: form.value.username,
      password: form.value.password
    })
    
    if (response.data && response.data.message === '登录成功') {
      // 存储用户信息和token
      localStorage.setItem('user_id', response.data.user.id)
      localStorage.setItem('user_info', JSON.stringify(response.data.user))
      localStorage.setItem('token', response.data.token)
      
      showToast('登录成功')
      
      // 检查是否有重定向参数
      const redirect = router.currentRoute.value.query.redirect
      if (redirect) {
        // 跳转到之前的目标页面
        router.push(redirect)
      } else {
        // 跳转到首页
        router.push('/home')
      }
    } else {
      showFailToast(response.data?.error || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    if (error.response?.data?.error) {
      showFailToast(error.response.data.error)
    } else {
      showFailToast('网络错误，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 跳转到令牌登录页面
const goToTokenLogin = () => {
  router.push('/token-login')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  padding-top: 46px;
}

.login-content {
  padding: 60px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 46px);
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 32px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(30, 64, 175, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1E40AF, #3B82F6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* 输入框组 */
.input-group {
  position: relative;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  z-index: 2;
  font-size: 20px;
  color: var(--primary-blue);
}

.custom-field {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all var(--transition-base);
  padding-left: 48px;
  min-height: 56px;
}

.custom-field:focus-within {
  border-color: var(--primary-blue);
  background: var(--bg-primary);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
}

.custom-field :deep(.van-field__control) {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.custom-field :deep(.van-field__control::placeholder) {
  color: var(--text-tertiary);
  font-weight: 400;
}

/* 按钮组 */
.button-group {
  margin: 32px 0 24px;
}

.login-button {
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #1E40AF, #3B82F6);
  border: none;
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
  transition: all var(--transition-base);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(30, 64, 175, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

/* 注册区域 */
.register-section {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}

.register-text {
  color: var(--text-secondary);
  font-size: 14px;
}

.register-link {
  color: var(--primary-blue);
  font-weight: 600;
  margin-left: 8px;
  cursor: pointer;
  transition: color var(--transition-base);
}

.register-link:hover {
  color: var(--primary-blue-light);
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-content {
    padding: 40px 20px;
  }

  .login-form {
    padding: 40px 24px;
    border-radius: 20px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .welcome-subtitle {
    font-size: 15px;
  }
}
</style>