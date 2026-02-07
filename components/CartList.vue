<template>
  <view class="cart-list">
    <view v-if="cartItems.length === 0" class="empty-cart">
      <text class="empty-icon">🛒</text>
      <text class="empty-text">购物车是空的</text>
      <text class="empty-tip">快去选购商品吧</text>
    </view>

    <scroll-view v-else class="cart-scroll" scroll-y>
      <view
        v-for="item in cartItems"
        :key="item.cartItemId"
        class="cart-item"
      >
        <!-- 商品信息 -->
        <view class="item-info">
          <view class="item-image-wrapper">
            <SmartImage
              :src="item.image"
              mode="aspectFill"
              class="item-image"
            />
          </view>

          <view class="item-details">
            <view class="item-name">{{ item.name }}</view>

            <!-- 选中的规格 -->
            <view v-if="item.selectedOptions && item.selectedOptions.length > 0" class="item-options">
              <view
                v-for="(optionGroup, index) in item.selectedOptions"
                :key="index"
                class="option-tag"
              >
                {{ optionGroup.category }}: {{ formatOptions(optionGroup.options) }}
              </view>
            </view>

            <view class="item-price">
              <text class="price-currency">¥</text>
              <text class="price-value">{{ item.finalPrice.toFixed(2) }}</text>
            </view>
          </view>
        </view>

        <!-- 数量控制 -->
        <view class="item-actions">
          <view class="quantity-control">
            <view
              :class="['quantity-btn', { disabled: item.count <= 1 }]"
              @click="handleDecrease(item)"
            >
              -
            </view>
            <view class="quantity-value">{{ item.count }}</view>
            <view
              class="quantity-btn"
              @click="handleIncrease(item)"
            >
              +
            </view>
          </view>

          <view class="delete-btn" @click="handleDelete(item)">
            <text class="delete-icon">×</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 购物车底部 -->
    <view v-if="cartItems.length > 0" class="cart-footer">
      <view class="total-info">
        <text class="total-label">合计：</text>
        <text class="total-price">
          <text class="price-currency">¥</text>
          <text class="price-value">{{ totalPrice.toFixed(2) }}</text>
        </text>
      </view>

      <button class="checkout-btn" @click="handleCheckout">
        去结算 ({{ totalCount }})
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import SmartImage from './SmartImage.vue'

const props = defineProps({
  cartItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['quantity-change', 'delete', 'checkout'])

// 计算购物车总数量
const totalCount = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + item.count, 0)
})

// 计算购物车总金额
const totalPrice = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + (item.finalPrice * item.count), 0)
})

// 格式化选项显示
const formatOptions = (options) => {
  if (!Array.isArray(options)) return ''
  return options.map(opt => opt.name).join('、')
}

// 增加数量
const handleIncrease = (item) => {
  emit('quantity-change', {
    cartItemId: item.cartItemId,
    count: item.count + 1
  })
}

// 减少数量
const handleDecrease = (item) => {
  if (item.count <= 1) return
  emit('quantity-change', {
    cartItemId: item.cartItemId,
    count: item.count - 1
  })
}

// 删除商品
const handleDelete = (item) => {
  emit('delete', item.cartItemId)
}

// 结算
const handleCheckout = () => {
  emit('checkout')
}
</script>

<style scoped>
.cart-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #999;
}

.cart-scroll {
  flex: 1;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: #fff;
  border-radius: var(--radius-md);
}

.item-info {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.item-image-wrapper {
  width: 160rpx;
  height: 160rpx;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #f5f5f5;
}

.item-image {
  width: 100%;
  height: 100%;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 24rpx;
  overflow: hidden;
}

.item-name {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 12rpx 0;
}

.option-tag {
  padding: 6rpx 12rpx;
  background: rgba(30, 64, 175, 0.08);
  color: var(--primary-blue);
  font-size: 22rpx;
  border-radius: 8rpx;
  border: 1rpx solid rgba(30, 64, 175, 0.15);
}

.item-price {
  display: flex;
  align-items: baseline;
}

.price-currency {
  font-size: 24rpx;
  color: #f56c6c;
  font-weight: bold;
}

.price-value {
  font-size: 36rpx;
  color: #f56c6c;
  font-weight: bold;
  margin-left: 4rpx;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 24rpx;
}

.quantity-control {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 32rpx;
  overflow: hidden;
}

.quantity-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: var(--text-primary);
  background: #fff;
  transition: all 0.2s;
}

.quantity-btn.disabled {
  color: #ccc;
}

.quantity-btn:active {
  background: var(--bg-muted);
}

.quantity-value {
  width: 64rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.delete-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fee;
  margin-top: 24rpx;
}

.delete-icon {
  font-size: 48rpx;
  color: #f56c6c;
  line-height: 1;
}

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #fff;
  border-top: 1rpx solid var(--border-light);
}

.total-info {
  display: flex;
  align-items: center;
}

.total-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.total-price {
  display: flex;
  align-items: baseline;
  margin-left: 8rpx;
}

.total-price .price-value {
  font-size: 40rpx;
}

.checkout-btn {
  padding: 20rpx 48rpx;
  background: var(--gradient-primary);
  color: #fff;
  border: none;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.checkout-btn:active {
  opacity: 0.9;
}
</style>
