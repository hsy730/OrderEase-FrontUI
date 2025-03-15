<template>
  <div class="cart-bar">
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
    <!-- 新增购物车列表 -->
    <div v-if="isCartListVisible" class="cart-list">
      <ul>
        <li v-for="item in props.cartItems" :key="item.id">
          <div class="cart-item">
            <span class="name">{{ item.name }}</span>
            <div class="controls">
              <van-stepper
                v-model="item.count"
                :min="1"
                theme="round"
                button-size="22"
                disable-input
                @change="$emit('update:count', { id: item.id, count: $event })"
                class="stepper-container"
              />
              <van-icon 
                name="delete-o" 
                class="delete-icon"
                @click.stop="$emit('remove', item.id)"
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
  }
})

// 修改defineEmits部分
defineEmits(['submit', 'increase', 'decrease', 'remove', 'update:count'])

const totalCount = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + item.count, 0)
})

const totalAmount = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + item.price * item.count, 0)
})

// 控制购物车列表显示隐藏
const isCartListVisible = ref(false)

const toggleCartList = () => {
  isCartListVisible.value = !isCartListVisible.value
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

/* 新增购物车列表样式 */
.cart-list {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #eee;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
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
  padding: 8px 0;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
}

.delete-icon {
  margin-top: 6px;
  line-height: 1;
  vertical-align: middle;
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

.delete-icon {
  color: var(--van-danger-color);
  margin-left: 12px;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
  background: rgba(255, 68, 68, 0.05);
}

.delete-icon:hover {
  background: rgba(255, 68, 68, 0.1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.delete-icon:active {
  transform: scale(0.95);
  background: rgba(255, 68, 68, 0.2);
}
.stepper-container {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>