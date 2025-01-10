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