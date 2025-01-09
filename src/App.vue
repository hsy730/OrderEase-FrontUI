<template>
  <div class="app-container">
    <router-view></router-view>
    <van-tabbar v-model="active" fixed>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="coffee-o" to="/order">点单</van-tabbar-item>
      <van-tabbar-item icon="gift-o" to="/activity">活动</van-tabbar-item>
      <van-tabbar-item icon="shopping-cart-o" to="/pickup">取茶</van-tabbar-item>
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
