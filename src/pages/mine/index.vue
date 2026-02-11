<template>
  <view class="mine-container">
    <view class="user-header" @click="goToUserInfo">
      <view v-if="isLoggedIn" class="user-info">
        <image
          :src="userInfo.avatar || defaultAvatar"
          mode="aspectFill"
          class="user-avatar"
        />
        <view class="user-details">
          <text class="user-name">{{ userInfo.username || '用户' }}</text>
          <text class="user-phone">{{ formatPhone(userInfo.phone) }}</text>
        </view>
      </view>
      <view v-else class="login-prompt">
        <text class="login-text">登录 / 注册</text>
      </view>
      <text class="arrow">›</text>
    </view>

    <view v-if="isLoggedIn" class="stats-section">
      <view class="stat-item" @click="goToOrders('all')">
        <text class="stat-value">{{ stats.totalOrders }}</text>
        <text class="stat-label">全部订单</text>
      </view>
      <view class="stat-item" @click="goToOrders('pending')">
        <text class="stat-value">{{ stats.pendingOrders }}</text>
        <text class="stat-label">待支付</text>
      </view>
      <view class="stat-item" @click="goToOrders('completed')">
        <text class="stat-value">{{ stats.completedOrders }}</text>
        <text class="stat-label">已完成</text>
      </view>
    </view>

    <view class="menu-section">
      <view
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        @click="handleMenuClick(item)"
      >
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-title">{{ item.title }}</text>
        </view>
        <view class="menu-right">
          <text v-if="item.badge" class="menu-badge">{{ item.badge }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <button v-if="isLoggedIn" class="logout-btn" @click="handleLogout">
      退出登录
    </button>

    <view class="version-info">
      <text>OrderEase v1.0.0</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const defaultAvatar = 'https://via.placeholder.com/200x200?text=User'

const userInfo = ref({})
const isLoggedIn = computed(() => {
  return !!uni.getStorageSync('user_id')
})

const stats = ref({
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0
})

const menuItems = ref([
  { id: 1, icon: '📋', title: '我的订单', badge: '', action: 'orders' },
  { id: 2, icon: '🎫', title: '我的优惠券', badge: '3', action: 'coupons' },
  { id: 3, icon: '❤️', title: '我的收藏', badge: '', action: 'favorites' },
  { id: 4, icon: '📍', title: '收货地址', badge: '', action: 'address' },
  { id: 5, icon: '💬', title: '联系客服', badge: '', action: 'contact' },
  { id: 6, icon: '⚙️', title: '设置', badge: '', action: 'settings' },
  { id: 7, icon: '📝', title: '意见反馈', badge: '', action: 'feedback' },
  { id: 8, icon: 'ℹ️', title: '关于我们', badge: '', action: 'about' }
])

const formatPhone = (phone) => {
  if (!phone) return ''
  const phoneStr = phone.toString()
  return phoneStr.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

const loadUserInfo = () => {
  const user = uni.getStorageSync('user_info')
  if (user) {
    userInfo.value = JSON.parse(user)
  }

  stats.value = {
    totalOrders: 12,
    pendingOrders: 2,
    completedOrders: 10
  }
}

const goToUserInfo = () => {
  if (!isLoggedIn.value) {
    uni.navigateTo({
      url: '/pages/login/index'
    })
    return
  }

  uni.showToast({
    title: '用户信息页开发中',
    icon: 'none'
  })
}

const goToOrders = (status = 'all') => {
  if (!isLoggedIn.value) {
    uni.navigateTo({
      url: '/pages/login/index'
    })
    return
  }

  uni.switchTab({
    url: '/pages/orders/index'
  })
}

const handleMenuClick = (item) => {
  if (item.id !== 6 && item.id !== 7 && item.id !== 8) {
    if (!isLoggedIn.value) {
      uni.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
  }

  switch (item.action) {
    case 'orders':
      goToOrders()
      break
    case 'coupons':
      uni.showToast({
        title: '优惠券功能开发中',
        icon: 'none'
      })
      break
    case 'favorites':
      uni.showToast({
        title: '收藏功能开发中',
        icon: 'none'
      })
      break
    case 'address':
      uni.showToast({
        title: '地址管理功能开发中',
        icon: 'none'
      })
      break
    case 'contact':
      uni.showModal({
        title: '联系客服',
        content: '客服电话：400-123-4567',
        confirmText: '拨打',
        success: (res) => {
          if (res.confirm) {
            uni.makePhoneCall({
              phoneNumber: '4001234567'
            })
          }
        }
      })
      break
    case 'settings':
      goToSettings()
      break
    case 'feedback':
      uni.showToast({
        title: '意见反馈功能开发中',
        icon: 'none'
      })
      break
    case 'about':
      showAbout()
      break
    default:
      break
  }
}

const goToSettings = () => {
  uni.showToast({
    title: '设置功能开发中',
    icon: 'none'
  })
}

const showAbout = () => {
  uni.showModal({
    title: '关于 OrderEase',
    content: 'OrderEase v1.0.0\n\n便捷点餐，美味生活\n\n© 2026 OrderEase',
    showCancel: false
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('user_id')
        uni.removeStorageSync('user_info')

        userInfo.value = {}

        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })

        setTimeout(() => {
          loadUserInfo()
        }, 1000)
      }
    }
  })
}

onMounted(() => {
  loadUserInfo()
})

onShow(() => {
  loadUserInfo()
})
</script>

<style scoped>
.mine-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding-bottom: 80rpx;
}

.user-header {
  background: var(--gradient-primary);
  padding: 96rpx 48rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 48rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 8rpx solid rgba(255, 255, 255, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.user-phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-prompt {
  flex: 1;
  display: flex;
  align-items: center;
}

.login-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.arrow {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stats-section {
  background: #fff;
  display: flex;
  margin: 0 48rpx 48rpx;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 0;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1rpx;
  height: 60rpx;
  background: var(--border-light);
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--primary-blue);
  margin-bottom: 16rpx;
}

.stat-label {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.menu-section {
  background: #fff;
  margin: 0 48rpx 48rpx;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 64rpx;
  border-bottom: 1rpx solid var(--bg-secondary);
  transition: background 0.2s;
}

.menu-item:active {
  background: var(--bg-secondary);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 48rpx;
}

.menu-icon {
  font-size: 40rpx;
}

.menu-title {
  font-size: 28rpx;
  color: var(--text-primary);
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.menu-badge {
  min-width: 64rpx;
  height: 64rpx;
  padding: 0 16rpx;
  background: #f56c6c;
  color: #fff;
  font-size: 20rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-arrow {
  font-size: 36rpx;
  color: var(--text-secondary);
}

.logout-btn {
  margin: 0 48rpx;
  height: 96rpx;
  background: #fff;
  color: #f56c6c;
  border-radius: var(--radius-md);
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.logout-btn:active {
  background: var(--bg-secondary);
}

.logout-btn::after {
  border: none;
}

.version-info {
  text-align: center;
  padding: 64rpx 0;
  font-size: 24rpx;
  color: var(--text-secondary);
}
</style>
