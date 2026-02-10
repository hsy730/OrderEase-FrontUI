<template>
  <view class="orders-page">
    <scroll-view class="orders-list" scroll-y @scrolltolower="loadMore">
      <view v-for="order in orders" :key="order.id" class="order-card" @click="viewOrderDetail(order)">
        <view class="order-header">
          <text class="order-no">订单号: {{ order.id }}</text>
          <text class="order-time">{{ order.createTime }}</text>
        </view>
        <view class="order-content">
          <view class="product-images">
            <SmartImage 
              v-for="(item, index) in order.items.slice(0, 4)" 
              :key="index"
              class="product-thumb" 
              :src="getImageUrl(item.product_image)" 
              mode="aspectFill"
              width="50px"
              height="50px"
            />
            <view v-if="order.items.length > 4" class="more-items">+{{ order.items.length - 4 }}</view>
          </view>
        </view>
        <view class="order-footer">
          <text class="order-count">共{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }}件商品</text>
          <view class="order-info-right">
            <text class="order-amount">¥{{ order.totalAmount }}</text>
            <view class="order-status" :class="'status-' + getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </view>
            <button class="detail-btn" size="mini" type="primary" plain @click.stop="viewOrderDetail(order)">详情</button>
          </view>
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
              {{ getStatusText(selectedOrder.status) }}
            </view>
          </view>
          <view class="detail-item">
            <text class="label">总计</text>
            <text class="value price">¥{{ selectedOrder.total_price }}</text>
          </view>
          
          <view class="detail-section-title">商品列表</view>
          <view v-for="(item, index) in selectedOrder.items" :key="index" class="product-item">
            <SmartImage class="product-image" :src="getImageUrl(item.product_image)" mode="aspectFill" width="60px" height="60px" />
            <view class="product-info">
              <text class="product-name">{{ item.product_name }}</text>
              <text class="product-price">¥{{ item.subtotal }}</text>
              <text class="product-quantity">数量: {{ item.quantity }}</text>
              <view v-if="item.options && item.options.length > 0" class="product-options">
                <text v-for="(option, optIndex) in item.options" :key="optIndex" class="option-tag">
                  {{ option.category_name }}: {{ option.option_name }}
                </text>
              </view>
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
import SmartImage from '@/components/SmartImage.vue'

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
        items: order.items || []
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
    0: 'primary',
    1: 'warning',
    2: 'success',
    3: 'danger'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    0: '待支付',
    1: '待取餐',
    2: '已完成',
    3: '已取消'
  }
  return textMap[status] || '未知'
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

    if (response.data && response.data.code === 200) {
      selectedOrder.value = response.data.data
      detailPopup.value.open()
    } else {
      uni.hideLoading()
      uni.showToast({
        title: '获取订单详情失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    uni.hideLoading()
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
  min-height: calc(100vh - 50px);
  background: var(--bg-secondary);
  padding-bottom: 50px;
}

.orders-list {
  height: calc(100vh - 50px);
  padding: 8px;
}

.order-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
  margin-bottom: 8px;
  overflow: hidden;
}

.order-header {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-no {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}

.order-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.order-content {
  padding: 10px 12px;
}

.product-images {
  display: flex;
  gap: 8px;
  align-items: center;
}

.product-thumb {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.more-items {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.order-footer {
  padding: 10px 12px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-count {
  font-size: 13px;
  color: var(--text-secondary);
}

.order-info-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-btn {
  margin: 0;
  padding: 4px 12px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 4px;
}

.order-amount {
  font-size: 16px;
  font-weight: bold;
  color: var(--price-primary);
}

.order-status {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.status-primary {
  background: #e6f7ff;
  color: #1890ff;
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

.loading-more, .no-more-data {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.order-detail {
  background: #ffffff;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.detail-content {
  padding: 12px 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
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
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0 12px;
  color: var(--text-primary);
}

.product-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  font-size: 12px;
  color: var(--text-secondary);
}

.product-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.option-tag {
  font-size: 11px;
  padding: 2px 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 4px;
}
</style>
