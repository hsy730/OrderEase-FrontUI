<template>
  <div class="product-card bg-white rounded-lg p-4 mb-4">
    <div class="flex">
      <img :src="getImageUrl(product.image)" class="w-24 h-24 rounded-lg object-cover" />
      <div class="ml-4 flex-1">
        <div class="flex items-center">
          <span class="text-lg font-bold">{{ product.name }}</span>
          <van-tag v-if="product.isNew" mark type="warning" class="ml-2">新品</van-tag>
        </div>
        <div class="text-sm text-gray-500 mt-1">{{ product.description }}</div>
        <div class="flex items-center justify-between mt-2">
          <div class="text-[#C3A87C]">
            <span class="text-sm">¥</span>
            <span class="text-xl font-bold">{{ product.price }}</span>
            <span class="text-sm">起</span>
          </div>
          <van-button round size="small" color="#C3A87C">选规格</van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getImageUrl } from '@/utils/image';

defineProps({
  product: {
    type: Object,
    required: true
  }
})
</script>