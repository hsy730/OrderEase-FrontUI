<template>
  <scroll-view class="category-list" scroll-y>
    <view 
      v-for="(category, index) in categories" 
      v-if="category"
      :key="category.id"
      class="category-item"
      :class="{ 'active': activeCategory === category.id }"
      @click="handleSelect(category)"
    >
      <text class="category-text">{{ category.name }}</text>
    </view>
  </scroll-view>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  activeCategory: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['select'])

const handleSelect = (category) => {
  emit('select', category)
}
</script>

<style scoped>
.category-list {
  width: 100%;
  height: 100%;
  background: var(--bg-muted);
}

.category-item {
  padding: 16px 12px;
  background: transparent;
  color: var(--text-secondary);
  transition: all var(--transition-base);
  border-left: 4px solid transparent;
  text-align: center;
}

.category-item.active {
  background: var(--gradient-primary);
  color: var(--text-inverse);
  font-weight: 600;
  border-left-color: var(--accent-orange);
}

.category-text {
  font-size: 14px;
  line-height: 1.4;
}
</style>
