<template>
  <van-nav-bar
    :title="title"
    :left-arrow="showBack"
    @click-left="handleBack"
    fixed
    placeholder
  />
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const handleBack = () => {
  if (props.showBack) {
    router.back()
  }
}
</script>

<style scoped>
/* 深蓝橙系导航栏样式 */
:deep(.van-nav-bar) {
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border-light);
}

:deep(.van-nav-bar__title) {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 18px;
}

:deep(.van-nav-bar__arrow) {
  color: var(--primary-blue);
  font-size: 20px;
}

:deep(.van-nav-bar__text) {
  color: var(--primary-blue);
}
</style>