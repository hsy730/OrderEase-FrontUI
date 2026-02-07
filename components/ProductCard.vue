<template>
  <view class="product-card" @click="handleClick">
    <view class="product-image-wrapper">
      <SmartImage
        :src="product.image"
        mode="aspectFill"
        :lazy-load="true"
        class="product-image"
        @error="handleImageError"
      />
      <view v-if="product.tag" class="product-tag">
        {{ product.tag }}
      </view>
    </view>

    <view class="product-info">
      <view class="product-name">{{ product.name }}</view>
      <view v-if="product.description" class="product-desc">
        {{ product.description }}
      </view>

      <view v-if="hasOptions" class="product-options">
        <text class="options-badge">选规格</text>
      </view>

      <view class="product-footer">
        <view class="price-wrapper">
          <text class="price-currency">¥</text>
          <text class="price-value">{{ displayPrice }}</text>
        </view>

        <view class="add-to-cart" @click.stop="handleAddToCart">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import SmartImage from './SmartImage.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'add-to-cart'])

const hasOptions = computed(() => {
  return props.product.option_categories &&
         props.product.option_categories.length > 0
})

const displayPrice = computed(() => {
  const price = props.product.price || 0
  return price.toFixed(2)
})

const handleClick = () => {
  emit('click', props.product)
}

const handleAddToCart = () => {
  emit('add-to-cart', props.product)
}

const handleImageError = () => {
  console.error('图片加载失败:', props.product.image)
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:active {
  transform: scale(0.98);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 宽高比 */
  background: #f5f5f5;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.product-tag {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  padding: 8rpx 16rpx;
  background: var(--gradient-accent);
  color: #fff;
  font-size: 20rpx;
  border-radius: 24rpx;
  font-weight: bold;
}

.product-info {
  padding: 24rpx;
}

.product-name {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: bold;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-options {
  margin-bottom: 12rpx;
}

.options-badge {
  display: inline-block;
  padding: 8rpx 16rpx;
  background: rgba(30, 64, 175, 0.1);
  color: var(--primary-blue);
  font-size: 22rpx;
  border-radius: 8rpx;
  border: 1rpx solid rgba(30, 64, 175, 0.2);
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
}

.price-currency {
  font-size: 24rpx;
  color: #f56c6c;
  font-weight: bold;
}

.price-value {
  font-size: 36rpx;
  color: #f56c6c;
  font-weight: bold;
  margin-left: 4rpx;
}

.add-to-cart {
  width: 56rpx;
  height: 56rpx;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.add-icon {
  font-size: 48rpx;
  color: #fff;
  line-height: 1;
  font-weight: 300;
}
</style>
