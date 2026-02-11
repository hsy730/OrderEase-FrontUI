<template>
  <view class="orders-page">
    <scroll-view class="orders-list" scroll-y @scrolltolower="loadMore">
      <view v-for="order in orders" :key="order.id" class="order-card">
        <view class="order-header">
          <text class="order-no">订单号: {{ order.id }}</text>
          <text class="order-time">{{ order.createTime }}</text>
        </view>
        
        <scroll-view class="order-images" scroll-x show-scrollbar="false">
          <view class="images-container">
            <image 
              v-for="(item, index) in order.items" 
              :key="index"
              class="order-image" 
              :src="getImageUrl(item.image || item.product_image_url)" 
              mode="aspectFill" 
            />
          </view>
        </scroll-view>
        
        <view class="order-footer">
          <text class="order-count">共{{ order.items.length }}件商品</text>
          <view class="order-price-status">
            <text class="order-amount">¥{{ order.totalAmount }}</text>
            <view class="order-status" :class="'status-' + getStatusType(order.status)">
              {{ order.status }}
            </view>
          </view>
          <text class="detail-link" @click="viewOrderDetail(order)">详情</text>
        </view>
      </view>
      
      <view v-if="loadingMore" class="loading-more">
        <text>加载中...</text>
      </view>
      
      <view v-if="noMoreData" class="no-more-data">
        没有更多订单了
      </view>
    </scroll-view>
    
    <uni-popup ref="detailPopup" type="bottom" :safe-area="false">
      <view class="order-detail">
        <view class="detail-header">订单详情</view>
        <view v-if="selectedOrder" class="detail-content">
          <view class="detail-item">
            <text class="label">订单号</text>
            <text class="value">{{ selectedOrder.id }}</text>
          </view>
          <view class="detail-item">
            <text class="label">下单时间</text>
            <text class="value">{{ formatDate(selectedOrder.created_at) }}</text>
          </view>
          <view class="detail-item">
            <text class="label">订单状态</text>
            <view class="order-status" :class="'status-' + getStatusType(selectedOrder.status)">
              {{ selectedOrder.status }}
            </view>
          </view>
          <view class="detail-item">
            <text class="label">总计</text>
            <text class="value price">¥{{ selectedOrder.total_price }}</text>
          </view>
          
          <view class="detail-section-title">商品列表</view>
          <view v-for="(item, index) in selectedOrder.items" :key="index" class="product-item">
            <image class="product-image" :src="getImageUrl(item.image || item.product_image_url)" mode="aspectFill" />
            <view class="product-info">
              <text class="product-name">{{ item.name || item.product_name }}</text>
              <text class="product-price">¥{{ item.total_price }}</text>
              <text class="product-quantity">数量: {{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrders, getOrderDetail } from '@/api'
import { getImageUrl } from '@/utils/image'

const orders = ref([])
const detailPopup = ref(null)
const selectedOrder = ref(null)

const currentPage = ref(1)
const pageSize = ref(10)
const loadingMore = ref(false)
const noMoreData = ref(false)
const isLoading = ref(false)

const loadOrders = async (page = 1) => {
  if (isLoading.value) return
  isLoading.value = true
  
  try {
    const response = await getOrders({
      user_id: uni.getStorageSync('user_id'),
      page: page,
      pageSize: pageSize.value
    })
    
    if (response.data && response.data.code === 200) {
      const newOrders = response.data.data.map(order => ({
        id: order.id,
        orderNo: order.id,
        createTime: formatDate(order.created_at),
        status: order.status,
        totalAmount: order.total_price,
        items: order.items || [{
          name: order.product_name,
          price: order.total_price,
          quantity: 1,
          image: order.image_url || ''
        }]
      }))
      
      if (page === 1) {
        orders.value = newOrders
      } else {
        orders.value = [...orders.value, ...newOrders]
      }
      
      if (newOrders.length < pageSize.value) {
        noMoreData.value = true
      }
      
      currentPage.value = page
    }
  } catch (error) {
    console.error('获取订单失败:', error)
    if (page === 1) {
      orders.value = []
    }
    uni.showToast({
      title: '获取订单失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
    loadingMore.value = false
  }
}

onMounted(async () => {
  await loadOrders(1)
})

const loadMore = () => {
  if (loadingMore.value || noMoreData.value) return
  
  loadingMore.value = true
  const nextPage = currentPage.value + 1
  loadOrders(nextPage)
}

const getStatusType = (status) => {
  const typeMap = {
    '待取餐': 'warning',
    '已完成': 'success',
    '已取消': 'danger'
  }
  return typeMap[status] || 'default'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const viewOrderDetail = async (order) => {
  uni.showLoading({ title: '加载中...' })
  
  try {
    const response = await getOrderDetail(order.id)
    
    if (response.data && response.status === 200) {
      selectedOrder.value = response.data
      detailPopup.value.open()
    } else {
      uni.showToast({
        title: '获取订单详情失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    uni.showToast({
      title: '获取订单详情失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style scoped>
.orders-page {
  min-height: calc(100vh - 100rpx);
  background: var(--bg-secondary);
  padding-bottom: 100rpx;
}

.orders-list {
  height: calc(100vh - 100rpx);
  padding: 24rpx;
}

.order-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1rpx solid var(--border-light);
  box-shadow: var(--shadow-card);
  margin-bottom: 24rpx;
  overflow: hidden;
}

.order-header {
  padding: 24rpx;
  border-bottom: 1rpx solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-no {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 28rpx;
}

.order-time {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.order-images {
  padding: 24rpx;
  white-space: nowrap;
}

.images-container {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
}

.order-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  background-color: #f5f5f5;
}

.order-footer {
  padding: 24rpx;
  border-top: 1rpx solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-count {
  font-size: 26rpx;
  color: var(--text-secondary);
  flex: 1;
}

.order-price-status {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-right: 24rpx;
}

.order-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-primary);
}

.order-status {
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.status-warning {
  background: #fff7e6;
  color: #fa8c16;
}

.status-success {
  background: #f6ffed;
  color: #52c41a;
}

.status-danger {
  background: #fff1f0;
  color: #f5222d;
}

.status-default {
  background: #f5f5f5;
  color: #999;
}

.detail-link {
  font-size: 28rpx;
  color: #3B82F6;
  cursor: pointer;
}

.loading-more, .no-more-data {
  text-align: center;
  padding: 40rpx;
  color: var(--text-tertiary);
  font-size: 28rpx;
}

.order-detail {
  background: var(--bg-primary);
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid var(--border-light);
}

.detail-content {
  padding: 24rpx 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--border-light);
}

.detail-item .label {
  color: var(--text-secondary);
}

.detail-item .value {
  color: var(--text-primary);
  font-weight: 500;
}

.detail-item .value.price {
  color: var(--price-primary);
  font-weight: bold;
}

.detail-section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin: 40rpx 0 24rpx;
  color: var(--text-primary);
}

.product-item {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 16rpx;
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--radius-sm);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.product-name {
  font-weight: 500;
  color: var(--text-primary);
}

.product-price {
  color: var(--price-primary);
  font-weight: bold;
}

.product-quantity {
  font-size: 24rpx;
  color: var(--text-secondary);
}
</style>
