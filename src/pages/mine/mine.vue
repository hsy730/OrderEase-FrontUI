<template>
  <view class="mine-page">
    <!-- #ifdef H5 -->
    <!-- 顶部固定标题栏 -->
    <HeaderBar />
    <!-- #endif -->

    <!-- 用户信息 -->
    <view v-if="isLoggedIn" class="user-info" @click="handleSyncUserInfo">
      <image
        class="user-avatar"
        :src="avatarUrl"
        mode="aspectFill"
      />
      <view class="user-details">
        <text class="username">{{ displayUsername }}</text>
        <text class="phone">{{ formatPhone(userInfo.phone) }}</text>
      </view>
      <text class="arrow-icon">›</text>
    </view>

    <!-- 未登录状态 -->
    <view v-else class="login-prompt">
      <text class="prompt-text">您还未登录</text>
      <view class="button-group">
        <view class="login-btn" @click="goToLogin">
          <text>登录</text>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="function-list">
      <view v-if="isLoggedIn" class="function-item" @click="showToast(TOAST_MESSAGES.FEATURE_DEVELOPING)">
        <text class="item-text">收货地址</text>
        <text class="item-arrow">›</text>
      </view>
      <view v-if="isLoggedIn" class="function-item" @click="showToast(TOAST_MESSAGES.FEATURE_DEVELOPING)">
        <text class="item-text">联系电话</text>
        <text class="item-arrow">›</text>
      </view>
      <view v-if="isLoggedIn" class="function-item" @click="showToast(TOAST_MESSAGES.FEATURE_DEVELOPING)">
        <text class="item-text">账户设置</text>
        <text class="item-arrow">›</text>
      </view>
      <view v-if="isLoggedIn" class="function-item logout-item" @click="handleLogout">
        <text class="item-text">退出登录</text>
        <text class="item-arrow">›</text>
      </view>
      <view class="function-item" @click="showAbout">
        <text class="item-text">关于我们</text>
        <text class="item-arrow">›</text>
      </view>
    </view>

    <!-- 店铺信息 -->
    <view class="shop-info">
      <text class="shop-version">V{{ APP_VERSION }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storage } from '@/store/storage'
import HeaderBar from '@/components/HeaderBar.vue'
import { APP_VERSION, TOAST_MESSAGES } from '@/utils/constants'
import { checkSession } from '@/utils/wechat-auth'
import { silentLogin } from '@/utils/auth-utils'
import { checkAndSyncUserInfo, clearUserSyncRecord } from '@/utils/user-sync'
import { useShopTitle } from '../../composables/useShopTitle.js'
import { getUserAvatarUrl } from '@/utils/image'

const userInfo = ref({})
const syncing = ref(false)

const isLoggedIn = computed(() => {
  return !!storage.getItem('user_id')
})

// 获取显示的用户名（优先显示微信昵称）
const displayUsername = computed(() => {
  const info = userInfo.value
  return info.nickname || info.username || info.name || '用户'
})

// 获取头像URL（使用工具函数处理）
const avatarUrl = computed(() => {
  const url = getUserAvatarUrl(userInfo.value.avatar)
  return url || '/static/user-avatar.svg'
})

// 刷新用户信息
const refreshUserInfo = () => {
  if (isLoggedIn.value) {
    const storedUserInfo = storage.getItem('user_info')
    if (storedUserInfo) {
      userInfo.value = storedUserInfo
    }
  } else {
    userInfo.value = {}
  }
}

// 检查登录状态
const checkLoginStatus = async () => {
  if (isLoggedIn.value) {
    const sessionValid = await checkSession()
    if (!sessionValid) {
      await silentLogin()
      refreshUserInfo()
    } else {
      // 登录态有效时，检查是否需要同步用户信息
      await checkAndSyncUserInfo({ silent: true })
      refreshUserInfo()
    }
  }
}

// 处理用户信息同步
const handleSyncUserInfo = async () => {
  if (syncing.value) return

  syncing.value = true
  try {
    const success = await checkAndSyncUserInfo({ silent: false, force: true })
    if (success) {
      refreshUserInfo()
    }
  } finally {
    syncing.value = false
  }
}

const formatPhone = (phone) => {
  if (!phone) return '未设置'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '您确定要退出登录吗？',
    confirmColor: '#1E40AF',
    success: (res) => {
      if (res.confirm) {
        storage.removeItem('user_id')
        storage.removeItem('user_info')
        storage.removeItem('token')
        // 清除用户信息同步记录
        clearUserSyncRecord()

        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })

        userInfo.value = {}
      }
    }
  })
}

const showToast = (message) => {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

const showAbout = () => {
  showToast(`OrderEase 点单系统 v${APP_VERSION}`)
}

// 使用店铺标题 composable
const { loadShopTitle } = useShopTitle()

// 页面加载时获取用户信息和店铺信息
onMounted(() => {
  refreshUserInfo()
  // 使用 composable 加载店铺标题（带缓存）
  loadShopTitle()
})

// 页面显示时刷新用户信息（每次页面显示都会触发）
onShow(() => {
  checkLoginStatus()
  refreshUserInfo()
})


</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background: #F8FAFC;
  padding-bottom: 40rpx;
}

/* 用户信息卡片 */
.user-info {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin: 20rpx;
  /* #ifdef H5 */
  margin-top: 120rpx;
  /* #endif */
  /* #ifdef MP-WEIXIN */
  margin-top: 20rpx;
  /* #endif */
  padding: 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 16rpx rgba(45, 52, 54, 0.08);
  border: 1rpx solid #E2E8F0;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #E2E8F0;
  margin-right: 28rpx;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 34rpx;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 10rpx;
}

.phone {
  font-size: 26rpx;
  color: #94A3B8;
}

/* 箭头图标 */
.arrow-icon {
  font-size: 40rpx;
  color: #CBD5E1;
  font-weight: 300;
}

/* 登录提示卡片 */
.login-prompt {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin: 20rpx;
  /* #ifdef H5 */
  margin-top: 120rpx;
  /* #endif */
  /* #ifdef MP-WEIXIN */
  margin-top: 20rpx;
  /* #endif */
  padding: 48rpx 32rpx;
  text-align: center;
  box-shadow: 0 2rpx 16rpx rgba(45, 52, 54, 0.08);
  border: 1rpx solid #E2E8F0;
}

.prompt-text {
  font-size: 30rpx;
  color: #475569;
  margin-bottom: 28rpx;
  display: block;
}

.login-btn {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
  border-radius: 44rpx;
  padding: 20rpx 56rpx;
  font-size: 28rpx;
  font-weight: 600;
}

/* 功能列表 */
.function-list {
  margin: 20rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(45, 52, 54, 0.08);
  border: 1rpx solid #E2E8F0;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #E2E8F0;
  transition: background 0.15s;
}

.function-item:last-child {
  border-bottom: none;
}

.function-item:active {
  background: #F8FAFC;
}

.item-text {
  flex: 1;
  font-size: 28rpx;
  color: #0F172A;
}

.logout-item .item-text {
  color: #EF4444;
}

.item-arrow {
  font-size: 40rpx;
  color: #CBD5E1;
  font-weight: 300;
}

/* 店铺信息 */
.shop-info {
  margin: 20rpx;
  padding: 20rpx 32rpx;
  text-align: center;
}

.shop-version {
  font-size: 24rpx;
  color: #CBD5E1;
  display: block;
}
</style>