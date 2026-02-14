<template>
  <view class="login-container">
    <view class="login-content">
      <!-- 登录表单 -->
      <view class="login-form">
        <!-- 欢迎标题 -->
        <view class="welcome-section">
          <text class="welcome-title">欢迎回来</text>
          <text class="welcome-subtitle">请登录您的账户</text>
        </view>

        <!-- #ifdef H5 -->
        <!-- H5 表单输入 -->
        <view class="form-group">
          <view class="input-group">
            <text class="input-icon">👤</text>
            <input
              v-model="form.username"
              placeholder="请输入用户名"
              class="custom-input"
              placeholder-class="input-placeholder"
            />
          </view>

          <view class="input-group">
            <text class="input-icon">🔒</text>
            <input
              v-model="form.password"
              placeholder="请输入密码"
              type="password"
              class="custom-input"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <!-- H5 登录按钮 -->
        <view class="button-group">
          <view class="login-button" :class="{ loading: loading }" @click="handleLogin">
            <text v-if="!loading">登录</text>
            <text v-else>登录中...</text>
          </view>
        </view>
        <!-- #endif -->

        <!-- #ifdef MP-WEIXIN -->
        <!-- 小程序微信授权登录 -->
        <view class="button-group">
          <view class="wechat-login-button" :class="{ loading: loading }" @click="handleWeChatLogin">
            <text v-if="!loading">微信授权登录</text>
            <text v-else>登录中...</text>
          </view>
        </view>

        <!-- 小程序其他登录方式 -->
        <view class="other-login-section">
          <view class="divider">
            <text class="divider-text">其他登录方式</text>
          </view>

          <view class="form-group">
            <view class="input-group">
              <text class="input-icon">👤</text>
              <input
                v-model="form.username"
                placeholder="请输入用户名"
                class="custom-input"
                placeholder-class="input-placeholder"
              />
            </view>

            <view class="input-group">
              <text class="input-icon">🔒</text>
              <input
                v-model="form.password"
                placeholder="请输入密码"
                type="password"
                class="custom-input"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>

          <view class="button-group">
            <view class="login-button" :class="{ loading: loading }" @click="handleLogin">
              <text v-if="!loading">账号密码登录</text>
              <text v-else>登录中...</text>
            </view>
          </view>
        </view>
        <!-- #endif -->

        <!-- 注册和令牌登录链接 -->
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
import { userWeChatLogin } from '@/utils/api'
import { useAuth } from '@/composables/useAuth'

// 使用登录组合式函数
const { loading, handlePasswordLogin, handleWeChatLogin: authHandleWeChatLogin } = useAuth()

// 表单数据
const form = ref({
  username: '',
  password: ''
})

// 账号密码登录
const handleLogin = async () => {
  await handlePasswordLogin(form.value.username, form.value.password)
}

// 微信授权登录
const handleWeChatLogin = async () => {
  await authHandleWeChatLogin(userWeChatLogin)
}

// 跳转到注册页面
const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/register' })
}

// 跳转到令牌登录页面
const goToTokenLogin = () => {
  uni.navigateTo({ url: '/pages/token-login/token-login' })
}
</script>

<style scoped>
.login-container {
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

/* 微信登录按钮 */
.wechat-login-button {
  height: 112rpx;
  font-size: 36rpx;
  font-weight: 600;
  background: linear-gradient(135deg, #07C160, #10B851);
  border: none;
  box-shadow: 0 16rpx 40rpx rgba(7, 193, 96, 0.3);
  transition: all 0.25s;
  border-radius: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
}

.wechat-login-button:active {
  transform: translateY(2rpx);
  opacity: 0.9;
}

/* 其他登录方式区域 */
.other-login-section {
  margin-top: 48rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin: 48rpx 0;
  color: #94A3B8;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1rpx;
  background: #E2E8F0;
}

.divider-text {
  padding: 0 24rpx;
  font-size: 24rpx;
}

/* 注册区域 */
.register-section {
  text-align: center;
  padding-top: 48rpx;
  border-top: 1rpx solid #E2E8F0;
  margin-bottom: 24rpx;
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