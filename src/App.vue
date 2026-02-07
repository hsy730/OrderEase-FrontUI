<template>
  <view class="app-container">
  </view>
</template>

<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
@import './assets/main.css';

.app-container {
  width: 100%;
  height: 100%;
}
</style>
