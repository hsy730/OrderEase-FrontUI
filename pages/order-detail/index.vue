<!--
  @deprecated 此文件已废弃，不再使用
  订单详情功能已迁移到 src/pages/orders/index.vue 中的 uni-popup 弹窗实现
  保留此文件仅作参考，请勿继续维护
-->
<template>
  <view class="order-detail-container">
    <view v-if="!loading" class="detail-content">
      <!-- 订单状态 -->
      <view class="status-section">
        <view :class="['status-icon', `status-${order.status}`]">
          <text class="icon">{{ getStatusIcon(order.status) }}</text>
        </view>
        <view class="status-info">
          <text class="status-text">{{ getOrderStatusText(order.status) }}</text>
          <text v-if="order.status === 'pending'" class="status-tip">
            请在 30 分钟内完成支付
          </text>
          <text v-if="order.status === 'completed'" class="status-tip">
            订单已完成，感谢您的光临
          </text>
        </view>
      </view>

      <!-- 订单进度 -->
      <view class="progress-section">
        <view class="progress-timeline">
          <view
            v-for="(step, index) in orderSteps"
            :key="index"
            :class="['timeline-item', { active: index <= currentStep }]"
          >
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-title">{{ step.title }}</text>
              <text v-if="step.time" class="timeline-time">{{ step.time }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="order-info-section">
        <view class="section-title">订单信息</view>
        <view class="info-row">
          <text class="info-label">订单号</text>
          <text class="info-value">{{ order.order_no }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ formatFullTime(order.created_at) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">支付时间</text>
          <text class="info-value">{{ order.paid_at ? formatFullTime(order.paid_at) : '-' }}</text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="order-items-section">
        <view class="section-title">商品明细</view>
        <view
          v-for="item in order.items"
          :key="item.id"
          class="detail-item"
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

      <!-- 优惠信息 -->
      <view v-if="order.discount_amount > 0" class="discount-section">
        <view class="section-title">优惠信息</view>
        <view class="discount-row">
          <text class="discount-label">{{ order.discount_name }}</text>
          <text class="discount-value">-¥{{ order.discount_amount.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 价格明细 -->
      <view class="price-section">
        <view class="section-title">价格明细</view>
        <view class="price-row">
          <text class="price-label">商品总额</text>
          <text class="price-value">¥{{ order.subtotal.toFixed(2) }}</text>
        </view>
        <view v-if="order.discount_amount > 0" class="price-row">
          <text class="price-label">优惠金额</text>
          <text class="price-value discount">-¥{{ order.discount_amount.toFixed(2) }}</text>
        </view>
        <view class="price-row">
          <text class="price-label">实付金额</text>
          <text class="price-value total">¥{{ order.total_price.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="footer-actions">
        <button
          v-if="order.status === 'pending'"
          class="action-btn btn-cancel"
          @click="handleCancel"
        >
          取消订单
        </button>
        <button
          v-if="order.status === 'pending'"
          class="action-btn btn-pay"
          @click="handlePay"
        >
          去支付
        </button>
        <button
          v-if="order.status === 'completed'"
          class="action-btn btn-primary"
          @click="handleReorder"
        >
          再次购买
        </button>
        <button
          v-if="['paid', 'completed', 'cancelled'].includes(order.status)"
          class="action-btn btn-default"
          @click="handleContact"
        >
          联系客服
        </button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-else class="loading-state">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOrderDetail } from '@/api'

const order = ref({})
const loading = ref(true)
const orderId = ref('')

// 订单进度步骤
const orderSteps = ref([
  { title: '提交订单', time: '' },
  { title: '支付成功', time: '' },
  { title: '准备中', time: '' },
  { title: '待取餐', time: '' },
  { title: '已完成', time: '' }
])

// 当前进度
const currentStep = computed(() => {
  const statusStepMap = {
    'pending': 0,
    'paid': 1,
    'preparing': 2,
    'ready': 3,
    'completed': 4,
    'cancelled': 0
  }
  return statusStepMap[order.value.status] || 0
})

// 加载订单详情
const loadOrderDetail = async () => {
  if (!orderId.value) return

  try {
    loading.value = true
    const res = await getOrderDetail(orderId.value)
    order.value = res.data.data || {}

    // 更新订单步骤时间
    updateStepTimes()
  } catch (error) {
    console.error('加载订单详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 更新步骤时间
const updateStepTimes = () => {
  if (order.value.created_at) {
    orderSteps.value[0].time = formatFullTime(order.value.created_at)
  }
  if (order.value.paid_at) {
    orderSteps.value[1].time = formatFullTime(order.value.paid_at)
  }
  // 其他步骤时间需要后端提供
}

// 获取状态图标
const getStatusIcon = (status) => {
  const iconMap = {
    'pending': '⏰',
    'paid': '💳',
    'preparing': '👨‍🍳',
    'ready': '🔔',
    'completed': '✅',
    'cancelled': '❌'
  }
  return iconMap[status] || '📋'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    'pending': '待支付',
    'paid': '已支付',
    'preparing': '准备中',
    'ready': '待取餐',
    'completed': '已完成',
    'cancelled': '已取消',
    'refunded': '已退款'
  }
  return statusMap[status] || status
}

// 格式化完整时间
const formatFullTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 取消订单
const handleCancel = () => {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消这个订单吗？',
    success: (res) => {
      if (res.confirm) {
        console.log('取消订单:', orderId.value)
        uni.showToast({
          title: '订单已取消',
          icon: 'success'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

// 去支付
const handlePay = () => {
  console.log('去支付:', orderId.value)
  uni.showToast({
    title: '调起支付',
    icon: 'none'
  })
}

// 再次购买
const handleReorder = () => {
  // 将商品添加到购物车
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/home/index'
    })
  }, 1500)
}

// 联系客服
const handleContact = () => {
  uni.showModal({
    title: '联系客服',
    content: '客服电话：400-123-4567',
    confirmText: '拨打',
    success: (res) => {
      if (res.confirm) {
        uni.makePhoneCall({
          phoneNumber: '4001234567'
        })
      }
    }
  })
}

// 页面加载
onMounted(() => {
  // 从路由参数获取订单ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.$page.options
  orderId.value = options.id

  loadOrderDetail()
})
</script>

<script>
export default {
  onShareAppMessage() {
    return {
      title: '我的订单',
      path: '/pages/orders/index',
      imageUrl: '/static/share-image.png'
    }
  }
}
</script>

<style scoped>
.order-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 状态区域 */
.status-section {
  background: #fff;
  padding: 48rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.status-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
}

.status-icon .icon {
  font-size: 64rpx;
}

.status-icon.status-pending {
  background: rgba(255, 152, 0, 0.1);
}

.status-icon.status-paid {
  background: rgba(76, 175, 80, 0.1);
}

.status-icon.status-completed {
  background: rgba(33, 150, 243, 0.1);
}

.status-icon.status-cancelled {
  background: rgba(158, 158, 158, 0.1);
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-primary);
}

.status-tip {
  font-size: 24rpx;
  color: var(--text-secondary);
}

/* 进度区域 */
.progress-section {
  background: #fff;
  padding: 32rpx;
}

.progress-timeline {
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

.timeline-item {
  display: flex;
  gap: 24rpx;
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 16rpx;
  top: 32rpx;
  bottom: -64rpx;
  width: 2rpx;
  background: var(--border-light);
}

.timeline-item.active:not(:last-child)::before {
  background: var(--primary-blue);
}

.timeline-dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: var(--border-light);
  border: 4rpx solid #fff;
  box-shadow: 0 0 0 2rpx var(--border-light);
  flex-shrink: 0;
  margin-top: 8rpx;
}

.timeline-item.active .timeline-dot {
  background: var(--primary-blue);
  box-shadow: 0 0 0 2rpx var(--primary-blue);
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-top: 8rpx;
}

.timeline-title {
  font-size: 28rpx;
  color: var(--text-primary);
}

.timeline-item.active .timeline-title {
  color: var(--primary-blue);
  font-weight: bold;
}

.timeline-time {
  font-size: 24rpx;
  color: var(--text-secondary);
}

/* 信息区域 */
.order-info-section,
.discount-section,
.price-section {
  background: #fff;
  padding: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid var(--bg-secondary);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.info-value {
  font-size: 28rpx;
  color: var(--text-primary);
}

/* 商品明细 */
.order-items-section {
  background: #fff;
  padding: 32rpx;
}

.detail-item {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid var(--bg-secondary);
}

.detail-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.item-image {
  width: 160rpx;
  height: 160rpx;
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
}

.item-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 12rpx 0;
}

.option-tag {
  padding: 6rpx 12rpx;
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

/* 优惠信息 */
.discount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.discount-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.discount-value {
  font-size: 28rpx;
  color: #f56c6c;
  font-weight: bold;
}

/* 价格明细 */
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.price-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.price-value {
  font-size: 28rpx;
  color: var(--text-primary);
}

.price-value.discount {
  color: #f56c6c;
}

.price-value.total {
  font-size: 36rpx;
  color: #f56c6c;
  font-weight: bold;
}

/* 底部操作栏 */
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  box-shadow: var(--shadow-lg);
}

.action-btn {
  padding: 20rpx 40rpx;
  border-radius: 48rpx;
  font-size: 28rpx;
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

.action-btn.btn-primary {
  background: var(--gradient-primary);
  color: #fff;
  border-color: transparent;
}

.action-btn.btn-default {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid var(--border-light);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: var(--text-secondary);
}
</style>
