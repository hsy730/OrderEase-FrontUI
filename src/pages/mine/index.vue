<template>
  <view class="mine-page">
    <view v-if="isLoggedIn" class="user-info">
      <image class="avatar" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" mode="aspectFill" />
      <view class="user-detail">
        <text class="username">{{ userInfo.username || '用户' }}</text>
        <text class="phone">手机号: {{ formatPhone(userInfo.phone) }}</text>
      </view>
    </view>

    <view v-else class="login-prompt">
      <text class="prompt-text">您还未登录</text>
      <view class="button-group">
        <button class="login-btn" @click="goToLogin">登录</button>
      </view>
    </view>

    <view class="function-list">
      <view v-if="isLoggedIn" class="function-item" @click="">
        <text class="item-icon">📍</text>
        <text class="item-text">收货地址</text>
        <text class="item-arrow">></text>
      </view>
      <view v-if="isLoggedIn" class="function-item" @click="">
        <text class="item-icon">📱</text>
        <text class="item-text">联系电话</text>
        <text class="item-arrow">></text>
      </view>
      <view v-if="isLoggedIn" class="function-item" @click="">
        <text class="item-icon">⚙️</text>
        <text class="item-text">账户设置</text>
        <text class="item-arrow">></text>
      </view>
      <view v-if="isLoggedIn" class="function-item" @click="logout">
        <text class="item-icon">🚪</text>
        <text class="item-text">退出登录</text>
        <text class="item-arrow">></text>
      </view>
      <view class="function-item" @click="">
        <text class="item-icon">ℹ️</text>
        <text class="item-text">关于我们</text>
        <text class="item-arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const userInfo = ref({})

const isLoggedIn = computed(() => {
  return !!uni.getStorageSync('user_id')
})

const formatPhone = (phone) => {
  if (!phone) return '未设置'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

const logout = () => {
  uni.showModal({
    title: '确认退出',
    content: '您确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('user_id')
        uni.removeStorageSync('user_info')
        uni.reLaunch({
          url: '/pages/mine/index'
        })
      }
    }
  })
}

onMounted(() => {
  if (isLoggedIn.value) {
    const userInfoStr = uni.getStorageSync('user_info')
    if (userInfoStr) {
      userInfo.value = JSON.parse(userInfoStr)
    }
  }
})
</script>

<style scoped>
.mine-page {
  min-height: calc(100vh - 50px);
  background: var(--bg-secondary);
  padding-bottom: 50px;
}

.user-info {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  margin: 12px;
  border: 1px solid var(--border-light);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid var(--border-light);
}

.user-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
}

.phone {
  font-size: 14px;
  color: var(--text-secondary);
}

.login-prompt {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  margin: 12px;
  border: 1px solid var(--border-light);
  padding: 24px;
  text-align: center;
}

.prompt-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  display: block;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.login-btn {
  padding: 10px 32px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.function-list {
  margin: 12px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
}

.function-item {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-light);
}

.function-item:last-child {
  border-bottom: none;
}

.item-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.item-text {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary);
}

.item-arrow {
  color: var(--text-tertiary);
  font-size: 14px;
}
</style>
