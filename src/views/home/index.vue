<template>
  <div class="order-page">
    <!-- 顶部标题栏 -->
    <van-nav-bar
      :title="error ? '店铺加载失败' : (shopDetail?.name || '加载中...')"
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
          @show-cart-popup="handleShowCartPopup"
        />
      </div>
    </div>

    <!-- 底部购物车 -->
    <ShoppingCart
      :cart-items="cartItems"
      v-model:show="showCartPopup"
      @submit="handleSubmitOrder"
      @increase="handleCountChange($event, 1)"
      @decrease="handleCountChange($event, -1)"
      @remove="handleRemoveItem"
      @update:count="handleCountUpdate"
      @clear="handleClearCart"
    />
  </div>

  <van-popup 
    v-model:show="showOptionsPopup"
    position="bottom"
    :style="{ height: '60%' }"
  >
    <div class="popup-content">
      <div v-if="selectedProduct" v-for="category in selectedProduct.option_categories || []" :key="category.id">
       <h4>{{ category.name }}<span v-if="category.is_required" style="color: red">*</span></h4>
        <van-cell-group>
          <van-cell>
            <template #right-icon>
              <div class="flex gap-2 flex-wrap">
                <div 
                  v-for="option in category.options"
                  :key="option.id"
                  class="option-item"
                  :class="{ 'selected': isOptionSelected(category, option) }"
                  @click="toggleOption(category, option)"
                >
                  {{ option.name }}
                  <span v-if="option.price_adjustment > 0">+¥{{ option.price_adjustment }}</span>
                </div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>
    <div class="footer-actions">
      <div class="price-display">
        总计：¥{{ (selectedProduct?.price || 0) + optionTotal }}
      </div>
      <div style="width: fit-content;">
          <van-button 
        type="primary"
        block
        round
        @click="confirmSelection"
      >
        确认
      </van-button>
      </div>
      
    </div>
  </van-popup>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
// 添加createOrder到导入列表
import { getShopDetail, getTagBoundProducts, createOrder } from '@/api'
import CategoryList from '@/components/CategoryList.vue'
import ProductList from '@/components/ProductList.vue'
import ShoppingCart from '@/components/ShoppingCart.vue'
import { Popup } from 'vant'
// 在顶部添加 Toast 方法引入
import { showSuccessToast, showFailToast, showToast } from 'vant'
const components = {
  VanPopup: Popup
}

const router = useRouter()
const shopDetail = ref(null)

const selectedProduct = ref(null)
const showOptionsPopup = ref(false)

onMounted(async () => {
  try {
    // 获取店铺详情及分类
    const { data: shopRes } = await getShopDetail()
    if (shopRes) {
      shopRes.tags.push({id: -1, name: "未分类"})
      shopDetail.value = shopRes;
      // 分类数据已整合至shopDetail
      // 移除旧接口数据残留
      error.value = ''
      
      // 添加默认选中逻辑
      if (shopRes.tags.length > 0) {
        activeCategory.value = shopRes.tags[0].id
        await handleCategorySelect(shopRes.tags[0])
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
const error = ref('')
const showCartPopup = ref(false)

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
        count: cartItems.value.find(item => item.id === p.id)?.count || 0,
        option_categories: p.option_categories || []
      }))
      return;
    }
    products.value = []
  } catch (error) {
    console.error('获取商品失败:', error)
    products.value = []
  }
}



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

