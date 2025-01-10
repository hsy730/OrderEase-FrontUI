<template>
  <div class="cart-bar">
    <div class="cart-info">
      <van-badge :content="totalCount" :show="totalCount > 0">
        <van-icon name="shopping-cart-o" size="24" :class="totalCount > 0 ? 'text-[#1989fa]' : 'text-gray-500'" />
      </van-badge>
      <div class="price-info" v-if="totalAmount > 0">
        <span class="symbol">¥</span>
        <span class="amount">{{ totalAmount }}</span>
      </div>
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
import { computed } from 'vue'

const props = defineProps({
  cartItems: {
    type: Array,
    required: true
  }
})

defineEmits(['submit'])

const totalCount = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + item.count, 0)
})

const totalAmount = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + item.price * item.count, 0)
})
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
  z-index: 100;
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
</style> 