<template>
  <view>
    <view v-if="visible" class="overlay" @click="emit('close')"></view>
    <view v-if="visible" class="cart-list">
      <view class="cart-list-header">
        <text class="header-title">已选商品</text>
        <view class="clear-cart" @click="handleClear">
          <text class="clear-text">清空</text>
        </view>
      </view>
      <scroll-view class="cart-scroll" scroll-y>
        <view
          v-for="item in items"
          :key="item.cartItemId || item.id"
          class="cart-item"
        >
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <view class="item-meta">
              <text class="options">
                {{ formatOptions(item.selectedOptions) }}
              </text>
              <text class="item-price">¥{{ (item.finalPrice || item.price || 0).toFixed(2) }}</text>
            </view>
          </view>
          <view class="controls">
            <Stepper
              :model-value="item.count"
              :min="0"
              @change="handleChange(item, $event.delta)"
            />
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
/**
 * @fileoverview 购物车弹窗组件
 * @module components/CartPopup
 */
import Stepper from './Stepper.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'clear', 'change'])

const formatOptions = (selectedOptions) => {
  if (!selectedOptions || !selectedOptions.length) return ''
  return selectedOptions.map(o => o.options.join(', ')).join(', ')
}

const handleChange = (item, delta) => {
  emit('change', { item, delta })
}

const handleClear = () => {
  emit('clear')
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 200rpx);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.cart-list {
  position: absolute;
  bottom: 100rpx;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  max-height: 80vh;
  overflow: hidden;
  z-index: 1000;
}

.cart-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background-color: #F8FAFC;
  border-bottom: 1rpx solid #E2E8F0;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #0F172A;
}

.clear-cart {
  padding: 8rpx 16rpx;
}

.clear-text {
  font-size: 28rpx;
  color: #EF4444;
}

.cart-scroll {
  max-height: 60vh;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #E2E8F0;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 8rpx;
}

.item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
}

.options {
  font-size: 24rpx;
  color: #94A3B8;
  min-height: 32rpx;
}

.item-price {
  font-size: 28rpx;
  font-weight: bold;
  color: #EA580C;
}

.controls {
  display: flex;
  align-items: center;
}
</style>
