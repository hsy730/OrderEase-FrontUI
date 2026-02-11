<template>
  <view class="orders-page">
    <scroll-view class="orders-list" scroll-y @scrolltolower="loadMore">
      <view v-if="orders.length === 0 && !isLoading" class="empty-state">
        <text class="empty-text">暂无订单</text>
      </view>

      <view v-for="order in orders" :key="order.id" class="order-card">
        <view class="order-header">
          <text class="order-no">订单号: {{ order.id }}</text>
          <view :class="['order-status', getStatusClass(order.status)]">
            <text>{{ order.status }}</text>
          </view>
        </view>

        <view class="order-items">
          <view
            v-for="(item, index) in order.items"
            :key="index"
            class="order-item"
          >
            <image
              :src="getImageUrl(item.image || order.items[0]?.image)"
              class="item-image"
              mode="aspectFill"
            />
            <view class="item-info">
              <text class="item-name">{{ item.name || item.product_name }}</text>
              <text class="item-quantity">数量: {{ item.quantity }}</text>
            </view>
            <text class="item-price">¥{{ item.price || item.total_price }}</text>
          </view>
        </view>

        <view class="order-footer">
          <text class="order-total">总计: ¥{{ order.total_price }}</text>
          <view class="order-actions">
            <view class="detail-btn" @click="viewOrderDetail(order)">
              <text>详情</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loadingMore" class="loading-state">
        <text>加载中...</text>
      </view>

      <!-- 没有更多数据 -->
      <view v-if="noMoreData && orders.length > 0" class="loading-state">
        <text>没有更多订单了</text>
      </view>
    </scroll-view>

    <!-- 订单详情弹窗 -->
    <view v-if="showDetailPopup" class="popup-mask" @click="closeDetailPopup">
      <scroll-view class="detail-popup" scroll-y @click.stop>
        <view class="detail-header">
          <text class="detail-title">订单详情</text>
          <view class="close-btn" @click="closeDetailPopup">×</view>
        </view>

        <view v-if="selectedOrder" class="detail-content">
          <view class="detail-section">
            <view class="detail-row">
              <text class="row-label">订单号</text>
              <text class="row-value">{{ selectedOrder.id }}</text>
            </view>
            <view class="detail-row">
              <text class="row-label">下单时间</text>
              <text class="row-value">{{ formatDate(selectedOrder.created_at) }}</text>
            </view>
            <view class="detail-row">
              <text class="row-label">订单状态</text>
              <view :class="['status-badge', getStatusClass(selectedOrder.status)]">
                <text>{{ selectedOrder.status }}</text>
              </view>
            </view>
            <view class="detail-row">
              <text class="row-label">总计</text>
              <text class="row-value total-price">¥{{ selectedOrder.total_price }}</text>
            </view>
          </view>

          <view class="detail-section">
            <text class="section-title">商品列表</text>
            <view
              v-for="(item, index) in selectedOrder.items"
              :key="index"
              class="detail-item"
            >
              <image
                :src="getImageUrl(item.image || item.product_image_url)"
                class="detail-item-image"
                mode="aspectFill"
              />
              <view class="detail-item-info">
                <text class="detail-item-name">{{ item.name || item.product_name }}</text>
                <text class="detail-item-quantity">数量: {{ item.quantity }}</text>
                <view v-if="item.options && item.options.length > 0" class="item-options">
                  <view
                    v-for="(options, categoryId) in groupOptionsByCategory(item.options)"
                    :key="categoryId"
                    class="option-group"
                  >
                    <text>{{ options[0].category_name }}: </text>
                    <text>{{ options.map(opt => opt.option_name).join(', ') }}</text>
                  </view>
                </view>
              </view>
              <text class="detail-item-price">¥{{ item.total_price }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onPullDownRefresh } from '@dcloudio/uni-app'
import { getOrders, getOrderDetail } from '@/utils/api'
import { getImageUrl } from '@/utils/image'

const orders = ref([])
const showDetailPopup = ref(false)
const selectedOrder = ref(null)

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const loadingMore = ref(false)
const noMoreData = ref(false)
const isLoading = ref(false)

// 获取订单列表
const loadOrders = async (page = 1, isRefresh = false) => {
  if (isLoading.value && !isRefresh) return
  isLoading.value = true

  try {
    const userId = uni.getStorageSync('user_id')
    if (!userId) {
      uni.redirectTo({ url: '/pages/login/login' })
      return
    }

    const response = await getOrders({
      user_id: userId,
      page: page,
      pageSize: pageSize.value
    })

    if (response.data && response.status === 200) {
      const newOrders = response.data.map(order => ({
        id: order.id,
        orderNo: order.id,
        createTime: formatDate(order.created_at),
        status: order.status,
        total_price: order.total_price,
        items: order.items || [{
          name: order.product_name,
          price: order.total_price,
          quantity: 1,
          image: order.image_url || ''
        }]
      }))

      if (page === 1 || isRefresh) {
        orders.value = newOrders
      } else {
        orders.value = [...orders.value, ...newOrders]
      }

      if (newOrders.length < pageSize.value || response.data.data?.length < pageSize.value) {
        noMoreData.value = true
      } else {
        noMoreData.value = false
      }

      currentPage.value = page
    }
  } catch (error) {
    console.error('获取订单失败:', error)
    if (page === 1) {
      orders.value = []
    }
    uni.showToast({ title: '获取订单失败', icon: 'none' })
  } finally {
    isLoading.value = false
    loadingMore.value = false
    if (isRefresh) {
      uni.stopPullDownRefresh()
    }
  }
}

