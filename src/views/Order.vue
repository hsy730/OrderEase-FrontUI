<template>
    <div class="order-page">
      <!-- 顶部标题栏 -->
      <van-nav-bar
        title="中关村店"
        left-arrow
        @click-left="onClickLeft"
        fixed
        placeholder
      />
  
      <!-- 主要内容区 - 修改这部分的布局 -->
      <div class="content-container">
        <!-- 左侧分类菜单 -->
        <div class="category-menu">
          <van-sidebar v-model="activeCategory">
            <van-sidebar-item 
              v-for="category in categories" 
              :key="category.id"
              :title="category.name"
            />
          </van-sidebar>
        </div>
  
        <!-- 右侧商品列表 -->
        <div class="product-container">
          <div class="product-list">
            <div v-for="product in products" :key="product.id" class="product-item">
              <van-image
                :src="product.image"
                width="100"
                height="100"
                radius="8"
              />
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">
                  <span class="text-sm">¥</span>
                  <span class="text-lg font-bold">{{ product.price }}</span>
                </div>
                <div class="stepper-container">
                  <van-stepper
                    v-model="product.count"
                    theme="round"
                    button-size="22"
                    disable-input
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 底部购物车 -->
      <div class="cart-bar">
        <div class="cart-info">
          <van-badge :content="totalCount" :show="totalCount > 0">
            <van-icon name="shopping-cart-o" size="24" :class="totalCount > 0 ? 'text-[#1989fa]' : 'text-gray-500'" />
          </van-badge>
          <div class="price-info" v-if="totalAmount > 0">
            <span class="symbol">¥</span>
            <span class="amount">{{ totalAmount }}</span>
          </div>
        </div>
        <div class="submit-btn">
          <van-button 
            block
            :disabled="totalCount === 0"
            :color="totalCount === 0 ? '#7D7E80' : '#1989fa'"
          >
            选好了
          </van-button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const activeCategory = ref(0)
  
  // 分类数据
  const categories = ref([
    { id: 1, name: '煲仔饭' },
    { id: 2, name: '老火汤' },
    { id: 3, name: '特色' },
    { id: 4, name: '粉面' },
    { id: 5, name: '果汁' },
    { id: 6, name: '点心' },
    { id: 7, name: '甜点' },
    { id: 8, name: '套餐' },
    { id: 9, name: '饮料' },
    { id: 10, name: '西餐' }
  ])
  
  // 商品数据
  const products = ref([
    {
      id: 1,
      name: '菌菇清汤',
      price: 38,
      image: '/food1.jpg',
      count: 0
    },
    {
      id: 2,
      name: '菌菇清汤',
      price: 38,
      image: '/food1.jpg',
      count: 0
    },
    {
      id: 3,
      name: '菌菇清汤',
      price: 38,
      image: '/food1.jpg',
      count: 0
    }
  ])
  
  // 计算总数量
  const totalCount = computed(() => {
    return products.value.reduce((sum, product) => sum + product.count, 0)
  })
  
  // 计算总金额
  const totalAmount = computed(() => {
    return products.value.reduce((sum, product) => sum + product.price * product.count, 0)
  })
  
  // 返回上一页
  const onClickLeft = () => {
    router.back()
  }
  
  // 提交订单
  const onSubmit = () => {
    // TODO: 实现提交订单逻辑
  }
  </script>
  
  <style scoped>
  .order-page {
    min-height: 100vh;
    background: #fff;
    display: flex;
    flex-direction: column;
  }
  
  .content-container {
    display: flex;
    height: calc(100vh - 96px); /* 减去导航栏和底部购物车的高度 */
    margin-top: 46px; /* 导航栏的高度 */
  }
  
  .category-menu {
    width: 80px;
    flex-shrink: 0;
    background: #f8f8f8;
    overflow-y: auto;
    height: 100%;
  }
  
  .product-container {
    flex: 1;
    overflow-y: auto;
    height: 100%;
    padding: 12px;
  }
  
  .product-item {
    display: flex;
    margin-bottom: 16px;
    background: #fff;
    padding: 8px;
    border-radius: 8px;
  }
  
  .product-info {
    margin-left: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .product-name {
    font-size: 15px;
    font-weight: 500;
  }
  
  .product-price {
    margin-top: 8px;
    color: #ff4d4f;
  }
  
  .stepper-container {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
  }
  
  .cart-bar {
    height: 50px;
    background: white;
    border-top: 1px solid #eee;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 100;
  }
  
  .cart-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .price-info {
    display: flex;
    align-items: baseline;
  }
  
  .price-info .symbol {
    font-size: 12px;
    color: #333;
  }
  
  .price-info .amount {
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }
  
  .submit-btn {
    width: 120px;
  }
  
  :deep(.van-button) {
    height: 36px;
    line-height: 36px;
    font-size: 16px;
    border-radius: 18px;
  }
  
  :deep(.van-button--default) {
    background: #1989fa;
    border: none;
    color: white;
  }
  
  :deep(.van-button--disabled) {
    background: #7D7E80;
    color: white;
    opacity: 0.6;
  }
  
  :deep(.van-sidebar-item) {
    padding: 14px 12px;
    text-align: center;
  }
  
  :deep(.van-sidebar-item__text) {
    font-size: 14px;
  }
  
  :deep(.van-stepper__minus), :deep(.van-stepper__plus) {
    background: #f5f5f5;
    width: 22px;
    height: 22px;
  }
  
  /* 确保内容不会被底部购物车遮挡 */
  .product-list {
    padding-bottom: 50px;
  }
  </style> 