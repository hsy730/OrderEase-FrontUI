<template>
  <view class="login-container">
    <view class="login-header">
      <text class="logo">OrderEase</text>
      <text class="slogan">便捷点餐，美味生活</text>
    </view>

    <view class="login-form">
      <!-- 账号输入 -->
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

      <!-- 密码输入 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            class="form-input"
            @blur="validatePassword"
          />
          <text class="toggle-password" @click="togglePasswordVisibility">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
        <text v-if="errors.password" class="error-text">{{ errors.password }}</text>
      </view>

      <!-- 登录按钮 -->
      <button
        class="login-btn"
        :class="{ disabled: !isFormValid || loading }"
        :disabled="!isFormValid || loading"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <!-- 微信登录 -->
      <button
        class="wechat-login-btn"
        open-type="getUserInfo"
        @getuserinfo="handleWechatLogin"
      >
        <text class="wechat-icon">💚</text>
        <text>微信一键登录</text>
      </button>

      <!-- 注册链接 -->
      <view class="register-link">
        <text class="link-text">还没有账号？</text>
        <text class="link-action" @click="goToRegister">立即注册</text>
      </view>
    </view>

    <!-- 协议提示 -->
    <view class="agreement-tip">
      <text>登录即表示同意</text>
      <text class="link-text" @click="showAgreement('user')">《用户协议》</text>
      <text>和</text>
      <text class="link-text" @click="showAgreement('privacy')">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { userLogin, userLoginByToken } from '@/api'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

// 表单数据
const formData = ref({
  username: '',
  password: ''
})

// 表单错误
const errors = ref({
  username: '',
  password: ''
})

// 状态
const showPassword = ref(false)
const loading = ref(false)

// 验证表单是否有效
const isFormValid = computed(() => {
  return formData.value.username.trim() &&
         formData.value.password.trim() &&
         !errors.value.username &&
         !errors.value.password
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

  errors.value.username = ''
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

  errors.value.password = ''
  return true
}

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// 账号密码登录
const handleLogin = async () => {
  if (!validateUsername() || !validatePassword()) {
    return
  }

  try {
    loading.value = true

    const res = await userLogin({
      username: formData.value.username.trim(),
      password: formData.value.password.trim()
    })

    if (res.data.code === 200) {
      const { token, user } = res.data.data

      // 保存登录信息到 store
      userStore.login({ token, user })

      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        // 检查是否有来源页面
        const pages = getCurrentPages()
        if (pages.length > 1) {
          uni.navigateBack()
        } else {
          uni.switchTab({
            url: '/pages/home/index'
          })
        }
      }, 1500)
    } else {
      uni.showToast({
        title: res.data.message || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: error.message || '登录失败，请检查网络',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 微信登录
const handleWechatLogin = async (e) => {
  console.log('微信登录:', e)

  if (!e.detail.userInfo) {
    // 用户拒绝授权
    uni.showToast({
      title: '需要授权才能登录',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true

    // 获取微信登录code
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        if (loginRes.code) {
          // 调用后端接口，传入微信code和用户信息
          const res = await userLogin({
            username: e.detail.userInfo.nickName,
            password: loginRes.code,
            wechat_code: loginRes.code,
            wechat_info: e.detail.userInfo
          })

          if (res.data.code === 200) {
            const { token, user } = res.data.data

            // 保存登录信息到 store
            userStore.login({ token, user })

            uni.showToast({
              title: '登录成功',
              icon: 'success'
            })

            setTimeout(() => {
              uni.switchTab({
                url: '/pages/home/index'
              })
            }, 1500)
          } else {
            uni.showToast({
              title: res.data.message || '登录失败',
              icon: 'none'
            })
          }
        } else {
          throw new Error('获取微信登录code失败')
        }
      },
      fail: (err) => {
        console.error('微信登录失败:', err)
        throw new Error('微信登录失败')
      }
    })
  } catch (error) {
    console.error('微信登录失败:', error)
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 跳转注册页
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/index'
  })
}

// 显示协议
const showAgreement = (type) => {
  console.log('显示协议:', type)
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 页面加载时从 store 加载用户信息
onMounted(() => {
  userStore.loadFromLocal()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 0 48rpx;
  display: flex;
  flex-direction: column;
}

.login-header {
  padding: 120rpx 0 80rpx;
  text-align: center;
}

.logo {
  display: block;
  font-size: 64rpx;
  font-weight: bold;
  color: var(--primary-blue);
  margin-bottom: 16rpx;
}

.slogan {
  display: block;
  font-size: 28rpx;
  color: var(--text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
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

.error-text {
  font-size: 24rpx;
  color: #f56c6c;
  padding-left: 8rpx;
}

.login-btn {
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
  transition: all 0.3s;
}

.login-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.login-btn::after {
  border: none;
}

.login-btn.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.wechat-login-btn {
  width: 100%;
  height: 96rpx;
  background: #07c160;
  color: #fff;
  border-radius: var(--radius-lg);
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  box-shadow: var(--shadow-md);
}

.wechat-login-btn:active {
  opacity: 0.9;
}

.wechat-login-btn::after {
  border: none;
}

.wechat-icon {
  font-size: 36rpx;
}

.register-link {
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
