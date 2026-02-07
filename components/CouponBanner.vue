<template>
  <view class="coupon-banner" v-if="coupons.length > 0">
    <swiper
      :autoplay="autoplay"
      :interval="interval"
      :duration="duration"
      :circular="true"
      class="coupon-swiper"
      indicator-dots
      indicator-color="rgba(0, 0, 0, 0.2)"
      indicator-active-color="#1E40AF"
    >
      <swiper-item v-for="coupon in coupons" :key="coupon.id">
        <view class="coupon-card" @click="handleCouponClick(coupon)">
          <view class="coupon-left">
            <view class="coupon-amount">
              <text class="currency">¥</text>
              <text class="value">{{ coupon.amount }}</text>
            </view>
            <view class="coupon-condition">{{ coupon.condition }}</view>
          </view>
          <view class="coupon-right">
            <view class="coupon-title">{{ coupon.title }}</view>
            <view class="coupon-date">{{ coupon.validity }}</view>
            <view class="coupon-btn" :class="{ 'received': coupon.received }">
              {{ coupon.received ? '已领取' : '立即领取' }}
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
const props = defineProps({
  coupons: {
    type: Array,
    default: () => []
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 3000
  },
  duration: {
    type: Number,
    default: 500
  }
})

const emit = defineEmits(['coupon-click'])

const handleCouponClick = (coupon) => {
  if (coupon.received) return
  emit('coupon-click', coupon)
}
</script>

<style scoped>
.coupon-banner {
  padding: 24rpx 0;
  background: var(--bg-secondary);
}

.coupon-swiper {
  height: 200rpx;
}

.coupon-card {
  display: flex;
  height: 100%;
  margin: 0 24rpx;
  background: linear-gradient(135deg, #FFF4E5 0%, #FFE8CC 100%);
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.coupon-left {
  width: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 2rpx dashed #FF9500;
  position: relative;
}

.coupon-left::before,
.coupon-left::after {
  content: '';
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  background: var(--bg-secondary);
  border-radius: 50%;
}

.coupon-left::before {
  top: -10rpx;
  right: -10rpx;
}

.coupon-left::after {
  bottom: -10rpx;
  right: -10rpx;
}

.coupon-amount {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 24rpx;
  color: #FF6B00;
  font-weight: bold;
}

.value {
  font-size: 56rpx;
  font-weight: bold;
  color: #FF6B00;
  margin-left: 4rpx;
}

.coupon-condition {
  font-size: 20rpx;
  color: #FF9500;
  margin-top: 8rpx;
  text-align: center;
}

.coupon-right {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-date {
  font-size: 20rpx;
  color: #999;
}

.coupon-btn {
  align-self: flex-end;
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #FF6B00 0%, #FF9500 100%);
  color: #fff;
  border-radius: 48rpx;
  font-size: 24rpx;
  font-weight: bold;
  transition: all 0.3s;
}

.coupon-btn.received {
  background: #ccc;
  pointer-events: none;
}
</style>
