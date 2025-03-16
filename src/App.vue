<template>
  <div class="app-container">
    <router-view></router-view>
    <van-tabbar v-model="active" fixed>
      <van-tabbar-item icon="shop-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="orders-o" to="/orders">订单</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/mine">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const active = ref(0)
</script>

<style>
.app-container {
  min-height: 100vh;
  background: #f7f8fa;
}
</style>
