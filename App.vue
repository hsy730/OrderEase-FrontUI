<template>
  <view class="app">
  </view>
</template>

<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  // 应用启动
})

onShow(() => {
  console.log('App Show')
  // 应用显示
})

onHide(() => {
  console.log('App Hide')
  // 应用隐藏
})
</script>

<style lang="scss">
/* 引入全局样式 */
@import '@/assets/theme-blue-orange.css';

/* 全局样式重置 */
page {
  background-color: #F8FAFC;
  font-size: 28rpx;
  line-height: 1.6;
  color: #0F172A;
}

view {
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}

/* 主题色变量 */
:root {
  --primary-blue: #1E40AF;
  --primary-blue-light: #3B82F6;
  --accent-orange: #F97316;
  --price-primary: #EA580C;
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;
  --text-primary: #0F172A;
  --text-secondary: #475569;
}

/* 通用容器 */
.container {
  width: 100%;
  min-height: 100vh;
}

/* 文本颜色类 */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-tertiary { color: #94A3B8; }
.text-accent { color: var(--accent-orange); }
.text-price { color: var(--price-primary); }

/* 背景色类 */
.bg-primary { background-color: var(--bg-primary); }
.bg-secondary { background-color: var(--bg-secondary); }

/* 字体大小类 */
.text-sm { font-size: 24rpx; }
.text-base { font-size: 28rpx; }
.text-lg { font-size: 32rpx; }
.text-xl { font-size: 36rpx; }
.text-2xl { font-size: 40rpx; }

/* 字体粗细类 */
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }

/* 圆角类 */
.rounded-sm { border-radius: 8rpx; }
.rounded-md { border-radius: 16rpx; }
.rounded-lg { border-radius: 24rpx; }
.rounded-full { border-radius: 9999rpx; }

/* 阴影类 */
.shadow-sm { box-shadow: 0 2rpx 8rpx rgba(30, 64, 175, 0.08); }
.shadow-md { box-shadow: 0 4rpx 12rpx rgba(30, 64, 175, 0.12); }
.shadow-lg { box-shadow: 0 8rpx 24rpx rgba(30, 64, 175, 0.15); }

/* 间距类 */
.m-0 { margin: 0; }
.m-1 { margin: 8rpx; }
.m-2 { margin: 16rpx; }
.m-3 { margin: 24rpx; }
.m-4 { margin: 32rpx; }

.mt-1 { margin-top: 8rpx; }
.mt-2 { margin-top: 16rpx; }
.mt-3 { margin-top: 24rpx; }

.mb-1 { margin-bottom: 8rpx; }
.mb-2 { margin-bottom: 16rpx; }
.mb-3 { margin-bottom: 24rpx; }

.p-0 { padding: 0; }
.p-1 { padding: 8rpx; }
.p-2 { padding: 16rpx; }
.p-3 { padding: 24rpx; }

.pt-1 { padding-top: 8rpx; }
.pt-2 { padding-top: 16rpx; }
.pb-1 { padding-bottom: 8rpx; }
.pb-2 { padding-bottom: 16rpx; }

/* Flex 布局 */
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.flex-1 { flex: 1; }
.flex-wrap { flex-wrap: wrap; }

/* 文本对齐 */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* 溢出处理 */
.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 定位 */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }

/* 显示/隐藏 */
.hidden { display: none; }

/* 渐变按钮 */
.btn-gradient {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
  font-weight: 600;
}

.btn-accent {
  background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
  font-weight: 600;
}
</style>