<template>
  <view class="wechat-auth-container">
    <view class="auth-content">
      <view class="auth-header">
        <text class="auth-title">完善个人信息</text>
        <text class="auth-subtitle">请设置您的头像和昵称</text>
      </view>

      <view class="auth-form">
        <view class="avatar-section">
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image v-if="avatarUrl" :src="avatarUrl" class="avatar-image" mode="aspectFill" />
            <view v-else class="avatar-placeholder">
              <text class="placeholder-icon">+</text>
              <text class="placeholder-text">选择头像</text>
            </view>
          </button>
          <text class="avatar-tip">点击选择头像</text>
        </view>

        <view class="nickname-section">
          <view class="nickname-label">
            <text>昵称</text>
          </view>
          <input
            v-model="nickname"
            type="nickname"
            class="nickname-input"
            placeholder="请输入昵称"
            placeholder-class="input-placeholder"
            @blur="onNicknameBlur"
          />
        </view>

        <view class="submit-section">
          <button
            class="submit-btn"
            :class="{ disabled: !canSubmit || loading }"
            :disabled="!canSubmit || loading"
            @click="handleSubmit"
          >
            <text v-if="!loading">确认授权</text>
            <text v-else>授权中...</text>
          </button>
        </view>

        <view class="skip-section" @click="handleSkip">
          <text class="skip-text">跳过，稍后设置</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storage } from '@/store/storage'
import { userWeChatLogin } from '@/utils/api'
import { STORAGE_KEYS, ROUTES, ERROR_MESSAGES } from '@/utils/constants'
import { wxLogin } from '@/utils/wechat-auth'

const avatarUrl = ref('')
const nickname = ref('')
const loading = ref(false)

const canSubmit = computed(() => {
  return avatarUrl.value && nickname.value.trim()
})

const onChooseAvatar = (e) => {
  avatarUrl.value = e.detail.avatarUrl
}

const onNicknameBlur = (e) => {
  if (e.detail.value) {
    nickname.value = e.detail.value
  }
}

const uploadAvatar = async (tempFilePath) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080/'}${import.meta.env.VITE_API_PREFIX || 'api/order-ease/v1'}/user/upload-avatar`,
      filePath: tempFilePath,
      name: 'avatar',
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.avatar_url) {
            resolve(data.avatar_url)
          } else {
            resolve(tempFilePath)
          }
        } catch {
          resolve(tempFilePath)
        }
      },
      fail: () => {
        resolve(tempFilePath)
      }
    })
  })
}

const handleSubmit = async () => {
  if (!canSubmit.value || loading.value) return

  try {
    loading.value = true

    const code = await wxLogin()

    let finalAvatarUrl = avatarUrl.value
    if (avatarUrl.value.startsWith('http://tmp/') || avatarUrl.value.startsWith('wxfile://')) {
      finalAvatarUrl = await uploadAvatar(avatarUrl.value)
    }

    const response = await userWeChatLogin({
      code,
      nickname: nickname.value.trim(),
      avatar_url: finalAvatarUrl
    })

    if (response.data?.token) {
      storage.setItem(STORAGE_KEYS.USER_ID, response.data.user?.id)
      storage.setItem(STORAGE_KEYS.USER_INFO, response.data.user || { nickname: nickname.value, avatar: finalAvatarUrl })
      storage.setItem(STORAGE_KEYS.TOKEN, response.data.token)

      uni.showToast({ title: '授权成功', icon: 'success' })
      uni.reLaunch({ url: ROUTES.INDEX })
    } else {
      uni.showToast({ title: response.data?.error || ERROR_MESSAGES.WECHAT_LOGIN_FAILED, icon: 'none' })
    }
  } catch (error) {
    console.error('微信授权登录失败:', error)
    uni.showToast({ title: ERROR_MESSAGES.WECHAT_LOGIN_FAILED, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleSkip = () => {
  uni.navigateBack({ delta: 1 })
}
</script>

<style scoped>
.wechat-auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #07C160 0%, #10B851 100%);
}

.auth-content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.auth-header {
  text-align: center;
  margin-bottom: 80rpx;
}

.auth-title {
  font-size: 56rpx;
  font-weight: bold;
  color: #FFFFFF;
  display: block;
  margin-bottom: 16rpx;
}

.auth-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.auth-form {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 64rpx 48rpx;
  width: 100%;
  max-width: 640rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.avatar-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  overflow: hidden;
}

.avatar-btn::after {
  border: none;
}

.avatar-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.avatar-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #F1F5F9;
  border: 4rpx dashed #CBD5E1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 48rpx;
  color: #94A3B8;
  line-height: 1;
}

.placeholder-text {
  font-size: 20rpx;
  color: #94A3B8;
  margin-top: 8rpx;
}

.avatar-tip {
  font-size: 24rpx;
  color: #64748B;
  margin-top: 16rpx;
}

.nickname-section {
  margin-bottom: 48rpx;
}

.nickname-label {
  margin-bottom: 16rpx;
}

.nickname-label text {
  font-size: 28rpx;
  color: #334155;
  font-weight: 500;
}

.nickname-input {
  width: 100%;
  height: 96rpx;
  background: #F8FAFC;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  color: #0F172A;
  border: 2rpx solid #E2E8F0;
}

.nickname-input:focus {
  border-color: #07C160;
  background: #FFFFFF;
}

.input-placeholder {
  color: #94A3B8;
}

.submit-section {
  margin-top: 32rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #07C160, #10B851);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.submit-btn::after {
  border: none;
}

.submit-btn.disabled {
  background: #CBD5E1;
  color: #94A3B8;
}

.skip-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  padding: 16rpx;
}

.skip-text {
  font-size: 26rpx;
  color: #94A3B8;
}
</style>
