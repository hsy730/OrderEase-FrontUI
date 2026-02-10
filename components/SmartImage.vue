<template>
  <view class="smart-image-container" :style="containerStyle">
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-placeholder" :style="placeholderStyle">
      <view class="loading-spinner"></view>
    </view>
    
    <!-- 错误状态 -->
    <view v-else-if="hasError" class="error-placeholder" :style="placeholderStyle" @click="retryLoad">
      <text class="error-icon">📷</text>
      <text class="error-text">加载失败</text>
    </view>
    
    <!-- 正常显示 -->
    <image 
      v-else
      :src="imageUrl" 
      :mode="mode" 
      :lazy-load="lazyLoad"
      :show-menu-by-longpress="showMenuByLongpress"
      class="smart-image"
      :class="{ 'image-loaded': !isLoading && !hasError }"
      :style="imageStyle"
      @click="handleClick"
      @error="handleError"
      @load="handleLoad"
    />
  </view>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { API_BASE_URL } from '../utils/constants'

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
  showMenuByLongpress: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  }
})

const emit = defineEmits(['load', 'error', 'click'])

const imageUrl = ref('')
const isLoading = ref(false)
const hasError = ref(false)
const tempFilePath = ref('')
const requestTask = ref(null)

// 容器样式
const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
  position: 'relative'
}))

// 占位样式
const placeholderStyle = computed(() => ({
  width: props.width,
  height: props.height
}))

// 图片样式
const imageStyle = computed(() => ({
  width: props.width,
  height: props.height,
  opacity: isLoading.value || hasError.value ? 0 : 1
}))

// 加载图片
const loadImage = async () => {
  if (!props.src || isLoading.value) return
  
  isLoading.value = true
  hasError.value = false
  
  try {
    // 获取用户token
    const token = uni.getStorageSync('token')
    
    // 构建完整URL
    let fullUrl = props.src
    if (!fullUrl.startsWith('http')) {
      fullUrl = `${API_BASE_URL}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`
    }
    
    // 发送请求获取图片
    requestTask.value = uni.request({
      url: fullUrl,
      method: 'GET',
      responseType: 'arraybuffer',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'image/*'
      },
      timeout: 15000
    })
    
    const [error, response] = await requestTask.value
    requestTask.value = null
    
    if (error) {
      throw new Error(error.errMsg || '请求失败')
    }
    
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}`)
    }
    
    // 验证返回数据
    if (!response.data || response.data.byteLength === 0) {
      throw new Error('返回数据为空')
    }
    
    // 保存为临时文件
    const fs = uni.getFileSystemManager()
    const fileName = `smart_image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
    const filePath = `${uni.env.USER_DATA_PATH}/${fileName}`
    
    fs.writeFileSync(filePath, response.data, 'binary')
    
    tempFilePath.value = filePath
    imageUrl.value = filePath
    
  } catch (error) {
    console.error('图片加载失败:', {
      url: props.src,
      error: error.message || error
    })
    hasError.value = true
    emit('error', error)
  } finally {
    isLoading.value = false
  }
}

// 清理临时文件
const cleanupTempFile = () => {
  if (tempFilePath.value) {
    try {
      const fs = uni.getFileSystemManager()
      fs.unlinkSync(tempFilePath.value)
    } catch (e) {
      // 忽略删除错误
    }
    tempFilePath.value = ''
  }
}

// 监听 src 变化
watch(() => props.src, (newVal) => {
  // 取消之前的请求
  if (requestTask.value) {
    requestTask.value.abort()
    requestTask.value = null
  }

  // 清理之前的临时文件
  cleanupTempFile()

  // 重置状态
  isLoading.value = false
  hasError.value = false
  imageUrl.value = ''

  // 加载新图片
  if (newVal) {
    loadImage()
  }
}, { immediate: true })

// 重试加载
const retryLoad = () => {
  loadImage()
}

// 处理点击
const handleClick = () => {
  emit('click')
}

// 处理图片加载错误
const handleError = (e) => {
  console.error('图片显示错误:', {
    url: props.src,
    tempPath: tempFilePath.value
  })
  hasError.value = true
  emit('error', e)
}

// 处理图片加载成功
const handleLoad = (e) => {
  emit('load', e)
}

// 组件销毁时清理
uni.$on('onUnload', () => {
  if (requestTask.value) {
    requestTask.value.abort()
  }
  cleanupTempFile()
})
</script>

<style scoped>
.smart-image-container {
  overflow: hidden;
  background: #f5f5f5;
}

.smart-image {
  transition: opacity 0.3s;
}

.smart-image.image-loaded {
  opacity: 1;
}

.loading-placeholder,
.error-placeholder {
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
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #e5e7eb;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-placeholder {
  cursor: pointer;
}

.error-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.error-text {
  font-size: 22rpx;
  color: #999;
}
</style>
