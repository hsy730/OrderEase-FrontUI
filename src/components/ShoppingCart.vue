<template>
  <view class="cart-bar" v-if="totalCount > 0">
    <view class="cart-info" @click="toggleCartList">
      <view class="cart-icon-wrapper">
        <view v-if="totalCount > 0" class="cart-badge">{{ totalCount }}</view>
        <text class="cart-icon">🛒</text>
      </view>
      <view class="price-info" v-if="totalAmount > 0">
        <text class="symbol">¥</text>
        <text class="amount">{{ totalAmount }}</text>
      </view>
    </view>
    
    <view v-if="show" class="overlay" @click="toggleCartList"></view>
    
    <view v-if="show" class="cart-list">
      <view class="cart-list-header">
        <text class="header-title">已选商品</text>
        <view class="clear-cart" @click="$emit('clear')">
          <text class="clear-icon">🗑️</text>
          <text class="clear-text">清空</text>
        </view>
      </view>
      <scroll-view class="cart-list-content" scroll-y>
        <view v-for="(item, index) in props.cartItems" :key="`${item.id}-${index}`" class="cart-item">
          <view class="item-info">
            <view class="item-details">
              <text class="item-name">{{ item.name }}</text>
              <view v-if="item.selectedOptions && item.selectedOptions.length" class="options">
                {{ item.selectedOptions.map(option => option.options.join(', ')).join(', ') }}
              </view>
              <view v-else class="options-placeholder"></view>
              <text class="item-price">¥{{ formatPrice(item.finalPrice || item.price || 0) }}</text>
            </view>
          </view>
          <view class="controls">
            <view class="stepper-wrapper">
              <view
                v-if="item.count > 0"
                class="stepper-btn stepper-minus"
                @click="handleCountChange(item, item.count - 1)"
              >
                -
              </view>
              <view v-if="item.count > 0" class="stepper-value">{{ item.count }}</view>
              <view
                class="stepper-btn stepper-plus"
                @click="handleCountChange(item, item.count + 1)"
              >
                +
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="submit-btn">
      <button
        class="submit-button"
        :disabled="totalCount === 0"
        @click="$emit('submit')"
      >
        选好了
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cartItems: {
    type: Array,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['submit', 'increase', 'decrease', 'remove', 'update:count', 'update:show', 'clear'])

const totalCount = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + item.count, 0)
})

const totalAmount = computed(() => {
  return props.cartItems.reduce((sum, item) => {
    const price = item.finalPrice || item.price || 0
    return sum + price * item.count
  }, 0)
})

const toggleCartList = () => {
  emit('update:show', !props.show)
}

const handleCountChange = (item, count) => {
  emit('update:count', item.cartItemId || item.id, count)
}

const formatPrice = (price) => {
  if (Number.isInteger(price)) {
    return price.toString()
  } else {
    return price.toFixed(2)
  }
}
</script>

<style scoped>
.cart-bar {
  height: 50px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: var(--z-fixed);
  box-shadow: var(--shadow-float);
}

.cart-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-icon-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-icon {
  font-size: 24px;
  color: var(--primary-blue);
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--accent-orange);
  color: var(--text-inverse);
  border: 2px solid var(--bg-primary);
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price-info .symbol {
  font-size: 12px;
  color: var(--text-secondary);
}

.price-info .amount {
  font-size: 20px;
  font-weight: bold;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.submit-btn {
  width: 120px;
}

.submit-button {
  width: 100%;
  height: 36px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: var(--shadow-md);
}

.submit-button:active {
  transform: translateY(0);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 100px);
  background-color: var(--bg-overlay);
  z-index: var(--z-modal-backdrop);
}

.cart-list {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border-top-left-radius: var(--radius-xl);
  border-top-right-radius: var(--radius-xl);
  max-height: min(80vh, 600px);
  height: fit-content;
  min-height: 100px;
  overflow: hidden;
  z-index: var(--z-modal);
  box-shadow: var(--shadow-xl);
}

.cart-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.clear-cart {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
}

.clear-icon {
  color: var(--color-danger);
  margin-right: 4px;
}

.clear-text {
  font-size: 14px;
  color: var(--color-danger);
}

.cart-list-content {
  max-height: 50vh;
  padding: 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.options {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.options-placeholder {
  height: 14px;
  margin: 2px 0;
}

.stepper-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stepper-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  box-shadow: var(--shadow-sm);
}

.stepper-plus {
  background: var(--gradient-primary);
  color: var(--text-inverse);
}

.stepper-minus {
  background: var(--bg-primary);
  color: var(--primary-blue);
  border: 1px solid var(--primary-blue);
}

.stepper-value {
  width: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.item-price {
  font-size: 14px;
  font-weight: bold;
  color: var(--price-primary);
  margin-top: 2px;
}

@media (max-width: 420px) {
  .price-info .amount {
    font-size: 18px;
  }

  .submit-btn {
    width: 90px;
  }
}
</style>
