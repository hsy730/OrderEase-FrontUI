<template>
  <view class="smart-image-container">
    <image
      :src="currentSrc"
      :mode="mode"
      :lazy-load="lazyLoad"
      :show-menu-by-longpress="showMenuByLongpress"
      @load="handleLoad"
      @error="handleError"
      class="smart-image"
      :class="{ 'image-loaded': isLoaded, 'image-error': isError }"
    />
    <!-- 加载占位 -->
    <view v-if="!isLoaded && !isError" class="image-placeholder">
      <view class="loading-spinner"></view>
    </view>
    <!-- 错误占位 -->
    <view v-if="isError" class="image-error-placeholder">
      <text class="error-icon">📷</text>
      <text class="error-text">加载失败</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'aspectFill'
  },
  lazyLoad: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  errorImage: {
    type: String,
    default: ''
  },
  showMenuByLongpress: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['load', 'error'])

const isLoaded = ref(false)
const isError = ref(false)

const currentSrc = computed(() => {
  if (isError.value && props.errorImage) {
    return props.errorImage
  }
  return props.src
})

const handleLoad = (e) => {
  isLoaded.value = true
  isError.value = false
  emit('load', e)
}

const handleError = (e) => {
  isLoaded.value = true
  isError.value = true
  emit('error', e)
}
</script>

<style scoped>
.smart-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.smart-image {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s;
  opacity: 0;
}

.smart-image.image-loaded {
  opacity: 1;
}

.image-placeholder,
.image-error-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #e5e7eb;
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.error-text {
  font-size: 24rpx;
  color: #999;
}
</style>
