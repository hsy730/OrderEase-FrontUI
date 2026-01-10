<template>
  <div class="cart-bar" v-if="totalCount > 0">
    <div class="cart-info">
      <van-badge :content="totalCount" :show="totalCount > 0">
        <!-- 添加点击事件 -->
        <van-icon
          name="shopping-cart-o"
          size="24"
          :class="totalCount > 0 ? 'text-[var(--primary-blue)]' : 'text-gray-500'"
          @click="toggleCartList"
        />
      </van-badge>
      <div class="price-info" v-if="totalAmount > 0">
        <span class="symbol">¥</span>
        <span class="amount">{{ totalAmount }}</span>
      </div>
    </div>
    <!-- 遮罩层 -->
    <div v-if="show" class="overlay" @click="toggleCartList"></div>
    <!-- 新增购物车列表 -->
    <div v-if="show" class="cart-list">
      <div class="cart-list-header">
        <span class="header-title">已选商品</span>
        <div class="clear-cart" @click="$emit('clear')" :class="{ disabled: totalCount === 0 }">
          <van-icon name="delete-o" size="16" class="clear-icon" />
          <span class="clear-text">清空</span>
        </div>
      </div>
      <ul style="margin: 10px;">
        <li v-for="(item, index) in props.cartItems" :key="`${item.id}-${index}`">
          <div class="cart-item">
            <div class="item-info">
              <div class="item-details">
                <div class="item-name">{{ item.name }}</div>
                <!-- 显示选项信息 -->
                <div v-if="item.selectedOptions && item.selectedOptions.length" class="options">
                  {{ item.selectedOptions.map(option => option.options.join(', ')).join(', ') }}
                </div>
                <div v-else class="options-placeholder"></div>
                <!-- 显示商品价格 -->
                <div class="item-price">
                  ¥ {{ formatPrice(item.finalPrice || item.price || 0) }}
                </div>
              </div>
            </div>
            <div class="controls">
              <van-stepper
                :model-value="item.count"
                :min="0"
                theme="round"
                button-size="22"
                disable-input
                @update:model-value="handleCountChange(item, $event)"
              />
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div class="submit-btn">
      <van-button
        block
        round
        :disabled="totalCount === 0"
        :color="totalCount === 0 ? '#CBD5E1' : '#1E40AF'"
        @click="$emit('submit')"
      >
        选好了
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  cartItems: {
    type: Array,
    required: true
  },
  show: { // 接收父组件传递的show值
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
    // 使用finalPrice（如果存在）否则使用基础价格
    const price = item.finalPrice || item.price || 0
    return sum + price * item.count
  }, 0)
})


const toggleCartList = () => {
  emit('update:show', !props.show)
}

const handleCountChange = (item, count) => {
  // 总是发送更新事件，包括数量为0的情况
  emit('update:count', item.cartItemId || item.id, count)
}

const formatPrice = (price) => {
  // 如果价格是整数，不显示小数部分
  if (Number.isInteger(price)) {
    return price.toString()
  } else {
    // 否则保留两位小数
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

.cart-info :deep(.van-icon) {
  color: var(--primary-blue);
  transition: all var(--transition-base);
}

.cart-info :deep(.van-icon):hover {
  transform: scale(1.1);
  color: var(--primary-blue-light);
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
  font-size: 22px;
  font-weight: bold;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.submit-btn {
  width: 120px;
}

.submit-btn :deep(.van-button) {
  background: var(--gradient-primary);
  border: none;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.submit-btn :deep(.van-button:not(.van-button--disabled)):hover {
  background: var(--gradient-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.submit-btn :deep(.van-button--disabled) {
  background: var(--text-tertiary);
  box-shadow: none;
}

/* 遮罩层样式 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 100px);
  background-color: var(--bg-overlay);
  z-index: var(--z-modal-backdrop);
}

/* 购物车列表样式 */
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
  overflow-y: auto;
  z-index: var(--z-modal);
  box-shadow: var(--shadow-xl);
  animation: slideUp var(--transition-base) ease-out;
}

.cart-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  margin: 0;
  border-top-left-radius: var(--radius-xl);
  border-top-right-radius: var(--radius-xl);
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.clear-cart {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.clear-cart:not(.disabled):hover {
  background-color: var(--bg-tertiary);
}

.clear-cart.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-icon {
  color: var(--color-danger);
  margin-right: 4px;
}

.clear-text {
  font-size: 14px;
  color: var(--color-danger);
}

.cart-list ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.cart-list li {
  padding: 5px 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  transition: background var(--transition-fast);
}

.cart-item:hover {
  background: var(--bg-secondary);
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
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.options-placeholder {
  height: 14px;
  margin: 2px 0;
}

.options span {
  display: block;
  margin-bottom: 2px;
}

.van-stepper {
  vertical-align: middle;
}

.count-input {
  width: 40px;
  text-align: center;
  padding: 2px;
}

.stepper-container {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

/* 计数器按钮样式 */
:deep(.van-stepper__plus),
:deep(.van-stepper__minus) {
  background: var(--gradient-primary);
  box-shadow: var(--shadow-sm);
}

/* 商品项信息样式 */
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
</style>