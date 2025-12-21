<template>
  <div class="smart-image-container">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-placeholder" :style="style">
      加载中...
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-placeholder" :style="style" @click="retryLoad">
      图片加载失败，点击重试
    </div>
    
    <!-- 正常显示 -->
    <img 
      v-else
      v-show="!isLoading && !hasError"
      :src="imageUrl" 
      :alt="alt" 
      :class="className"
      :style="style"
      @click="handleClick"
      @error="handleError"
      @load="handleLoad"
    />
  </div>
</template>

<script>
import api from '@/api'
import axios from 'axios'

export default {
  name: 'SmartImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: ''
    },
    style: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return { 
      imageUrl: '',
      isLoading: false,
      hasError: false,
      currentRequest: null // 跟踪当前请求
    }
  },
  watch: {
    src: {
      immediate: true,
      handler: function(newVal) {
        // 取消之前的请求
        if (this.currentRequest) {
          this.currentRequest.cancel && this.currentRequest.cancel()
        }
        
        // 重置状态
        this.hasError = false
        
        // 释放之前的URL
        if (this.imageUrl && this.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.imageUrl)
          this.imageUrl = ''
        }
        
        // 加载新图片
        if (newVal) {
          this.loadImage()
        }
      }
    }
  },
  methods: {
    async loadImage() {
      if (!this.src) return
      
      // 避免重复请求
      if (this.isLoading) return
      
      this.isLoading = true
      this.hasError = false

      try {
        // 创建取消令牌
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        this.currentRequest = source
        
        const response = await api({
          method: 'get',
          url: this.src,
          baseURL: '', // 图片请求不使用baseURL
          responseType: 'blob',
          cancelToken: source.token,
          headers: { 'Accept': 'image/*' },
          timeout: 15000 // 15秒超时
        })

        // 验证返回的数据确实是图片
        if (!response.data || !response.data.type.startsWith('image/')) {
          throw new Error('返回的数据不是有效的图片')
        }

        // 释放之前的URL
        if (this.imageUrl && this.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.imageUrl)
        }
        
        // 创建新的URL
        const blobUrl = URL.createObjectURL(response.data)
        this.imageUrl = blobUrl
        
        // 清除当前请求引用
        this.currentRequest = null
        
      } catch (error) {
        // 如果是取消请求，不视为错误
        if (axios.isCancel(error)) {
          console.log('请求被取消:', error.message)
          return
        }
        
        console.error('图片加载失败:', {
          url: this.src,
          error: error?.message || error,
          status: error?.response?.status,
          statusText: error?.response?.statusText
        })
        
        this.hasError = true
        this.imageUrl = ''
        this.$emit('error', error)
      } finally {
        this.isLoading = false
      }
    },
    
    // 手动重试
    retryLoad() {
      this.loadImage()
    },
    
    handleClick() {
      this.$emit('click')
    },
    
    handleError(error) {
      console.error('图片显示错误:', {
        url: this.src,
        blobUrl: this.imageUrl,
        error: error?.message || error
      })
      
      // 标记错误但不立即重试（可能网络问题）
      this.hasError = true
      this.$emit('error', error)
    },
    
    handleLoad() {
      console.log('图片加载成功:', this.src)
      this.$emit('load')
    }
  },
  
  beforeDestroy() {
    // 取消未完成的请求
    if (this.currentRequest) {
      this.currentRequest.cancel && this.currentRequest.cancel('组件销毁')
    }
    
    // 释放Blob URL
    if (this.imageUrl && this.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imageUrl)
    }
  }
}
</script>

<style scoped>
.smart-image-container {
  position: relative;
  display: inline-block;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.loading-placeholder,
.error-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  min-width: 50px;
  background-color: #f5f5f5;
  border: 1px dashed #ddd;
  color: #999;
  font-size: 12px;
}

.error-placeholder {
  cursor: pointer;
  color: #ff4d4f;
}

.error-placeholder:hover {
  background-color: #fff2f0;
}
</style>