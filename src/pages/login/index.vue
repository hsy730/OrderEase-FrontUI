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
        <!-- 微信授权登录模式 -->
        <view v-if="loginMode === 'wechat'" class="login-mode-content">
          <view class="button-group wechat-button-group">
            <view class="wechat-login-button" :class="{ loading: loading }" @click="handleWeChatLogin">
              <text v-if="!loading">微信授权登录</text>
              <text v-else>登录中...</text>
            </view>
          </view>

          <view class="switch-mode-link" @click="switchToPassword">
            <text class="switch-text">其他登录方式</text>
          </view>
        </view>

        <!-- 账号密码登录模式 -->
        <view v-else class="login-mode-content">
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
              <text v-if="!loading">登录</text>
              <text v-else>登录中...</text>
            </view>
          </view>

          <!-- 注册和令牌登录链接 -->
          <view class="links-section">
            <view class="link-row">
              <text class="link-text">还没有账号？</text>
              <text class="link-btn" @click="goToRegister">立即注册</text>
            </view>
            <view class="link-row">
              <text class="link-text">使用令牌登录？</text>
              <text class="link-btn" @click="goToTokenLogin">令牌登录</text>
            </view>
          </view>

          <view class="switch-mode-link" @click="switchToWechat">
            <text class="switch-text">微信授权登录</text>
          </view>
        </view>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { userWeChatLogin } from '@/utils/api'
import { useAuth } from '@/composables/useAuth'

const { loading, handlePasswordLogin, handleWeChatLogin: authHandleWeChatLogin } = useAuth()

const form = ref({
  username: '',
  password: ''
})

const loginMode = ref('wechat')

const switchToPassword = () => {
  loginMode.value = 'password'
}

const switchToWechat = () => {
  loginMode.value = 'wechat'
}

const handleLogin = async () => {
  await handlePasswordLogin(form.value.username, form.value.password)
}

const handleWeChatLogin = async () => {
  await authHandleWeChatLogin(userWeChatLogin)
}

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/register' })
}

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

.login-mode-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

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

.wechat-button-group {
  margin-top: 64rpx;
}

.switch-mode-link {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 48rpx;
  padding: 16rpx 32rpx;
}

.switch-text {
  font-size: 24rpx;
  color: #94A3B8;
}

.links-section {
  margin-top: 48rpx;
  padding-top: 48rpx;
  border-top: 1rpx solid #E2E8F0;
}

.link-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.link-row:last-child {
  margin-bottom: 0;
}

.link-text {
  color: #64748B;
  font-size: 26rpx;
}

.link-btn {
  color: #1E40AF;
  font-weight: 500;
  margin-left: 12rpx;
  font-size: 26rpx;
}
</style>
