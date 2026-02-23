<template>
  <view class="mine-page">
    <!-- 顶部固定标题栏 -->
    <HeaderBar />

    <!-- 用户信息 -->
    <view v-if="isLoggedIn" class="user-info">
      <image
        class="user-avatar"
        src="/static/user-avatar.svg"
        mode="aspectFill"
      />
      <view class="user-details">
        <text class="username">{{ userInfo.username || '用户' }}</text>
        <text class="phone">{{ formatPhone(userInfo.phone) }}</text>
      </view>
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
      <view v-if="isLoggedIn" class="function-item" @click="showToast('功能开发中')">
        <text class="item-icon">📍</text>
        <text class="item-text">收货地址</text>
        <text class="item-arrow">›</text>
      </view>
      <view v-if="isLoggedIn" class="function-item" @click="showToast('功能开发中')">
        <text class="item-icon">📞</text>
        <text class="item-text">联系电话</text>
        <text class="item-arrow">›</text>
      </view>
      <view v-if="isLoggedIn" class="function-item" @click="showToast('功能开发中')">
        <text class="item-icon">⚙️</text>
        <text class="item-text">账户设置</text>
        <text class="item-arrow">›</text>
      </view>
      <view v-if="isLoggedIn" class="function-item" @click="handleLogout">
        <text class="item-icon">🚪</text>
        <text class="item-text" style="color: #EF4444;">退出登录</text>
        <text class="item-arrow">›</text>
      </view>
      <view class="function-item" @click="showToast('OrderEase 点单系统 v1.0.0')">
        <text class="item-icon">ℹ️</text>
        <text class="item-text">关于我们</text>
        <text class="item-arrow">›</text>
      </view>
    </view>

    <!-- 店铺信息 -->
    <view class="shop-info">
      <text class="shop-version">V1.0.0</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storage } from '@/store'
import HeaderBar from '@/components/HeaderBar.vue'

const userInfo = ref({})

// 计算属性：是否已登录
const isLoggedIn = computed(() => {
  return !!storage.getItem('user_id')
})

// 格式化手机号显示
const formatPhone = (phone) => {
  if (!phone) return '未设置'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 跳转到登录页面
const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '您确定要退出登录吗？',
    confirmColor: '#1E40AF',
    success: (res) => {
      if (res.confirm) {
        // 清除用户信息
        storage.removeItem('user_id')
        storage.removeItem('user_info')
        storage.removeItem('token')

        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })

        // 重新加载页面数据
        userInfo.value = {}
      }
    }
  })
}

// 显示提示
const showToast = (message) => {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

// 页面加载时获取用户信息
onMounted(() => {
  if (isLoggedIn.value) {
    const userInfoStr = storage.getItem('user_info')
    if (userInfoStr) {
      userInfo.value = userInfoStr
    }
  }
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
  margin: 32rpx;
  margin-top: 120rpx;
  padding: 40rpx 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 16rpx rgba(45, 52, 54, 0.08);
  border: 1rpx solid #E2E8F0;
}

.user-avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  border: 4rpx solid #E2E8F0;
  margin-right: 32rpx;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 40rpx;
  font-weight: bold;
  color: #0F172A;
  margin-bottom: 12rpx;
}

.phone {
  font-size: 28rpx;
  color: #94A3B8;
}

/* 登录提示卡片 */
.login-prompt {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin: 32rpx;
  margin-top: 120rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  box-shadow: 0 2rpx 16rpx rgba(45, 52, 54, 0.08);
  border: 1rpx solid #E2E8F0;
}

.prompt-text {
  font-size: 32rpx;
  color: #475569;
  margin-bottom: 32rpx;
  display: block;
}

.login-btn {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
  border-radius: 56rpx;
  padding: 24rpx 64rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(30, 64, 175, 0.3);
}

/* 功能列表 */
.function-list {
  margin: 32rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(45, 52, 54, 0.08);
  border: 1rpx solid #E2E8F0;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #E2E8F0;
  transition: background 0.15s;
}

.function-item:last-child {
  border-bottom: none;
}

.function-item:active {
  background: #F8FAFC;
}

.item-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.item-text {
  flex: 1;
  font-size: 30rpx;
  color: #0F172A;
}

.item-arrow {
  font-size: 48rpx;
  color: #CBD5E1;
  font-weight: 300;
}

/* 店铺信息 */
.shop-info {
  margin: 32rpx;
  padding: 24rpx 32rpx;
  text-align: center;
}

.shop-version {
  font-size: 24rpx;
  color: #CBD5E1;
  display: block;
}
</style>