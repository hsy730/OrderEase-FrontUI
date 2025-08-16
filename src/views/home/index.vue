<template>
  <div class="order-page">
    <!-- 顶部标题栏 -->
    <van-nav-bar
      :title="error ? '店铺加载失败' : (shopDetail?.name| '加载中...')"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />

    <div class="content-container">
      <!-- 左侧分类菜单 -->
      <div class="category-menu">
        <category-list
          :categories="shopDetail?.tags || []"
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
// 添加createOrder到导入列表
import { getShopDetail, getTagBoundProducts, createOrder } from '@/api'
import CategoryList from '@/components/CategoryList.vue'
import ProductList from '@/components/ProductList.vue'
import ShoppingCart from '@/components/ShoppingCart.vue'

const router = useRouter()
const shopDetail = ref(null)

onMounted(async () => {
  try {
    // 获取店铺详情及分类
    const { data: shopRes } = await getShopDetail()
    if (shopRes) {
      shopDetail.value = shopRes;
      // 分类数据已整合至shopDetail
      // 移除旧接口数据残留
      error.value = ''
      
      // 添加默认选中逻辑
      if (categories.value.length > 0) {
        activeCategory.value = categories.value[0].id
        await handleCategorySelect(categories.value[0])
      }
    }
  } catch (error) {
    console.error('店铺数据加载失败:', error)
      error.value = '无法加载店铺分类信息'
  }
})

const products = ref([
  
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
        // 从购物车获取已有数量
        count: cartItems.value.find(item => item.id === p.id)?.count || 0
      }))
    }
  } catch (error) {
    console.error('获取商品失败:', error)
    products.value = []
  }
}

// 在顶部添加 Toast 方法引入
import { showSuccessToast, showFailToast } from 'vant'

const handleSubmitOrder = async () => {
  if (cartItems.value.length === 0) {
    showFailToast({
      message: '购物车为空',
      position: 'top',
    })
    return
  }

  try {
    // 构造符合接口要求的订单数据
    const orderData = {
      user_id: parseInt(localStorage.getItem('userId')),
      items: cartItems.value.map(item => ({
        product_id: item.id,
        quantity: item.count
      }))
    }

    // 发送单个订单创建请求
    const response = await createOrder(orderData)
    
    if (response.data.code === 200) {
      showSuccessToast({ message: '订单创建成功', position: 'top' })
      cartItems.value = []
      router.push('/orders')
    } else {
      throw new Error(response.data.error || '订单创建失败')
    }
  } catch (error) {
    console.error('订单提交失败:', error)
    showFailToast(error.message || '订单提交失败')
  }
}

const onClickLeft = () => {
  router.back()
}

// 修改 handleAddToCart 方法
const handleAddToCart = (product) => {
  // 当数量为0时从购物车移除
  if (product.count === 0) {
    cartItems.value = cartItems.value.filter(item => item.id !== product.id)
  } else {
    const cartIndex = cartItems.value.findIndex(item => item.id === product.id)
    if (cartIndex === -1) {
      cartItems.value.push({...product})
    } else {
      cartItems.value[cartIndex].count = product.count
    }
  }

  // 强制同步到商品列表
  const productIndex = products.value.findIndex(p => p.id === product.id)
  if (productIndex > -1) {
    products.value[productIndex].count = product.count
  }
}

const handleRemoveItem = (id) => {
  // 清空对应商品的计数器
  const productIndex = products.value.findIndex(p => p.id === id)
  if (productIndex > -1) {
    products.value[productIndex].count = 0
  }
  
  // 从购物车移除
  cartItems.value = cartItems.value.filter(item => item.id !== id)
}

// 修改计数器更新方法
const handleCountChange = (id, delta) => {
  const cartIndex = cartItems.value.findIndex(item => item.id === id)
  if (cartIndex > -1) {
    const newCount = cartItems.value[cartIndex].count + delta
    
    // 同步到商品列表
    const productIndex = products.value.findIndex(p => p.id === id)
    if (productIndex > -1) {
      products.value[productIndex].count = Math.max(0, newCount)
    }

    if (newCount > 0) {
      cartItems.value[cartIndex].count = newCount
    } else {
      // 数量为0时触发移除逻辑
      handleRemoveItem(id)
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