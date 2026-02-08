<template>
  <view class="cart-bar" v-if="totalCount > 0">
    <view class="cart-info" @click="toggleCartList">
      <view class="cart-icon-wrapper">
        <view v-if="totalCount > 0" class="cart-badge">{{ totalCount }}</view>
        <uni-icons type="cart" size="24" color="#1E40AF"></uni-icons>
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
          <uni-icons type="trash" size="16" color="#EF4444" style="margin-right: 4px;"></uni-icons>
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
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 10;
  box-shadow: 0 8px 32px rgba(30, 64, 175, 0.15);
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

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #F97316;
  color: #FFFFFF;
  border: 2px solid #FFFFFF;
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
  color: #475569;
}

.price-info .amount {
  font-size: 20px;
  font-weight: bold;
  color: #1E40AF;
}

.submit-btn {
  width: 120px;
}

.submit-button {
  width: 100%;
  height: 36px;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.12);
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
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 500;
}

.cart-list {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  max-height: min(80vh, 600px);
  height: fit-content;
  min-height: 100px;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 16px 48px rgba(30, 64, 175, 0.18);
}

.cart-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #F8FAFC;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
}

.clear-cart {
  display: flex;
  align-items: center;
  padding: 8px;
}

.clear-text {
  font-size: 14px;
  color: #EF4444;
}

.cart-list-content {
  max-height: 50vh;
  padding: 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #E2E8F0;
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
  color: #94A3B8;
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
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.08);
}

.stepper-plus {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
}

.stepper-minus {
  background: #FFFFFF;
  color: #1E40AF;
  border: 1px solid #1E40AF;
}

.stepper-value {
  width: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #0F172A;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
}

.item-price {
  font-size: 14px;
  font-weight: bold;
  color: #EA580C;
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