const addToCart = (product) => {
  // 为带选项的商品生成唯一标识符
  const getCartItemKey = (item) => {
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      // 对选项进行排序以确保一致性
      const sortedOptions = [...item.selectedOptions].sort((a, b) => 
        a.category.localeCompare(b.category)
      );
      return `${item.id}-${JSON.stringify(sortedOptions)}`;
    }
    return `${item.id}`;
  };

  const productKey = getCartItemKey(product);
  
  // 查找具有相同选项的商品
  const existingIndex = cartItems.value.findIndex(item => 
    getCartItemKey(item) === productKey
  );

  if (existingIndex > -1) { // 存在判断增减
    if (product.action === 'add') {
      cartItems.value[existingIndex].count += product.count;
    } else {
      cartItems.value[existingIndex].count = Math.max(0, cartItems.value[existingIndex].count - product.count);
    }
    
    // 如果数量为0，从购物车移除
    if (cartItems.value[existingIndex].count === 0) {
      handleRemoveItem(product.id)
    }
  } else { // 不存在则添加
    // 为购物车商品添加唯一标识符
    const cartItem = {
      ...product,
      basePrice: product.price,
      count: product.count || 1,
      cartItemId: productKey // 添加唯一标识符
    };
    
    cartItems.value.push(cartItem);
    
    // 同步到商品列表
    const productIndex = products.value.findIndex(p => p.id === product.id)
    if (productIndex > -1) {
      products.value[productIndex].count = product.count || 1
      products.value[productIndex].lastCount = product.count || 1
    }
  }
}

// 选项弹窗交互逻辑
const handleAddToCart = (product) => {
  if (product.option_categories?.length) {
    // 显示商品选项popup，二次选择
    if (product.action === 'add') {
      selectedProduct.value = product
      showOptionsPopup.value = true
    } else {
      // 定制商品（有选项参数）需要在购物车中移除，自动显示购物车popup
      showCartPopup.value = true
    }
  } else {
    addToCart({ ...product, count: 1 })
  }
}

const handleShowCartPopup = (product) => {
  showCartPopup.value = true
  showToast(`请在购物车中移除定制商品`)
}

const confirmSelection = () => {
  if (!selectedProduct.value) return

  // 计算包含选项的最终价格
  const finalPrice = selectedProduct.value.price + optionTotal.value

  // 创建带选项的商品副本
  const productWithOptions = {
    ...selectedProduct.value,
    finalPrice: finalPrice,
    price: finalPrice, // 更新商品价格为包含选项的最终价格
    selectedOptions: Array.from(selectedOptions.value).map(([categoryId, opts]) => ({
      category: selectedProduct.value.option_categories.find(c => c.id === categoryId)?.name,
      options: opts.map(o => o.name)
    })),
    count: 1
  }

  addToCart(productWithOptions)
  showOptionsPopup.value = false
}

// 添加弹窗关闭处理
const handlePopupClose = () => {
  showOptionsPopup.value = false
  selectedProduct.value = null
}
// 选项选择处理器
const handleOptionSelect = (category, option) => {
  if (category.is_multiple) {
    // 处理多选逻辑...
  } else {
    selectedOptions.value[category.id] = option
  }
}

// 最终价格计算
const calculateFinalPrice = () => {
  return selectedProduct.value.price + 
    Object.values(selectedOptions.value).reduce((total, option) => {
      return total + (option?.price_adjustment || 0)
    }, 0)
}

const handleRemoveItem = (id) => {
  // 清空对应商品的计数器
  const productIndex = products.value.findIndex(p => p.id === id)
  if (productIndex > -1) {
    products.value[productIndex].count = 0
  }
  
  // 从购物车移除
  // 如果id包含选项信息，则使用cartItemId进行匹配
  if (typeof id === 'string' && id.includes('-')) {
    // 这是一个带选项的商品ID
    cartItems.value = cartItems.value.filter(item => item.cartItemId !== id)
  } else {
    // 这是一个普通商品ID
    cartItems.value = cartItems.value.filter(item => item.id !== id)
  }
}

