<template>
  <scroll-view
    class="category-list"
    scroll-y
    :scroll-top="scrollTop"
    scroll-with-animation
  >
    <view
      v-for="category in categories"
      :key="category.id"
      :class="['category-item', { active: activeId === category.id }]"
      @click="handleCategoryClick(category)"
    >
      <text class="category-name">{{ category.name }}</text>
      <view v-if="activeId === category.id" class="active-indicator"></view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  activeId: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['category-click'])

const scrollTop = ref(0)

const handleCategoryClick = (category) => {
  emit('category-click', category)
}
</script>

<style scoped>
.category-list {
  width: 200rpx;
  height: 100vh;
  background: var(--bg-secondary);
}

.category-item {
  position: relative;
  padding: 32rpx 24rpx;
  text-align: center;
  border-bottom: 1rpx solid var(--border-light);
  transition: all 0.2s;
}

.category-item.active {
  background: #fff;
}

.category-name {
  font-size: 28rpx;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.category-item.active .category-name {
  color: var(--primary-blue);
  font-weight: bold;
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8rpx;
  height: 40rpx;
  background: var(--gradient-primary);
  border-radius: 0 8rpx 8rpx 0;
}
</style>
