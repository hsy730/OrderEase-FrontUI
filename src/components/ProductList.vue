<template>
  <div class="product-list">
    <div v-for="product in products" :key="product.id" class="product-item">
      <van-image
        :src="getImageUrl(product.image)"
        width="60"
        height="60"
        radius="8"
      />
      <div class="product-info">
        <div class="product-name">{{ product.name }}</div>
        <div class="product-details">
          <div class="product-price">
            <span class="text-sm">¥</span>
            <span class="text-md font-bold">{{ product.price }}</span>
          </div>
          <div class="stepper-container">
            <van-stepper
              v-if="product.count > 0"
              :model-value="product.count"
              :min="0"
              theme="round"
              button-size="22"
              disable-input
              :before-change="(val) => beforeCountChange(product, val)"
              @update:model-value="(val) => handleCountChange(product, val)"
            />
            <van-stepper
              v-else
              :model-value="0"
              :min="0"
              :show-input="false"
              :show-minus="false"
              theme="round"
              button-size="22"
              disable-input
              :before-change="(val) => beforeCountChange(product, val)"
              @update:model-value="(val) => handleCountChange(product, val)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getImageUrl } from '@/utils/image';

defineProps({
  products: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['add-to-cart', 'show-cart-popup'])

// 修改事件处理函数
const handleCountChange = (product, newVal) => {
  // 从购物车同步数据
  if (product.count === newVal) {
    return
  }
  const lastValidCount = product.lastCount || 0
  
  if (product.option_categories?.length && newVal < lastValidCount) {
    // 创建新对象触发响应式更新
    Object.assign(product, {
      count: lastValidCount,
      lastCount: lastValidCount
    })
    return
  }

  const action = newVal > lastValidCount ? 'add' : 'remove'
  product.lastCount = newVal
  product.count = newVal
  
  // 当数量减少到0时，确保正确同步
  if (newVal === 0) {
    // 重置lastCount以便下次增加操作正确处理
    product.lastCount = 0
  }
  
  emit('add-to-cart', { 
    ...product,
    count: newVal,
    action
  })
}

const beforeCountChange = (product, newVal) => {
  const lastValidCount = product.lastCount || 0
  // 阻止带选项商品减少操作并显示购物车
  if (product.option_categories?.length && newVal < lastValidCount) {
    emit('show-cart-popup', product)
    return false
  }
  
  // 当数量减少到0时，确保正确同步
  if (newVal === 0) {
    // 重置lastCount以便下次增加操作正确处理
    product.lastCount = 0
  }
  
  return true
}
</script>

<style scoped>
.product-item {
  display: flex;
  margin-bottom: 16px;
  background: #fff;
  padding: 8px;
  border-radius: 8px;
  align-items: center;
}

.product-info {
  margin-left: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 60px; /* 与图片高度一致 */
}

.product-name {
  font-size: 15px;
  font-weight: 500;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-price {
  color: #333;
  font-weight: bold;
}

.stepper-container {
  display: flex;
  justify-content: flex-end;
}
</style>