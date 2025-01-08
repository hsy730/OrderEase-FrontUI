<template>
  <div class="order-container">
    <!-- 左侧分类列表 -->
    <div class="category-wrapper">
      <category-list
        :categories="categories"
        :active-category="activeCategory"
        @select="handleCategorySelect"
      />
    </div>
    
    <!-- 右侧商品列表 -->
    <div class="product-wrapper">
      <product-list
        :products="products"
        @add-to-cart="handleAddToCart"
      />
    </div>

    <!-- 底部购物车 -->
    <shopping-cart
      :cart-items="cartItems"
      @submit="handleSubmitOrder"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import CategoryList from '@/components/CategoryList.vue'
import ProductList from '@/components/ProductList.vue'
import ShoppingCart from '@/components/ShoppingCart.vue'

const store = useStore()
const categories = ref([])
const products = ref([])
const activeCategory = ref('')
const cartItems = ref([])

// 获取分类列表
const fetchCategories = async () => {
  // TODO: 调用API获取分类列表
}

// 获取商品列表
const fetchProducts = async (categoryId) => {
  // TODO: 调用API获取商品列表
}

// 分类选择处理
const handleCategorySelect = (category) => {
  activeCategory.value = category.id
  fetchProducts(category.id)
}

// 添加到购物车
const handleAddToCart = (product) => {
  // TODO: 添加到购物车逻辑
}

// 提交订单
const handleSubmitOrder = async () => {
  // TODO: 提交订单逻辑
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.order-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.category-wrapper {
  width: 85px;
  height: 100%;
  overflow-y: auto;
  background: #f7f8fa;
}

.product-wrapper {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 50px;
}
</style> 