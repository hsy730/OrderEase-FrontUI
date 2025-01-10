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

    <div class="content-container">
      <!-- 左侧分类菜单 -->
      <div class="category-menu">
        <category-list
          :categories="categories"
          :active-category="activeCategory"
          @select="handleCategorySelect"
        />
      </div>

      <!-- 右侧商品列表 -->
      <div class="product-container">
        <product-list
          :products="products"
          @add-to-cart="handleAddToCart"
        />
      </div>
    </div>

    <!-- 底部购物车 -->
    <shopping-cart
      :cart-items="cartItems"
      @submit="handleSubmitOrder"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CategoryList from '@/components/CategoryList.vue'
import ProductList from '@/components/ProductList.vue'
import ShoppingCart from '@/components/ShoppingCart.vue'

const router = useRouter()
const categories = ref([
  { id: 1, name: '煲仔饭' },
  { id: 2, name: '老火汤' },
  { id: 3, name: '特色' },
  { id: 4, name: '粉面' },
  { id: 5, name: '果汁' },
  { id: 6, name: '点心' },
  { id: 7, name: '甜点' },
  { id: 8, name: '套餐' }
])

const products = ref([
  {
    id: 1,
    name: '菌菇清汤',
    price: 38,
    image: '/food1.jpg',
    count: 0
  }
])

const activeCategory = ref(1)
const cartItems = ref([])

const handleCategorySelect = (category) => {
  activeCategory.value = category.id
  // TODO: 加载该分类的商品
}

const handleAddToCart = (product) => {
  const index = cartItems.value.findIndex(item => item.id === product.id)
  if (index === -1) {
    cartItems.value.push({ ...product })
  } else {
    cartItems.value[index].count = product.count
  }
}

const handleSubmitOrder = () => {
  // TODO: 提交订单逻辑
}

const onClickLeft = () => {
  router.back()
}
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: #fff;
}

.content-container {
  display: flex;
  height: calc(100vh - 96px);
  margin-top: 46px;
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
</style> 