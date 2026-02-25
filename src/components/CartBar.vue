<template>
  <view class="cart-bar">
    <view class="cart-info" @click="emit('toggle')">
      <view class="cart-icon-wrapper" :class="{ 'cart-bounce': bouncing }">
        <view v-if="count > 0" class="cart-badge">{{ count }}</view>
        <text class="cart-icon">🛍️</text>
      </view>
      <view class="price-info">
        <text class="symbol">¥</text>
        <text class="amount">{{ amount.toFixed(2) }}</text>
      </view>
    </view>
    <view class="submit-btn" @click="emit('submit')">
      <text class="submit-text">{{ buttonText }}</text>
    </view>
  </view>
</template>

<script setup>
/**
 * @fileoverview 购物车栏组件
 * @module components/CartBar
 */

const props = defineProps({
  count: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    default: 0
  },
  buttonText: {
    type: String,
    default: '选好了'
  },
  bouncing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle', 'submit'])
</script>

<style scoped>
.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #FFFFFF;
  border-top: 1rpx solid #E2E8F0;
  display: flex;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 8rpx 32rpx rgba(30, 64, 175, 0.15);
}

.cart-info {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  gap: 24rpx;
}

.cart-icon-wrapper {
  position: relative;
}

.cart-icon {
  font-size: 48rpx;
}

.cart-badge {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  background: #F97316;
  color: #FFFFFF;
  border-radius: 24rpx;
  padding: 4rpx 16rpx;
  font-size: 20rpx;
  font-weight: bold;
  min-width: 36rpx;
  text-align: center;
}

.cart-bounce {
  animation: cartBounce 0.4s ease-out;
}

@keyframes cartBounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.2); }
  50% { transform: scale(0.9); }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price-info .symbol {
  font-size: 24rpx;
  color: #475569;
}

.price-info .amount {
  font-size: 40rpx;
  font-weight: bold;
  color: #EA580C;
}

.submit-btn {
  width: 240rpx;
  height: 80rpx;
  margin: 10rpx 16rpx;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(30, 64, 175, 0.3);
}

.submit-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
