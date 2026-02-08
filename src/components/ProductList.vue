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
  background: #FFFFFF;
  padding: 8px;
  border-radius: 8px;
  align-items: center;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.08);
  transition: all 0.25s ease;
}

.product-image-container {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
}

.image-placeholder {
  width: 60px;
  height: 60px;
  background: linear-gradient(180deg, #DBEAFE 0%, #ffffff 100%);
  border: 2px dashed #FB923C;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F97316;
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
  color: #0F172A;
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
  color: #EA580C;
  font-weight: bold;
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: #C2410C;
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
  background: #F97316;
  color: #FFFFFF;
  border: 2px solid #FFFFFF;
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
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.08);
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
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.08);
}

.stepper-plus {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
}

.stepper-minus {
  background: #FFFFFF;
  color: #1E40AF;
  border: 1px solid #1E40AF;
}

.stepper-value {
  width: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #0F172A;
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
