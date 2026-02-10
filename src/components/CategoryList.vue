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
  background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%);
}

.category-item {
  padding: 16px 12px;
  background: transparent;
  color: #64748B;
  transition: all 0.25s ease;
  border-left: 4px solid transparent;
  text-align: center;
  position: relative;
}

.category-item.active {
  font-weight: 600;
  color: #1E40AF;
  background: linear-gradient(90deg, #DBEAFE 0%, #FFFFFF 100%);
  border-left-color: #F97316;
}

.category-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, #F97316 0%, #FB923C 100%);
  border-radius: 0 2px 2px 0;
}

.category-text {
  font-size: 14px;
  line-height: 1.4;
}
</style>
