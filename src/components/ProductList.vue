<template>
  <scroll-view class="product-list" scroll-y>
    <view v-for="product in products" :key="product.id" class="product-item">
      <view v-if="product.image" class="product-image-container">
        <image
          :src="getImageUrl(product.image)"
          class="product-image"
          mode="aspectFill"
        />
      </view>
      <view v-else class="image-placeholder">
        <uni-icons type="camera" size="24" color="#F97316"></uni-icons>
      </view>
     
      <view class="product-info">
        <text class="product-name">{{ product.name }}</text>
        <view class="product-details">
          <view class="product-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ product.price }}</text>
          </view>
          <view class="stepper-container">
            <view
              v-if="product.option_categories?.length"
              class="spec-button-wrapper"
            >
              <view v-if="product.count > 0" class="count-badge">{{ product.count }}</view>
              <view class="spec-button" @click="handleShowOptions(product)">
                选规格
              </view>
            </view>
            <view v-else class="stepper-wrapper">
              <view
                v-if="product.count > 0"
                class="stepper-btn stepper-minus"
                @click="handleCountChange(product, product.count - 1)"
              >
                -
              </view>
              <view v-if="product.count > 0" class="stepper-value">{{ product.count }}</view>
              <view
                class="stepper-btn stepper-plus"
                @click="handleCountChange(product, product.count + 1)"
              >
                +
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { getImageUrl } from '@/utils/image'

defineProps({
  products: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['add-to-cart', 'show-cart-popup', 'show-product-options'])

const handleShowOptions = (product) => {
  product.action = 'add'
  emit('show-product-options', product)
}

const handleCountChange = (product, newVal) => {
  if (product.count === newVal) {
    return
  }
  
  const action = newVal > product.count ? 'add' : 'remove'
  product.lastCount = newVal
  product.count = newVal
  
  if (newVal === 0) {
    product.lastCount = 0
  }
  
  emit('add-to-cart', { 
    ...product,
    count: newVal,
    action
  })
}
</script>

<style scoped>
.product-list {
  height: 100%;
  padding: 0;
}

.product-item {
  display: flex;
  margin-bottom: 16px;
  background: var(--bg-primary);
  padding: 8px;
  border-radius: var(--radius-md);
  align-items: center;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.product-image-container {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
}

.image-placeholder {
  width: 60px;
  height: 60px;
  background: var(--gradient-subtle);
  border: 2px dashed var(--accent-orange-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-orange);
  flex-shrink: 0;
}

.product-info {
  margin-left: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 60px;
}

.product-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-price {
  color: var(--price-primary);
  font-weight: bold;
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: var(--price-secondary);
  font-size: 12px;
}

.price-value {
  font-size: 16px;
}

.stepper-container {
  display: flex;
  justify-content: flex-end;
}

.spec-button-wrapper {
  position: relative;
}

.count-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--accent-orange);
  color: var(--text-inverse);
  border: 2px solid var(--bg-primary);
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spec-button {
  min-width: 64px;
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  background: var(--gradient-primary);
  color: var(--text-inverse);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.stepper-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stepper-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  box-shadow: var(--shadow-sm);
}

.stepper-plus {
  background: var(--gradient-primary);
  color: var(--text-inverse);
}

.stepper-minus {
  background: var(--bg-primary);
  color: var(--primary-blue);
  border: 1px solid var(--primary-blue);
}

.stepper-value {
  width: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

@media (max-width: 420px) {
  .product-item {
    margin-bottom: 12px;
  }

  .product-name {
    font-size: 13px;
  }
}
</style>
