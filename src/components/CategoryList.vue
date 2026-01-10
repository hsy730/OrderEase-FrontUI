<template>
  <van-sidebar v-model="activeIndex">
    <van-sidebar-item 
      v-for="category in categories" 
      :key="category.id"
      :title="category.name"
      @click="() => $emit('select', category)"
    />
  </van-sidebar>
</template>

<script setup>
import { ref, watch } from 'vue'

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

defineEmits(['select'])

const activeIndex = ref(0)

watch(() => props.activeCategory, (newVal) => {
  const index = props.categories.findIndex(c => c.id === newVal)
  if (index !== -1) {
    activeIndex.value = index
  }
})
</script>

<style scoped>
/* 深蓝橙系分类菜单样式 */
:deep(.van-sidebar-item) {
  background: transparent;
  color: var(--text-secondary);
  transition: all var(--transition-base);
}

:deep(.van-sidebar-item--selected) {
  background: var(--gradient-primary);
  color: var(--text-inverse);
  font-weight: 600;
  position: relative;
}

:deep(.van-sidebar-item--selected)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: var(--accent-orange);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

:deep(.van-sidebar-item:hover:not(.van-sidebar-item--selected)) {
  background: var(--bg-blue-tint);
  color: var(--primary-blue);
}
</style>