// 下拉刷新
onPullDownRefresh(() => {
  loadOrders(1, true)
})

// 上拉加载更多
const loadMore = () => {
  if (loadingMore.value || noMoreData.value) return
  loadingMore.value = true
  loadOrders(currentPage.value + 1)
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    '待取餐': 'status-warning',
    '已完成': 'status-success',
    '已取消': 'status-danger'
  }
  return classMap[status] || 'status-default'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 查看订单详情
const viewOrderDetail = async (order) => {
  uni.showLoading({ title: '加载中...' })

  try {
    const response = await getOrderDetail(order.id)

    if (response.data && response.status === 200) {
      selectedOrder.value = response.data
      showDetailPopup.value = true
    } else {
      uni.showToast({ title: '获取订单详情失败', icon: 'none' })
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    uni.showToast({ title: '获取订单详情失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 关闭详情弹窗
const closeDetailPopup = () => {
  showDetailPopup.value = false
  selectedOrder.value = null
}

// 按分类ID对选项进行分组
const groupOptionsByCategory = (options) => {
  const grouped = {}
  options.forEach(option => {
    if (!grouped[option.category_id]) {
      grouped[option.category_id] = []
    }
    grouped[option.category_id].push(option)
  })
  return grouped
}

onMounted(async () => {
  await loadOrders(1)
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #F8FAFC;
  padding-bottom: 20rpx;
}

.orders-list {
  height: 100vh;
  padding: 20rpx;
}

.empty-state {
  padding: 200rpx 40rpx;
  text-align: center;
}

.empty-text {
  color: #94A3B8;
  font-size: 28rpx;
}

/* 订单卡片 */
.order-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
  border: 1rpx solid #E2E8F0;
  box-shadow: 0 2rpx 16rpx rgba(45, 52, 54, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #E2E8F0;
}

.order-no {
  font-size: 26rpx;
  color: #475569;
}

.order-status {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.status-warning {
  background: #FEF3C7;
  color: #D97706;
}

.status-success {
  background: #D1FAE5;
  color: #059669;
}

.status-danger {
  background: #FEE2E2;
  color: #DC2626;
}

.status-default {
  background: #F1F5F9;
  color: #64748B;
}

.order-items {
  padding: 20rpx 0;
}

.order-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #0F172A;
  margin-bottom: 8rpx;
}

.item-quantity {
  font-size: 24rpx;
  color: #94A3B8;
}

.item-price {
  font-size: 28rpx;
  font-weight: bold;
  color: #EA580C;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #E2E8F0;
}

.order-total {
  font-size: 28rpx;
  color: #475569;
}

.order-total::before {
  content: '¥';
}

.order-actions {
  display: flex;
  gap: 16rpx;
}

.detail-btn {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
  border-radius: 32rpx;
  font-size: 26rpx;
}

/* 加载状态 */
.loading-state {
  padding: 40rpx;
  text-align: center;
  color: #94A3B8;
  font-size: 26rpx;
}

/* 订单详情弹窗 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
}

.detail-popup {
  width: 100%;
  max-height: 80vh;
  background: #FFFFFF;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

.detail-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #E2E8F0;
  position: relative;
}

.detail-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #0F172A;
}

.close-btn {
  position: absolute;
  right: 32rpx;
  font-size: 48rpx;
  color: #94A3B8;
  line-height: 1;
  padding: 8rpx;
}

.detail-content {
  padding: 32rpx;
}

.detail-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 24rpx;
  display: block;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #E2E8F0;
}

.row-label {
  font-size: 28rpx;
  color: #475569;
}

.row-value {
  font-size: 28rpx;
  color: #0F172A;
  font-weight: 500;
}

.total-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #EA580C;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  background: #F8FAFC;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.detail-item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.detail-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.detail-item-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #0F172A;
  margin-bottom: 8rpx;
}

.detail-item-quantity {
  font-size: 24rpx;
  color: #94A3B8;
  margin-bottom: 8rpx;
}

.item-options {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.option-group {
  font-size: 24rpx;
  color: #64748B;
}

.detail-item-price {
  font-size: 28rpx;
  font-weight: bold;
  color: #EA580C;
  white-space: nowrap;
}
</style>