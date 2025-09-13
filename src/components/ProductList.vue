<template>
  <div class="product-list">
    <div v-for="product in products" :key="product.id" class="product-item">
      <van-image
        :src="getImageUrl(product.image)"
        width="100"
        height="100"
        radius="8"
      />
      <div class="product-info">
        <div class="product-name">{{ product.name }}</div>
        <div class="product-price">
          <span class="text-sm">¥</span>
          <span class="text-lg font-bold">{{ product.price }}</span>
        </div>
        <div class="stepper-container">
          <van-stepper
            :model-value="product.count"
            :min="0"
            theme="round"
            button-size="22"
            disable-input
            @update:model-value="(val) => handleCountChange(product, val)"
          />
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

const emit = defineEmits(['add-to-cart'])

// 修改事件处理函数
const handleCountChange = (product, newVal) => {
  const updatedProduct = { 
    ...product,
    count: newVal
  }
  emit('add-to-cart', updatedProduct)
}
</script>

<style scoped>
.product-item {
  display: flex;
  margin-bottom: 16px;
  background: #fff;
  padding: 8px;
  border-radius: 8px;
}

.product-info {
  margin-left: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 15px;
  font-weight: 500;
}

.product-price {
  margin-top: 8px;
  color: #ff4d4f;
}

.stepper-container {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>