// 修改计数器更新方法
const handleCountChange = (id, delta) => {
  // 查找购物车中的商品索引
  let cartIndex = -1;
  if (typeof id === 'string' && id.includes('-')) {
    // 这是一个带选项的商品ID
    cartIndex = cartItems.value.findIndex(item => item.cartItemId === id)
  } else {
    // 这是一个普通商品ID
    cartIndex = cartItems.value.findIndex(item => item.id === id)
  }
  
  if (cartIndex > -1) {
    const newCount = cartItems.value[cartIndex].count + delta
    
    // 同步到商品列表（仅对普通商品）
    if (typeof id !== 'string' || !id.includes('-')) {
      const productIndex = products.value.findIndex(p => p.id === id)
      if (productIndex > -1) {
        products.value[productIndex].count = Math.max(0, newCount)
        // 同步lastCount用于ProductList组件的逻辑处理
        if (newCount === 0) {
          products.value[productIndex].lastCount = 0
        }
      }
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
  
  // 同步到商品列表（仅对普通商品）
  if (typeof id !== 'string' || !id.includes('-')) {
    const productIndex = products.value.findIndex(p => p.id === id)
    if (productIndex > -1) {
      products.value[productIndex].count = validCount
      // 同步lastCount用于ProductList组件的逻辑处理
      if (validCount === 0) {
        products.value[productIndex].lastCount = 0
      }
    }
  }

  // 更新购物车
  let cartIndex = -1;
  if (typeof id === 'string' && id.includes('-')) {
    // 这是一个带选项的商品ID
    cartIndex = cartItems.value.findIndex(item => item.cartItemId === id)
  } else {
    // 这是一个普通商品ID
    cartIndex = cartItems.value.findIndex(item => item.id === id)
  }
  
  if (cartIndex > -1) {
    cartItems.value[cartIndex].count = validCount
    // 当数量为0时，确保正确清理
    if (validCount === 0) {
      handleRemoveItem(id)
    }
  }
}

const handleClearCart = () => {
  // 清空所有商品的计数器
  products.value.forEach(product => {
    product.count = 0
    product.lastCount = 0
  })
  
  // 清空购物车
  cartItems.value = []
}
// 在script setup部分添加
const selectedOptions = ref(new Map())

const optionTotal = computed(() => {
  return Array.from(selectedOptions.value.values())
    .flat()
    .reduce((sum, opt) => sum + (opt.price_adjustment || 0), 0)
})

const toggleOption = (category, option) => {
  const categoryOptions = selectedOptions.value.get(category.id) || []
  
  if (category.is_required) {
    // 单选逻辑
    selectedOptions.value.set(category.id, [option])
  } else {
    // 多选逻辑
    const index = categoryOptions.findIndex(o => o.id === option.id)
    if (index > -1) {
      categoryOptions.splice(index, 1)
    } else {
      categoryOptions.push(option)
    }
    selectedOptions.value.set(category.id, categoryOptions)
  }
}

const isOptionSelected = (category, option) => {
  const categoryOptions = selectedOptions.value.get(category.id) || []
  return categoryOptions.some(opt => opt.id === option.id)
}


</script>

<style scoped>
.flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-item {
  white-space: nowrap;
  padding: 8px 12px;
  border: 1px solid #eee;
  border-radius: 16px;
  margin: 4px;
  transition: all 0.2s;
}

.selected {
  border-color: #07c160;
  color: #07c160;
  background-color: #f0faff;
}
.order-page {
  min-height: 100vh;
  background: #fff;
  overflow: hidden; /* 隐藏页面滚动条 */
  position: relative; /* 确保定位上下文 */
}

.content-container {
  display: flex;
  /* 修改高度计算：减去顶部导航栏(46px)、底部Tabbar(50px)和购物车(50px)的高度 */
  height: calc(100vh - 146px);
  margin-top: 46px;
  overflow: hidden; /* 隐藏容器滚动条 */
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

/* 确保购物车在Tabbar之上 */
:deep(.cart-bar) {
  bottom: 50px; /* Tabbar的高度 */
}
.popup-content {
  padding: 16px;
}
</style>

<style scoped>
.footer-actions {
  position: fixed;
  bottom: 0;
  padding: 16px;
  background: white;
  border-top: 1px solid #ebedf0;
  z-index: 1;
  width: inherit;
}

.confirm-btn {
  width: 100%;
  padding: 12px;
  background: #07c160;
  color: white;
  border-radius: 8px;
}

 .footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #ebedf0;
    }
    
    .price-display {
      font-size: 16px;
      color: #ee0a24;
      font-weight: 500;
    }
</style>
