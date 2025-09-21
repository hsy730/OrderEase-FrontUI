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