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
    <ShoppingCart
      :cart-items="cartItems"
      @submit="handleSubmitOrder"
      @increase="handleCountChange($event, 1)"
      @decrease="handleCountChange($event, -1)"
      @remove="handleRemoveItem"
      @update:count="handleCountUpdate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTags, getTagBoundProducts } from '@/api' // 新增导入
import CategoryList from '@/components/CategoryList.vue'
import ProductList from '@/components/ProductList.vue'
import ShoppingCart from '@/components/ShoppingCart.vue'

const router = useRouter()
const categories = ref([]) // 移除静态数据

onMounted(async () => {
  try {
    const response = await getTags()
    if (response.status === 200) {
      categories.value = response.data.tags
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
})

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

const handleCategorySelect = async (category) => {
  activeCategory.value = category.id
  try {
    const response = await getTagBoundProducts({
      tag_id: category.id,
      page: 1,
      pageSize: 20
    })
    
    if (response.status === 200) {
      products.value = response.data.data.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url,
        description: p.description,
        count: 0
      }))
    }
  } catch (error) {
    console.error('获取商品失败:', error)
    products.value = []
  }
}

const handleSubmitOrder = () => {
  // TODO: 提交订单逻辑
}

const onClickLeft = () => {
  router.back()
}

// 修改 handleAddToCart 方法
const handleAddToCart = (product) => {
  // 同步更新商品列表
  const productIndex = products.value.findIndex(p => p.id === product.id)
  if (productIndex > -1) {
    products.value[productIndex].count = product.count
  }

  // 更新购物车
  const cartIndex = cartItems.value.findIndex(item => item.id === product.id)
  if (cartIndex === -1) {
    cartItems.value.push({...product})
  } else {
    cartItems.value[cartIndex].count = product.count
  }
}

// 修改计数器更新方法
const handleCountChange = (id, delta) => {
  const cartIndex = cartItems.value.findIndex(item => item.id === id)
  if (cartIndex > -1) {
    const newCount = cartItems.value[cartIndex].count + delta
    // 同步到商品列表
    const productIndex = products.value.findIndex(p => p.id === id)
    if (productIndex > -1) {
      products.value[productIndex].count = newCount
    }
    
    if (newCount > 0) {
      cartItems.value[cartIndex].count = newCount
    } else {
      cartItems.value.splice(cartIndex, 1)
    }
  }
}

// 修改直接更新计数器的方法
const handleCountUpdate = ({ id, count }) => {
  const parsedCount = parseInt(count)
  const validCount = isNaN(parsedCount) ? 0 : Math.max(0, parsedCount)
  
  // 同步到商品列表
  const productIndex = products.value.findIndex(p => p.id === id)
  if (productIndex > -1) {
    products.value[productIndex].count = validCount
  }

  // 更新购物车
  const cartIndex = cartItems.value.findIndex(item => item.id === id)
  if (cartIndex > -1) {
    cartItems.value[cartIndex].count = validCount
  }
}

const handleRemoveItem = (id) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id)
}
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 100px; /* 为底部Tabbar和购物车预留空间 */
}

.content-container {
  display: flex;
  /* 修改高度计算：减去顶部导航栏(46px)、底部Tabbar(50px)和购物车(50px)的高度 */
  height: calc(100vh - 146px);
  margin-top: 46px;
  padding-bottom: 50px; /* 为购物车预留空间 */
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
  /* 确保内容不会被底部遮挡 */
  padding-bottom: 100px;
}

/* 确保购物车在Tabbar之上 */
:deep(.cart-bar) {
  bottom: 50px; /* Tabbar的高度 */
}
</style>