<template>
  <view class="login-container">
    <view class="login-content">
      <view class="login-form">
        <view class="welcome-section">
          <text class="welcome-title">欢迎回来</text>
          <text class="welcome-subtitle">请登录您的账户</text>
        </view>
        
        <form @submit.prevent="handleLogin">
          <view class="input-group">
            <text class="input-icon">👤</text>
            <input
              v-model="form.username"
              placeholder="请输入用户名"
              class="custom-input"
            />
          </view>

          <view class="input-group">
            <text class="input-icon">🔒</text>
            <input
              v-model="form.password"
              placeholder="请输入密码"
              type="password"
              class="custom-input"
            />
          </view>

          <view class="button-group">
            <button 
              class="login-button"
              form-type="submit"
              :loading="loading"
              loading-text="登录中..."
            >
              登录
            </button>
          </view>
        </form>

        <view class="register-section">
          <text class="register-text">还没有账号？</text>
          <text class="register-link" @click="goToRegister">立即注册</text>
        </view>
        <view class="register-section">
          <text class="register-text">使用令牌登录？</text>
          <text class="register-link" @click="goToTokenLogin">令牌登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { userLogin } from '@/api'

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none'
    })
    return
  }
  
  if (!/^[a-zA-Z0-9]{6}$/.test(form.value.password)) {
    uni.showToast({
      title: '密码必须为6位字母或数字',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true
    
    const response = await userLogin({
      username: form.value.username,
      password: form.value.password
    })
    
    if (response.data && response.data.message === '登录成功') {
      uni.setStorageSync('user_id', response.data.user.id)
      uni.setStorageSync('user_info', JSON.stringify(response.data.user))
      uni.setStorageSync('token', response.data.token)
      
      uni.showToast({ title: '登录成功', icon: 'success' })
      
      uni.switchTab({
        url: '/pages/home/index'
      })
    } else {
      uni.showToast({
        title: response.data?.error || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: error.response?.data?.error || '网络错误，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/index'
  })
}

const goToTokenLogin = () => {
  uni.navigateTo({
    url: '/pages/token-login/index'
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
}

.login-content {
  padding: 60px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
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

.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  display: block;
  background: linear-gradient(135deg, #1E40AF, #3B82F6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 400;
  display: block;
}

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

.custom-input {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all var(--transition-base);
  padding-left: 48px;
  min-height: 56px;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.custom-input:focus {
  border-color: var(--primary-blue);
  background: var(--bg-primary);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
}

.button-group {
  margin: 32px 0 24px;
}

.login-button {
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #1E40AF, #3B82F6);
  color: white;
  border: none;
  border-radius: 28px;
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
  transition: all var(--transition-base);
}

.login-button:active {
  transform: translateY(0);
}

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
}

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
