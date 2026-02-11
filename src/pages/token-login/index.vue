<template>
  <view class="login-container">
    <view class="login-content">
      <view class="login-form">
        <view class="welcome-section">
          <text class="welcome-title">欢迎回来</text>
          <text class="welcome-subtitle">请输入您的登录令牌</text>
        </view>
        
        <form @submit.prevent="handleTokenLogin">
          <view class="input-group">
            <text class="input-icon">🔑</text>
            <input
              v-model="token"
              placeholder="请输入令牌"
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
          <text class="register-text">使用普通登录？</text>
          <text class="register-link" @click="goToLogin">返回普通登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { userLoginByToken } from '@/api'

const token = ref('')
const loading = ref(false)

const handleTokenLogin = async () => {
  if (!token.value) {
    uni.showToast({
      title: '请输入令牌',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true
    
    const response = await userLoginByToken({
      token: token.value
    })
    
    if (response.data && response.data.code === 200) {
      uni.setStorageSync('user_id', response.data.data.user_info.id)
      uni.setStorageSync('user_info', JSON.stringify(response.data.data.user_info))
      uni.setStorageSync('token', response.data.data.token)
      
      uni.showToast({ title: '登录成功', icon: 'success' })
      
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/home/index'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: response.data?.message || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: error.message || '网络错误，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1989fa 0%, #36a2f7 100%);
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
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
  background: linear-gradient(135deg, #1989fa, #36a2f7);
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
  color: #1989fa;
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
  border-color: #1989fa;
  background: var(--bg-primary);
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.2);
}

.button-group {
  margin: 32px 0 24px;
}

.login-button {
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #1989fa, #36a2f7);
  color: white;
  border: none;
  border-radius: 28px;
  box-shadow: 0 8px 20px rgba(25, 137, 250, 0.3);
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
  color: #1989fa;
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
