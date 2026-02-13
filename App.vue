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

/* #ifdef H5 */
* {
  box-sizing: border-box;
}
/* #endif */

/* 通用容器 */
.container {
  width: 100%;
  min-height: 100vh;
}
</style>
