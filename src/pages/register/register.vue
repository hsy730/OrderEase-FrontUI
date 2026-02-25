<template>
  <view class="register-container">
    <view class="register-content">
      <!-- 注册表单 -->
      <view class="register-form">
        <text class="register-title">创建账号</text>

        <!-- 用户名输入 -->
        <view class="form-group">
          <view class="input-group">
            <text class="input-icon">👤</text>
            <input
              v-model="form.username"
              placeholder="请输入用户名（2-20位）"
              class="custom-input"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <!-- 密码输入 -->
        <view class="form-group">
          <view class="input-group">
            <text class="input-icon">🔒</text>
            <input
              v-model="form.password"
              placeholder="请输入密码（6位字母或数字）"
              type="password"
              class="custom-input"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <!-- 确认密码 -->
        <view class="form-group">
          <view class="input-group">
            <text class="input-icon">🔐</text>
            <input
              v-model="form.confirmPassword"
              placeholder="请再次输入密码"
              type="password"
              class="custom-input"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <!-- 注册按钮 -->
        <view class="button-group">
          <view class="register-button" :class="{ loading: loading }" @click="handleRegister">
            <text v-if="!loading">注册</text>
            <text v-else>注册中...</text>
          </view>
        </view>

        <!-- 登录链接 -->
        <view class="login-link">
          <text class="link-text">已有账号？</text>
          <text class="link-text highlight" @click="goToLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { userRegister } from '@/utils/api'
import { ROUTES, ERROR_MESSAGES } from '@/utils/constants'
import { showError, showSuccess } from '@/utils/errorHandler'

const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
let registerTimer = null

const handleRegister = async () => {
  if (!form.value.username) {
    showError('请输入用户名')
    return
  }

  if (form.value.username.length < 2 || form.value.username.length > 20) {
    showError('用户名长度2-20位')
    return
  }

  if (!form.value.password) {
    showError('请输入密码')
    return
  }

  if (!/^[a-zA-Z0-9]{6}$/.test(form.value.password)) {
    showError('密码必须为6位字母或数字')
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    showError('两次密码输入不一致')
    return
  }

  try {
    loading.value = true

    const response = await userRegister({
      username: form.value.username,
      password: form.value.password
    })

    if (response.data && response.data.message === '注册成功') {
      showSuccess('注册成功')

      registerTimer = setTimeout(() => {
        uni.redirectTo({ url: ROUTES.LOGIN })
      }, 1500)
    } else {
      showError(response.data?.error || '注册失败')
    }
  } catch (error) {
    showError(ERROR_MESSAGES.NETWORK_ERROR)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  uni.navigateBack()
}

onUnmounted(() => {
  if (registerTimer) {
    clearTimeout(registerTimer)
    registerTimer = null
  }
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
}

.register-content {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.register-form {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  width: 100%;
  max-width: 800rpx;
  box-shadow: 0 20rpx 60rpx rgba(30, 64, 175, 0.2);
}

.register-title {
  text-align: center;
  margin-bottom: 60rpx;
  color: #0F172A;
  font-size: 48rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #1E40AF, #3B82F6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: block;
}

/* 输入框组 */
.form-group {
  margin-bottom: 32rpx;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 24rpx;
  z-index: 2;
  font-size: 36rpx;
}

.custom-input {
  flex: 1;
  background: #F8FAFC;
  border-radius: 24rpx;
  border: 2rpx solid transparent;
  transition: all 0.25s;
  padding-left: 88rpx;
  padding-right: 24rpx;
  height: 96rpx;
  font-size: 32rpx;
  color: #0F172A;
  font-weight: 500;
}

.custom-input:focus {
  border-color: #1E40AF;
  background: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(30, 64, 175, 0.15);
}

.input-placeholder {
  color: #94A3B8;
  font-weight: 400;
}

/* 按钮组 */
.button-group {
  margin: 48rpx 0 24rpx;
}

.register-button {
  height: 96rpx;
  font-size: 32rpx;
  font-weight: 600;
  background: linear-gradient(135deg, #1E40AF, #3B82F6);
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(30, 64, 175, 0.3);
  transition: all 0.25s;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
}

.register-button:active {
  transform: translateY(0);
}

.register-button.loading {
  opacity: 0.7;
}

/* 登录链接 */
.login-link {
  text-align: center;
  margin-top: 40rpx;
  color: #475569;
}

.link-text {
  font-size: 28rpx;
}

.link-text.highlight {
  color: #1E40AF;
  margin-left: 8rpx;
  font-weight: 600;
}
</style>