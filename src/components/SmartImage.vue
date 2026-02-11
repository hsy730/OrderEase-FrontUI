<template>
  <view class="smart-image-container">
    <view v-if="isLoading" class="loading-placeholder" :style="style">
      加载中...
    </view>
    
    <view v-else-if="hasError" class="error-placeholder" :style="style" @click="retryLoad">
      图片加载失败，点击重试
    </view>
    
    <image 
      v-else
      v-show="!isLoading && !hasError"
      :src="imageUrl" 
      :mode="mode"
      :class="className"
      :style="style"
      @click="handleClick"
      @error="handleError"
      @load="handleLoad"
    />
  </view>
</template>

<script>
import api from '@/api'

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
    mode: {
      type: String,
      default: 'aspectFill'
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
      currentRequest: null
    }
  },
  watch: {
    src: {
      immediate: true,
      handler: function(newVal) {
        if (this.currentRequest) {
          this.currentRequest.abort && this.currentRequest.abort()
        }
        
        this.hasError = false
        
        if (this.imageUrl && this.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.imageUrl)
          this.imageUrl = ''
        }
        
        if (newVal) {
          this.loadImage()
        }
      }
    }
  },
  methods: {
    async loadImage() {
      if (!this.src) return
      
      if (this.isLoading) return
      
      this.isLoading = true
      this.hasError = false

      try {
        const requestTask = uni.request({
          url: this.src,
          method: 'GET',
          responseType: 'arraybuffer',
          timeout: 15000,
          success: (res) => {
            if (res.statusCode === 200) {
              const blob = new Blob([res.data], { type: 'image/jpeg' })
              
              if (this.imageUrl && this.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(this.imageUrl)
              }
              
              const blobUrl = URL.createObjectURL(blob)
              this.imageUrl = blobUrl
            } else {
              throw new Error('图片加载失败')
            }
          },
          fail: (err) => {
            console.error('图片加载失败:', err)
            this.hasError = true
            this.imageUrl = ''
            this.$emit('error', err)
          }
        })
        
        this.currentRequest = requestTask
        
      } catch (error) {
        console.error('图片加载失败:', error)
        this.hasError = true
        this.imageUrl = ''
        this.$emit('error', error)
      } finally {
        this.isLoading = false
      }
    },
    
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
      
      this.hasError = true
      this.$emit('error', error)
    },
    
    handleLoad() {
      console.log('图片加载成功:', this.src)
      this.$emit('load')
    }
  },
  
  beforeUnmount() {
    if (this.currentRequest) {
      this.currentRequest.abort && this.currentRequest.abort()
    }
    
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

image {
  width: 100%;
  height: 100%;
  display: block;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.loading-placeholder,
.error-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100rpx;
  min-width: 100rpx;
  background-color: #f5f5f5;
  border: 1rpx dashed #ddd;
  color: #999;
  font-size: 24rpx;
}

.error-placeholder {
  cursor: pointer;
  color: #ff4d4f;
}

.error-placeholder:active {
  background-color: #fff2f0;
}
</style>
