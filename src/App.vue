<template>
  <div class="app-container">
    <!-- 公共导航栏 -->
    <CommonNavBar 
      v-if="showNavBar" 
      :title="navBarTitle" 
      :show-back="showBackButton" 
    />
    <router-view></router-view>
    <van-tabbar v-model="active" :route="true" fixed>
      <van-tabbar-item icon="shop-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="orders-o" to="/orders">订单</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/mine">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import CommonNavBar from '@/components/CommonNavBar.vue'
import { getShopDetail } from '@/api'

const active = ref(0)
const route = useRoute()
const shopDetail = ref(null)
const error = ref('')

// 获取店铺详情
const fetchShopDetail = async () => {
  try {
    const response = await getShopDetail()
    if (response.data && response.status === 200) {
      shopDetail.value = response.data
      error.value = ''
    } else {
      error.value = '无法加载店铺信息'
    }
  } catch (err) {
    console.error('获取店铺详情失败:', err)
    error.value = '获取店铺详情失败'
  }
}

// 页面加载时获取店铺详情
fetchShopDetail()

// 监听路由变化，必要时重新获取店铺详情
watch(() => route.query.shop_id, () => {
  fetchShopDetail()
})

// 导航栏相关计算属性
const showNavBar = computed(() => {
  // 可以根据路由或其他条件决定是否显示导航栏
  return true
})

const navBarTitle = computed(() => {
  // 根据当前路由返回相应的标题
  switch (route.name) {
    case 'Home':
      return error.value ? '店铺加载失败' : (shopDetail.value?.name || '加载中...')
    case 'Orders':
      return error.value ? '店铺加载失败' : (shopDetail.value?.name || '加载中...')
    case 'Mine':
      return error.value ? '店铺加载失败' : (shopDetail.value?.name || '加载中...')
    case 'Login':
      return '用户登录'
    case 'Register':
      return '用户注册'
    default:
      return ''
  }
})

const showBackButton = computed(() => {
  // 只在首页显示返回按钮
  return route.name === 'Home'
})
</script>

<style>
.app-container {
  min-height: 100vh;
  height: 100vh; /* 固定高度为视口高度 */
  background: #f7f8fa;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 路由视图容器 */
.app-container > :not(.van-tabbar) {
  flex: 1;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.app-container > :not(.van-tabbar)::-webkit-scrollbar {
  display: none;
}
</style>