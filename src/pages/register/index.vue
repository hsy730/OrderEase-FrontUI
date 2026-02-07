<template>
  <view class="register-container">
    <view class="register-content">
      <view class="register-form">
        <text class="register-title">创建账号</text>
        
        <form @submit.prevent="handleRegister">
          <view class="input-group">
            <text class="input-icon">👤</text>
            <input
              v-model="form.username"
              placeholder="请输入用户名（2-20位）"
              class="custom-input"
            />
          </view>

          <view class="input-group">
            <text class="input-icon">🔒</text>
            <input
              v-model="form.password"
              placeholder="请输入密码（6位字母或数字）"
              type="password"
              class="custom-input"
            />
          </view>

          <view class="input-group">
            <text class="input-icon">🔒</text>
            <input
              v-model="form.confirmPassword"
              placeholder="请再次输入密码"
              type="password"
              class="custom-input"
            />
          </view>

          <view class="button-group">
            <button 
              class="register-button"
              form-type="submit"
              :loading="loading"
              loading-text="注册中..."
            >
              注册
            </button>
          </view>
        </form>

        <view class="login-link">
          <text>已有账号？</text>
          <text class="link" @click="goToLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { userRegister } from '@/api'

const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const handleRegister = async () => {
  if (!form.value.username || form.value.username.length < 2 || form.value.username.length > 20) {
    uni.showToast({
      title: '用户名长度2-20位',
      icon: 'none'
    })
    return
  }
  
  if (!form.value.password || !/^[a-zA-Z0-9]{6}$/.test(form.value.password)) {
    uni.showToast({
      title: '密码必须为6位字母或数字',
      icon: 'none'
    })
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    uni.showToast({
      title: '两次密码输入不一致',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true
    
    const response = await userRegister({
      username: form.value.username,
      password: form.value.password
    })
    
    if (response.data && response.data.message === '注册成功') {
      uni.showToast({ title: '注册成功', icon: 'success' })
      
      uni.navigateTo({
        url: '/pages/login/index'
      })
    } else {
      uni.showToast({
        title: response.data?.error || '注册失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('注册失败:', error)
    uni.showToast({
      title: error.response?.data?.error || '网络错误，请重试',
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
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
}

.register-content {
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.register-form {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 30px 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(30, 64, 175, 0.2);
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

.register-button {
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

.register-button:active {
  transform: translateY(0);
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: var(--text-secondary);
}

.link {
  color: var(--primary-blue);
  margin-left: 5px;
  font-weight: 600;
}
</style>
