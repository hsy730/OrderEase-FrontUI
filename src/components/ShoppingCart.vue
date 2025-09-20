<template>
  <div class="cart-bar" v-if="totalCount > 0">
    <div class="cart-info">
      <van-badge :content="totalCount" :show="totalCount > 0">
        <!-- 添加点击事件 -->
        <van-icon 
          name="shopping-cart-o" 
          size="24" 
          :class="totalCount > 0 ? 'text-[#1989fa]' : 'text-gray-500'" 
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
        :disabled="totalCount === 0"
        :color="totalCount === 0 ? '#7D7E80' : '#1989fa'"
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
  if (count === 0) {
    // 当数量为0时，发出删除事件
    emit('remove', item.cartItemId || item.id)
  } else {
    // 否则更新数量
    emit('update:count', { id: item.cartItemId || item.id, count: count })
  }
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
  background: white;
  border-top: 1px solid #eee;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1000;
}

.cart-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price-info .symbol {
  font-size: 12px;
  color: #333;
}

.price-info .amount {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.submit-btn {
  width: 120px;
}

/* 遮罩层样式 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 100px); /* 减去底部购物车栏和按钮区域的高度 */
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色遮罩 */
  z-index: 999; /* 确保遮罩在购物车列表下方，但在其他内容上方 */
}

/* 新增购物车列表样式 */
.cart-list {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #eee;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  /* padding: 10px; */
  max-height: min(80vh, 600px); /* 限制最大高度为视口80%或400px中的较小值 */
  height: fit-content; /* 内容自适应高度 */
  min-height: 100px; /* 最小高度 */
  overflow-y: auto;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1001; /* 确保购物车列表在遮罩上方 */
}

.cart-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  margin: 0;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.clear-cart {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-cart:hover {
  background-color: #f5f5f5;
}

.clear-cart.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-cart.disabled:hover {
  background-color: transparent;
}

.clear-icon {
  color: #999;
  margin-right: 4px;
}

.clear-text {
  font-size: 14px;
  color: #999;
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
  /* padding: 8px 0; */
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
  color: #666;
  margin-top: 4px;
}

.options-placeholder {
  height: 14px; /* 与.options的字体大小和行高保持一致 */
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
  border: 1px solid #eee;
  padding: 2px;
}
.stepper-container {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

/* 商品项信息样式 */
.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* gap: 2px; */
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.item-price {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-top: 2px;
}
</style>