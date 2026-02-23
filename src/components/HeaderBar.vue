<template>
  <view class="header-bar">
    <text class="shop-name">{{ shopName }}</text>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getShopDetail } from '@/utils/api'

const shopName = ref('点单系统')

onMounted(async () => {
  try {
    const response = await getShopDetail()
    if (response.data && response.status === 200) {
      const shopData = response.data.data || response.data
      if (shopData.name) {
        shopName.value = shopData.name
      }
    }
  } catch (error) {
    console.error('获取店铺详情失败:', error)
  }
})
</script>

<style scoped>
.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 4rpx 16rpx rgba(30, 64, 175, 0.2);
}

.shop-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
  letter-spacing: 2rpx;
}
</style>
