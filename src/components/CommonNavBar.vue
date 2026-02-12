<template>
  <view class="nav-bar-wrapper">
    <view class="nav-bar" :class="{ 'has-back': showBack }">
      <view v-if="showBack" class="nav-bar-left" @click="handleBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="nav-bar-title">
        <text>{{ title }}</text>
      </view>
      <view class="nav-bar-right"></view>
    </view>
    <view class="nav-bar-placeholder"></view>
  </view>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  }
})

const handleBack = () => {
  if (props.showBack) {
    // 使用 uni-app API 返回上一页
    uni.navigateBack({
      delta: 1
    })
  }
}
</script>

<style scoped>
.nav-bar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  padding-top: env(safe-area-inset-top);
  background: var(--bg-primary, #FFFFFF);
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.05);
  border-bottom: 1rpx solid var(--border-light, #E2E8F0);
}

.nav-bar-left {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 48rpx;
  color: var(--primary-blue, #1E40AF);
  font-weight: 300;
}

.nav-bar-title {
  flex: 1;
  text-align: center;
}

.nav-bar-title text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary, #0F172A);
}

.nav-bar-right {
  width: 80rpx;
}

.nav-bar-placeholder {
  height: 88rpx;
  padding-top: env(safe-area-inset-top);
}
</style>
