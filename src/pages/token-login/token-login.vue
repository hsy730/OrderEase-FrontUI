<template>
  <view class="token-login-container">
    <view class="login-content">
      <!-- 登录表单 -->
      <view class="login-form">
        <!-- 欢迎标题 -->
        <view class="welcome-section">
          <text class="welcome-title">令牌登录</text>
          <text class="welcome-subtitle">输入店铺令牌快速登录</text>
        </view>

        <!-- 表单输入 -->
        <view class="form-group">
          <view class="input-group">
            <text class="input-icon">🔑</text>
            <input
              v-model="form.token"
              placeholder="请输入令牌"
              class="custom-input"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <!-- 登录按钮 -->
        <view class="button-group">
          <view class="login-button" :class="{ loading: loading }" @click="handleTokenLogin">
            <text v-if="!loading">登录</text>
            <text v-else>登录中...</text>
          </view>
        </view>

        <!-- 返回登录链接 -->
        <view class="register-section">
          <text class="register-text">使用账号密码登录？</text>
          <text class="register-link" @click="goToLogin">账号登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { userLoginByToken } from '@/utils/api'
import { storage } from '@/store/storage'
import { STORAGE_KEYS, ERROR_MESSAGES, ROUTES } from '@/utils/constants'
import { showError, showSuccess } from '@/utils/errorHandler'

const form = ref({
  token: ''
})

const loading = ref(false)

const handleTokenLogin = async () => {
  if (!form.value.token) {
    showError('请输入令牌')
    return
  }

  try {
    loading.value = true

    const response = await userLoginByToken({
      token: form.value.token
    })

    if (response.data && response.data.message === '登录成功') {
      storage.setItem(STORAGE_KEYS.USER_ID, response.data.user.id)
      storage.setItem(STORAGE_KEYS.USER_INFO, response.data.user)
      storage.setItem(STORAGE_KEYS.TOKEN, response.data.token)

      if (response.data.shop_id) {
        storage.setItem(STORAGE_KEYS.SHOP_ID, response.data.shop_id)
      }

      showSuccess('登录成功')

      setTimeout(() => {
        uni.reLaunch({ url: ROUTES.INDEX })
      }, 1500)
    } else {
      showError(response.data?.error || '令牌无效')
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
</script>

<style scoped>
.token-login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
}

.login-content {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 48rpx;
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40rpx);
  border-radius: 48rpx;
  padding: 96rpx 64rpx;
  width: 100%;
  max-width: 880rpx;
  box-shadow: 0 40rpx 120rpx rgba(30, 64, 175, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  margin-bottom: 96rpx;
}

.welcome-title {
  font-size: 64rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
  background: linear-gradient(135deg, #1E40AF, #3B82F6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.welcome-subtitle {
  font-size: 32rpx;
  color: #475569;
  display: block;
}

/* 输入框组 */
.form-group {
  margin-bottom: 48rpx;
}

.input-group {
  position: relative;
  margin-bottom: 48rpx;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 32rpx;
  z-index: 2;
  font-size: 40rpx;
}

.custom-input {
  flex: 1;
  background: #F8FAFC;
  border-radius: 24rpx;
  border: 2rpx solid transparent;
  transition: all 0.25s;
  padding-left: 96rpx;
  padding-right: 24rpx;
  height: 112rpx;
  font-size: 32rpx;
  color: #0F172A;
  font-weight: 500;
}

.input-placeholder {
  color: #94A3B8;
  font-weight: 400;
}

.custom-input:focus {
  border-color: #1E40AF;
  background: #FFFFFF;
  box-shadow: 0 8rpx 24rpx rgba(30, 64, 175, 0.2);
}

/* 按钮组 */
.button-group {
  margin: 64rpx 0 48rpx;
}

.login-button {
  height: 112rpx;
  font-size: 36rpx;
  font-weight: 600;
  background: linear-gradient(135deg, #1E40AF, #3B82F6);
  border: none;
  box-shadow: 0 16rpx 40rpx rgba(30, 64, 175, 0.3);
  transition: all 0.25s;
  border-radius: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
}

.login-button:active {
  transform: translateY(0);
}

.login-button.loading {
  opacity: 0.7;
}

/* 注册区域 */
.register-section {
  text-align: center;
  padding-top: 48rpx;
  border-top: 1rpx solid #E2E8F0;
}

.register-text {
  color: #475569;
  font-size: 28rpx;
}

.register-link {
  color: #1E40AF;
  font-weight: 600;
  margin-left: 16rpx;
}
</style>