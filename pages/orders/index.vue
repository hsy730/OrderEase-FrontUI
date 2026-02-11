<template>
  <view class="orders-container">
    <!-- 订单状态标签 -->
    <view class="status-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        :class="['tab-item', { active: activeTab === tab.value }]"
        @click="handleTabChange(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-count">{{ tab.count }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view
      class="order-scroll"
      scroll-y
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="orderStore.orders.length === 0 && !orderStore.loading" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单</text>
      </view>

      <view v-else class="order-list">
        <view
          v-for="order in orderStore.orders"
          :key="order.id"
          class="order-card"
          @click="handleOrderClick(order)"
        >
          <!-- 订单头部 -->
          <view class="order-header">
            <view class="order-info">
              <text class="order-no">订单号：{{ order.order_no }}</text>
              <text class="order-time">{{ formatTime(order.created_at) }}</text>
            </view>
            <view :class="['order-status', `status-${order.status}`]">
              {{ orderStore.getOrderStatusText(order.status) }}
            </view>
          </view>

          <!-- 商品列表 -->
          <view class="order-items">
            <view
              v-for="item in order.items"
              :key="item.id"
              class="order-item"
            >
              <image
                :src="item.product_image"
                mode="aspectFill"
                class="item-image"
              />
              <view class="item-info">
                <text class="item-name">{{ item.product_name }}</text>
                <view class="item-options" v-if="item.options && item.options.length > 0">
                  <text
                    v-for="(opt, idx) in item.options"
                    :key="idx"
                    class="option-tag"
                  >
                    {{ opt.category }}: {{ opt.name }}
                  </text>
                </view>
                <view class="item-footer">
                  <text class="item-price">¥{{ item.price.toFixed(2) }}</text>
                  <text class="item-quantity">x{{ item.quantity }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 订单底部 -->
          <view class="order-footer">
            <view class="order-total">
              <text class="total-label">实付：</text>
              <text class="total-price">¥{{ order.total_price.toFixed(2) }}</text>
            </view>
            <view class="order-actions">
              <button
                v-if="order.status === 'pending'"
                class="action-btn btn-cancel"
                @click.stop="handleCancel(order)"
              >
                取消订单
              </button>
              <button
                v-if="order.status === 'pending'"
                class="action-btn btn-pay"
                @click.stop="handlePay(order)"
              >
                去支付
              </button>
              <div
                v-if="order.status === 'paid'"
                class="spec-button"
                @click.stop="handleOrderDetail(order)"
              >
                查看详情
              </div>
              <div
                v-if="order.status === 'completed'"
                class="spec-button"
                @click.stop="handleOrderDetail(order)"
              >
                再次购买
              </div>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="orderStore.loading" class="loading-state">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多数据 -->
      <view v-if="orderStore.noMoreData && orderStore.orders.length > 0" class="no-more">
        <text>没有更多订单了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOrders } from '@/api'
import { useOrderStore } from '@/stores'

const orderStore = useOrderStore()

// 订单数据（使用 orderStore）
const statusTabs = ref([
  { label: '全部', value: 'all', count: 0 },
  { label: '待支付', value: 'pending', count: 0 },
  { label: '已支付', value: 'paid', count: 0 },
  { label: '已完成', value: 'completed', count: 0 },
  { label: '已取消', value: 'cancelled', count: 0 }
])

const activeTab = ref('all')

// 加载订单列表
const loadOrders = async (page = 1) => {
  if (orderStore.loading) return

  try {
    orderStore.setLoading(true)

    const userId = uni.getStorageSync('user_id')
    if (!userId) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    const params = {
      user_id: userId,
      page,
      pageSize: orderStore.pageSize,
      status: activeTab.value === 'all' ? '' : activeTab.value
    }

    const res = await getOrders(params)

    const newOrders = res.data.data || []
    if (page === 1) {
      orderStore.setOrders(newOrders)
    } else {
      orderStore.appendOrders(newOrders)
    }

    orderStore.setNoMoreData(newOrders.length < orderStore.pageSize)

    // 更新标签数量
    updateTabCounts()
  } catch (error) {
    console.error('加载订单失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    orderStore.setLoading(false)
  }
}

// 更新标签数量
const updateTabCounts = () => {
  // 这里应该从后端获取各状态的订单数量
  // 临时处理：使用本地数据统计
  statusTabs.value.forEach(tab => {
    if (tab.value === 'all') {
      tab.count = orders.value.length
    } else {
      tab.count = orders.value.filter(order => order.status === tab.value).length
    }
  })
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  orderStore.setCurrentPage(1)
  await loadOrders(1)
  refreshing.value = false
}

// 加载更多
const loadMore = () => {
  if (orderStore.noMoreData || orderStore.loading) return
  orderStore.setCurrentPage(orderStore.currentPage + 1)
  loadOrders(orderStore.currentPage + 1)
}

// 标签切换
const handleTabChange = (tab) => {
  activeTab.value = tab
  orderStore.setCurrentPage(1)
  orderStore.setOrders([])
  orderStore.setNoMoreData(false)
  loadOrders(1)
}

// 订单点击
const handleOrderClick = (order) => {
  uni.navigateTo({
    url: `/pages/order-detail/index?id=${order.id}`
  })
}

// 查看订单详情
const handleOrderDetail = (order) => {
  uni.navigateTo({
    url: `/pages/order-detail/index?id=${order.id}`
  })
}

// 取消订单
const handleCancel = (order) => {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消这个订单吗？',
    success: (res) => {
      if (res.confirm) {
        // 调用取消订单接口
        console.log('取消订单:', order.id)
        uni.showToast({
          title: '订单已取消',
          icon: 'success'
        })
        // 刷新订单列表
        loadOrders(1)
      }
    }
  })
}

