<template>
  <view v-if="visible" class="popup-mask" :class="{ 'popup-closing': closing }" @click="emit('close')">
    <view class="popup-bottom" :class="{ 'popup-slide-down': closing }" @click.stop>
      <view class="popup-header">
        <text class="popup-title">{{ product?.name }}</text>
      </view>
      <scroll-view class="popup-content" scroll-y>
        <view
          v-for="category in product?.option_categories || []"
          :key="category.id"
          class="option-category"
        >
          <view class="category-title">
            <text>{{ category.name }}</text>
            <text v-if="category.is_required" class="required">*</text>
          </view>
          <view class="options-wrapper">
            <view
              v-for="option in category.options"
              :key="option.id"
              class="option-item"
              :class="{ selected: isOptionSelected(category, option) }"
              @click="emit('select', { category, option })"
            >
              <text>{{ option.name }}</text>
              <text v-if="option.price_adjustment > 0" class="price-adjust">+¥{{ option.price_adjustment }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="footer-actions">
        <view v-if="errorMessage" class="error-message">{{ errorMessage }}</view>
        <view class="left-section">
          <text class="price-display">
            ¥{{ (product?.price || 0) + optionTotal }}
          </text>
          <view class="stepper">
            <view class="stepper-btn minus" @click="emit('quantity', -1)">-</view>
            <view class="stepper-input">{{ quantity }}</view>
            <view class="stepper-btn plus" @click="emit('quantity', 1)">+</view>
          </view>
        </view>
        <view
          class="add-cart-btn"
          :class="{ 'btn-pulse': pulsing }"
          @click="emit('confirm')"
        >
          加入福袋
        </view>
      </view>
      <view class="close-btn" @click="emit('close')">×</view>
    </view>

    <view
      v-if="bubble.visible"
      class="lucky-bag-bubble"
      :style="bubbleStyle"
    >
      🛍️
    </view>
  </view>
</template>

<script setup>
/**
 * @fileoverview 商品选项弹窗组件
 * @module components/OptionsPopup
 */
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  closing: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  quantity: {
    type: Number,
    default: 1
  },
  selectedOptions: {
    type: Map,
    default: () => new Map()
  },
  optionTotal: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  pulsing: {
    type: Boolean,
    default: false
  },
  bubble: {
    type: Object,
    default: () => ({ visible: false, startX: 0, startY: 0, endX: 0, endY: 0 })
  }
})

const emit = defineEmits(['close', 'select', 'quantity', 'confirm'])

const isOptionSelected = (category, option) => {
  const categoryOptions = props.selectedOptions.get(category.id) || []
  return categoryOptions.some(opt => opt.id === option.id)
}

const bubbleStyle = computed(() => ({
  left: `${props.bubble.startX}px`,
  top: `${props.bubble.startY}px`,
  '--parabola-x': `${props.bubble.endX - props.bubble.startX}px`,
  '--parabola-y': `${props.bubble.endY - props.bubble.startY}px`
}))
</script>

<style scoped>
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.popup-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  /* #ifdef MP-WEIXIN */
  padding-bottom: env(safe-area-inset-bottom);
  /* #endif */
  /* #ifndef MP-WEIXIN */
  padding-bottom: 32rpx;
  /* #endif */
  z-index: 2001;
}

.popup-header {
  padding: 32rpx;
  text-align: center;
  border-bottom: 1rpx solid #E2E8F0;
}

.popup-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #0F172A;
}

.popup-content {
  max-height: 60vh;
  padding: 32rpx;
}

.option-category {
  margin-bottom: 40rpx;
}

.category-title {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #0F172A;
}

.required {
  color: #EF4444;
  margin-left: 8rpx;
}

.options-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-item {
  padding: 24rpx 32rpx;
  background-color: #F8FAFC;
  border: 2rpx solid #E2E8F0;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.option-item.selected {
  border-color: #1E40AF;
  color: #1E40AF;
  background: rgba(30, 64, 175, 0.08);
}

.price-adjust {
  font-size: 24rpx;
  color: #F97316;
}

.footer-actions {
  position: relative;
  padding: 32rpx;
  border-top: 1rpx solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.price-display {
  font-size: 40rpx;
  font-weight: bold;
  color: #EA580C;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stepper-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
}

.stepper-btn.plus {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
}

.stepper-btn.minus {
  background: #FFFFFF;
  color: #1E40AF;
  border: 1rpx solid #1E40AF;
}

.stepper-input {
  width: 48rpx;
  text-align: center;
  font-size: 26rpx;
  color: #0F172A;
}

.add-cart-btn {
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
  border-radius: 56rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.add-cart-btn.btn-pulse {
  animation: btnPulse 0.5s ease-out;
}

@keyframes btnPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.6);
  }
  50% {
    transform: scale(0.92);
    box-shadow: 0 0 0 24rpx rgba(30, 64, 175, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(30, 64, 175, 0);
  }
}

.error-message {
  position: absolute;
  top: -60rpx;
  left: 32rpx;
  right: 32rpx;
  background: #FEF2F2;
  border: 1rpx solid #FECACA;
  color: #DC2626;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 24rpx;
  right: 32rpx;
  font-size: 48rpx;
  color: #94A3B8;
  line-height: 1;
  padding: 8rpx;
}

.popup-closing {
  animation: maskFadeOut 0.4s ease-out forwards;
}

@keyframes maskFadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

.popup-slide-down {
  animation: slideDown 0.5s ease-out forwards;
}

@keyframes slideDown {
  0% { transform: translateY(0); }
  100% { transform: translateY(100%); }
}

.lucky-bag-bubble {
  position: fixed;
  font-size: 48rpx;
  transform: translate(-50%, -100%);
  pointer-events: none;
  z-index: 3000;
  animation: parabolaFly 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes parabolaFly {
  0% {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(calc(-50% + var(--parabola-x) * 0.5), calc(-100% - 150rpx)) scale(1.15);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--parabola-x)), calc(-100% + var(--parabola-y))) scale(0.5);
  }
}
</style>
