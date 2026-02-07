<template>
  <view class="register-container">
    <view class="register-header">
      <text class="title">注册账号</text>
      <text class="subtitle">欢迎加入 OrderEase</text>
    </view>

    <view class="register-form">
      <!-- 用户名 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">👤</text>
          <input
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名"
            class="form-input"
            @blur="validateUsername"
          />
        </view>
        <text v-if="errors.username" class="error-text">{{ errors.username }}</text>
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">📱</text>
          <input
            v-model="formData.phone"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            class="form-input"
            @blur="validatePhone"
          />
        </view>
        <text v-if="errors.phone" class="error-text">{{ errors.phone }}</text>
      </view>

      <!-- 验证码 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">🔐</text>
          <input
            v-model="formData.code"
            type="number"
            maxlength="6"
            placeholder="请输入验证码"
            class="form-input"
            @blur="validateCode"
          />
          <button
            class="send-code-btn"
            :class="{ disabled: countdown > 0 || !canSendCode }"
            :disabled="countdown > 0 || !canSendCode"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s后重新发送` : '获取验证码' }}
          </button>
        </view>
        <text v-if="errors.code" class="error-text">{{ errors.code }}</text>
      </view>

      <!-- 密码 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码（6-20位）"
            class="form-input"
            @blur="validatePassword"
          />
          <text class="toggle-password" @click="togglePasswordVisibility">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
        <text v-if="errors.password" class="error-text">{{ errors.password }}</text>
      </view>

      <!-- 确认密码 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input
            v-model="formData.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入密码"
            class="form-input"
            @blur="validateConfirmPassword"
          />
          <text class="toggle-password" @click="toggleConfirmPasswordVisibility">
            {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
        <text v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</text>
      </view>

      <!-- 注册按钮 -->
      <button
        class="register-btn"
        :class="{ disabled: !isFormValid || loading }"
        :disabled="!isFormValid || loading"
        @click="handleRegister"
      >
        {{ loading ? '注册中...' : '立即注册' }}
      </button>

      <!-- 登录链接 -->
      <view class="login-link">
        <text class="link-text">已有账号？</text>
        <text class="link-action" @click="goToLogin">立即登录</text>
      </view>
    </view>

    <!-- 协议提示 -->
    <view class="agreement-tip">
      <text>注册即表示同意</text>
      <text class="link-text" @click="showAgreement('user')">《用户协议》</text>
      <text>和</text>
      <text class="link-text" @click="showAgreement('privacy')">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { userRegister } from '@/api'
import { storage } from '@/utils/storage'

// 表单数据
const formData = ref({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 表单错误
const errors = ref({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 状态
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const countdown = ref(0)
let countdownTimer = null

// 是否可以发送验证码
const canSendCode = computed(() => {
  return formData.value.phone.length === 11 && !errors.value.phone
})

// 验证表单是否有效
const isFormValid = computed(() => {
  return formData.value.username.trim() &&
         formData.value.phone.length === 11 &&
         formData.value.code.length === 6 &&
         formData.value.password.trim().length >= 6 &&
         formData.value.confirmPassword.trim() === formData.value.password.trim() &&
         !Object.values(errors.value).some(error => error)
})

// 验证用户名
const validateUsername = () => {
  const username = formData.value.username.trim()

  if (!username) {
    errors.value.username = '请输入用户名'
    return false
  }

  if (username.length < 3) {
    errors.value.username = '用户名至少3个字符'
    return false
  }

  if (username.length > 20) {
    errors.value.username = '用户名最多20个字符'
    return false
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    errors.value.username = '用户名只能包含字母、数字和下划线'
    return false
  }

  errors.value.username = ''
  return true
}

// 验证手机号
const validatePhone = () => {
  const phone = formData.value.phone.trim()

  if (!phone) {
    errors.value.phone = '请输入手机号'
    return false
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    errors.value.phone = '请输入正确的手机号'
    return false
  }

  errors.value.phone = ''
  return true
}

// 验证验证码
const validateCode = () => {
  const code = formData.value.code.trim()

  if (!code) {
    errors.value.code = '请输入验证码'
    return false
  }

  if (code.length !== 6) {
    errors.value.code = '验证码必须是6位数字'
    return false
  }

  const codeRegex = /^\d{6}$/
  if (!codeRegex.test(code)) {
    errors.value.code = '验证码格式不正确'
    return false
  }

  errors.value.code = ''
  return true
}

// 验证密码
const validatePassword = () => {
  const password = formData.value.password.trim()

  if (!password) {
    errors.value.password = '请输入密码'
    return false
  }

  if (password.length < 6) {
    errors.value.password = '密码至少6个字符'
    return false
  }

  if (password.length > 20) {
    errors.value.password = '密码最多20个字符'
    return false
  }

  // 简单的密码强度验证
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  if (!hasLetter || !hasNumber) {
    errors.value.password = '密码必须包含字母和数字'
    return false
  }

  errors.value.password = ''
  return true
}

// 验证确认密码
const validateConfirmPassword = () => {
  const confirmPassword = formData.value.confirmPassword.trim()

  if (!confirmPassword) {
    errors.value.confirmPassword = '请再次输入密码'
    return false
  }

  if (confirmPassword !== formData.value.password.trim()) {
    errors.value.confirmPassword = '两次输入的密码不一致'
    return false
  }

  errors.value.confirmPassword = ''
  return true
}

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// 切换确认密码可见性
const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// 发送验证码
const sendCode = async () => {
  if (!validatePhone()) {
    return
  }

  try {
    // 模拟发送验证码（实际项目需要调用后端接口）
    uni.showToast({
      title: '验证码已发送',
      icon: 'success'
    })

    // 开始倒计时
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    uni.showToast({
      title: '发送失败，请稍后重试',
      icon: 'none'
    })
  }
}

// 注册
const handleRegister = async () => {
  // 验证所有字段
  const isUsernameValid = validateUsername()
  const isPhoneValid = validatePhone()
  const isCodeValid = validateCode()
  const isPasswordValid = validatePassword()
  const isConfirmPasswordValid = validateConfirmPassword()

  if (!isUsernameValid || !isPhoneValid || !isCodeValid || !isPasswordValid || !isConfirmPasswordValid) {
    return
  }

  try {
    loading.value = true

    const res = await userRegister({
      username: formData.value.username.trim(),
      phone: formData.value.phone.trim(),
      code: formData.value.code.trim(),
      password: formData.value.password.trim()
    })

    if (res.data.code === 200) {
      const { token, user } = res.data.data

      // 保存登录信息
      storage.set('token', token)
      storage.set('user_id', user.id)
      storage.set('user_info', user)

      uni.showToast({
        title: '注册成功',
        icon: 'success'
      })

      // 延迟跳转
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/home/index'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: res.data.message || '注册失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('注册失败:', error)
    uni.showToast({
      title: error.message || '注册失败，请检查网络',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 跳转登录页
const goToLogin = () => {
  uni.navigateBack()
}

// 显示协议
const showAgreement = (type) => {
  console.log('显示协议:', type)
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 清理定时器
onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 0 48rpx;
  display: flex;
  flex-direction: column;
}

.register-header {
  padding: 100rpx 0 60rpx;
  text-align: center;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: var(--text-secondary);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: var(--radius-md);
  padding: 24rpx;
  box-shadow: var(--shadow-sm);
}

.input-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-primary);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.toggle-password {
  font-size: 40rpx;
  padding: 8rpx;
  cursor: pointer;
}

.send-code-btn {
  padding: 12rpx 24rpx;
  background: var(--gradient-primary);
  color: #fff;
  border-radius: 32rpx;
  font-size: 24rpx;
  font-weight: bold;
  border: none;
  white-space: nowrap;
}

.send-code-btn::after {
  border: none;
}

.send-code-btn:active {
  opacity: 0.9;
}

.send-code-btn.disabled {
  background: var(--bg-muted);
  color: var(--text-secondary);
  pointer-events: none;
}

.error-text {
  font-size: 24rpx;
  color: #f56c6c;
  padding-left: 8rpx;
}

.register-btn {
  width: 100%;
  height: 96rpx;
  background: var(--gradient-primary);
  color: #fff;
  border-radius: var(--radius-lg);
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  margin-top: 32rpx;
}

.register-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.register-btn::after {
  border: none;
}

.register-btn.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.login-link {
  text-align: center;
  margin-top: 16rpx;
}

.link-text {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.link-action {
  font-size: 26rpx;
  color: var(--primary-blue);
  font-weight: bold;
  margin-left: 8rpx;
}

.agreement-tip {
  text-align: center;
  padding: 48rpx 0;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.agreement-tip .link-text {
  color: var(--primary-blue);
  margin: 0 4rpx;
}
</style>