// 去支付
const handlePay = (order) => {
  // 调用支付接口
  console.log('去支付:', order.id)
  uni.showToast({
    title: '调起支付',
    icon: 'none'
  })
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

// 页面加载
onMounted(() => {
  loadOrders(1)
})
</script>

<style scoped>
.orders-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-secondary);
}

.status-tabs {
  display: flex;
  background: #fff;
  padding: 0 24rpx;
  border-bottom: 1rpx solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
  position: relative;
}

.tab-text {
  font-size: 28rpx;
  color: var(--text-secondary);
  transition: color 0.3s;
}

.tab-count {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 6rpx;
  background: #f56c6c;
  color: #fff;
  font-size: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-item.active .tab-text {
  color: var(--primary-blue);
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 4rpx;
  background: var(--gradient-primary);
  border-radius: 2rpx;
}

.order-scroll {
  flex: 1;
  height: 0;
  overflow-y: auto;
  padding: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.order-card {
  background: #fff;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid var(--border-light);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.order-no {
  font-size: 26rpx;
  color: var(--text-primary);
}

.order-time {
  font-size: 22rpx;
  color: var(--text-secondary);
}

.order-status {
  font-size: 28rpx;
  font-weight: bold;
}

.order-status.status-pending {
  color: #ff9800;
}

.order-status.status-paid {
  color: var(--primary-blue-light);
}

.order-status.status-completed {
  color: var(--primary-blue-light);
}

.order-status.status-cancelled {
  color: #9e9e9e;
}

.order-items {
  padding: 24rpx;
  border-bottom: 1rpx solid var(--border-light);
}

.order-item {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.order-item:last-child {
  margin-bottom: 0;
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 8rpx 0;
}

.option-tag {
  padding: 4rpx 12rpx;
  background: rgba(30, 64, 175, 0.08);
  color: var(--primary-blue);
  font-size: 22rpx;
  border-radius: 6rpx;
  border: 1rpx solid rgba(30, 64, 175, 0.15);
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.item-price {
  font-size: 32rpx;
  color: #f56c6c;
  font-weight: bold;
}

.item-quantity {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
}

.order-total {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.total-price {
  font-size: 36rpx;
  color: #f56c6c;
  font-weight: bold;
  margin-left: 8rpx;
}

.order-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  border: 1rpx solid var(--border-default);
  background: #fff;
  color: var(--text-primary);
}

.action-btn::after {
  border: none;
}

.action-btn.btn-cancel {
  border-color: var(--border-default);
  color: var(--text-secondary);
}

.action-btn.btn-pay {
  background: var(--gradient-primary);
  color: #fff;
  border-color: transparent;
}

.action-btn.btn-default {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.spec-button {
  min-width: 128rpx;
  height: 56rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  font-weight: 600;
  background: var(--gradient-primary);
  color: #FFFFFF;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(30, 64, 175, 0.08);
  cursor: pointer;
  transition: all 0.25s ease;
}

.spec-button:hover {
  transform: translateY(-1rpx);
  box-shadow: 0 8rpx 24rpx rgba(30, 64, 175, 0.12);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid var(--border-light);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 16rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.no-more {
  text-align: center;
  padding: 40rpx 0;
  font-size: 24rpx;
  color: var(--text-secondary);
}
</style>
