<template>
  <scroll-view class="category-list" scroll-y>
    <view 
      v-for="(category, index) in categories" 
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
  background: #FDFDFD;
}

.category-item {
  padding: 16px 12px;
  background: transparent;
  color: #475569;
  transition: all 0.25s ease;
  border-left: 4px solid transparent;
  text-align: center;
}

.category-item.active {
  font-weight: 600;
  border-left-color: #F97316;
}

.category-text {
  font-size: 14px;
  line-height: 1.4;
}
</style>
