<template>
  <div class="order-page">
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
          @show-product-options="handleShowProductOptions"
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
    style="height: 60%;"
    closeable
  >
    <div class="popup-content">
      <h4 style="text-align: left; font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">{{ selectedProduct.name }}</h4>
      <div style="margin-top: 10px;" v-if="selectedProduct" v-for="category in selectedProduct.option_categories || []" :key="category.id">
       <h4>{{ category.name }}<span v-if="category.is_required" style="color: red">*</span></h4>
        <van-cell-group :border="false" style="padding-bottom: 0px;">
          <van-cell :border="false" style="padding: 0;">
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
      <div class="price-quantity-container">
        <div class="price-display">
          ¥{{ (selectedProduct?.price || 0) + optionTotal }}
        </div>
        <!-- 计数器 -->
        <div class="quantity-control" v-if="selectedProduct">
          <!-- <span class="quantity-label">数量</span> -->
          <van-stepper 
            v-model="productQuantity" 
            integer 
            :min="1" 
            :max="99" 
            theme="round" 
            button-size="22" 
          />
        </div>
      </div>
      <div class="button-container">
        <van-button 
          type="primary"
          round
          @click="confirmSelection"
        >
          加入购物车
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
import { Popup, Stepper } from 'vant'
// 在顶部添加 Toast 方法引入
import { showSuccessToast, showFailToast, showToast } from 'vant'
const components = {
  VanPopup: Popup,
  VanStepper: Stepper
}

const router = useRouter()
const shopDetail = ref(null)

const selectedProduct = ref(null)
const showOptionsPopup = ref(false)
const productQuantity = ref(1)

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
      items: cartItems.value.map(item => {
        const orderItem = {
          product_id: item.id,
          quantity: item.count,
          price: item.price
        }
        
        // 如果商品有选项，添加options字段
        if (item.selectedOptions && item.selectedOptions.length > 0 && item.option_categories) {
          orderItem.options = []
          
          // 遍历已选择的选项
          item.selectedOptions.forEach(selected => {
            // 查找对应的选项分类
            const category = item.option_categories.find(cat => cat.name === selected.category)
            if (category) {
              // 遍历该分类下已选择的选项
              selected.options.forEach(optionName => {
                // 查找选项ID
                const optionDetail = category.options.find(opt => opt.name === optionName)
                if (optionDetail) {
                  orderItem.options.push({
                    category_id: category.id,
                    option_id: optionDetail.id
                  })
                }
              })
            }
          })
        }
        
        return orderItem
      })
    }

    // 发送单个订单创建请求
    const response = await createOrder(orderData)
    
    if (response.status === 200) {
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
  
  let cartItemIndex = -1;
  
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
    cartItemIndex = existingIndex;
  } else { // 不存在则添加
    // 为购物车商品添加唯一标识符
    const cartItem = {
      ...product,
      basePrice: product.price,
      count: product.count || 1,
      cartItemId: productKey // 添加唯一标识符
    };
    
    cartItems.value.push(cartItem);
    cartItemIndex = cartItems.value.length - 1;
  }
  
  // 同步到商品列表（仅当购物车项仍然存在时）
  const productIndex = products.value.findIndex(p => p.id === product.id)
  if (productIndex > -1 && cartItemIndex < cartItems.value.length) {
    // 对于带选项的商品，我们需要计算该商品在购物车中的总数量
    if (product.selectedOptions && product.selectedOptions.length > 0) {
      const totalProductCount = cartItems.value
        .filter(item => item.id === product.id)
        .reduce((sum, item) => sum + item.count, 0);
      
      products.value[productIndex].count = totalProductCount;
      products.value[productIndex].lastCount = totalProductCount;
    } else if (cartItemIndex >= 0) {
      // 对于不带选项的商品，直接使用购物车中该商品的数量
      // 确保购物车项仍然存在再访问其count属性
      const cartItem = cartItems.value[cartItemIndex];
      if (cartItem) {
        products.value[productIndex].count = cartItem.count;
        products.value[productIndex].lastCount = cartItem.count;
      }
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

const handleShowProductOptions = (product) => {
  selectedProduct.value = product
  showOptionsPopup.value = true
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
    count: productQuantity.value
  }

  addToCart(productWithOptions)
  showOptionsPopup.value = false
  // 重置数量为1
  productQuantity.value = 1
  // 清除选项状态
  selectedOptions.value = new Map()
}

const handleRemoveItem = (id) => {
  // 从购物车移除
  // 如果id包含选项信息，则使用cartItemId进行匹配
  if (typeof id === 'string' && id.includes('-')) {
    // 这是一个带选项的商品ID
    cartItems.value = cartItems.value.filter(item => item.cartItemId !== id)
  } else {
    // 这是一个普通商品ID
    cartItems.value = cartItems.value.filter(item => item.id !== id)
  }
  
  // 重新计算商品列表中的计数器
  recalculateProductCounts()
}

// 修改计数器更新方法
const handleCountChange = (id, count) => {
  // 查找购物车中的商品索引
  let cartIndex = -1;
  let productId = id;
  if (typeof id === 'string' && id.includes('-')) {
    // 这是一个带选项的商品ID
    cartIndex = cartItems.value.findIndex(item => item.cartItemId === id)
    // 获取原始商品ID
    if (cartIndex > -1) {
      productId = cartItems.value[cartIndex].id;
    }
  } else {
    // 这是一个普通商品ID
    cartIndex = cartItems.value.findIndex(item => item.id === id)
  }
  
  if (cartIndex > -1) {
    // 更新购物车中的数量
    cartItems.value[cartIndex].count = count
    
    // 重新计算商品列表中的计数器
    recalculateProductCounts()
    
    // 如果数量为0，从购物车中移除
    if (count === 0) {
      handleRemoveItem(id)
    }
  }
}

// 修改直接更新计数器的方法
const handleCountUpdate = (id, newCount) => {
  // 查找购物车中的商品索引
  let cartIndex = -1;
  let productId = id;
  if (typeof id === 'string' && id.includes('-')) {
    // 这是一个带选项的商品ID
    cartIndex = cartItems.value.findIndex(item => item.cartItemId === id)
    // 获取原始商品ID
    if (cartIndex > -1) {
      productId = cartItems.value[cartIndex].id;
    }
  } else {
    // 这是一个普通商品ID
    cartIndex = cartItems.value.findIndex(item => item.id === id)
  }
  
  if (cartIndex > -1) {
    // 同步到商品列表
    const productIndex = products.value.findIndex(p => p.id === productId)
    if (productIndex > -1) {
      if (typeof id !== 'string' || !id.includes('-')) {
        // 普通商品直接同步数量
        products.value[productIndex].count = Math.max(0, newCount)
        products.value[productIndex].lastCount = Math.max(0, newCount)
      } else {
        // 带选项的商品需要计算该商品在购物车中的总数量
        const totalProductCount = cartItems.value
          .filter(item => item.id === productId)
          .reduce((sum, item) => {
            // 如果是正在修改的商品，使用新数量；否则使用原数量
            if (item.cartItemId === id) {
              return sum + Math.max(0, newCount);
            }
            return sum + item.count;
          }, 0);
        
        products.value[productIndex].count = totalProductCount;
        products.value[productIndex].lastCount = totalProductCount;
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

// 重新计算商品列表中的计数器
const recalculateProductCounts = () => {
  // 重置所有商品的计数器
  products.value.forEach(product => {
    product.count = 0
    product.lastCount = 0
  })
  
  // 重新计算每个商品的总数量
  cartItems.value.forEach(item => {
    const productIndex = products.value.findIndex(p => p.id === item.id)
    if (productIndex > -1) {
      products.value[productIndex].count += item.count
      products.value[productIndex].lastCount += item.count
    }
  })
}

const handleClearCart = () => {
  // 清空所有商品的计数器
  products.value.forEach(product => {
    product.count = 0
    product.lastCount = 0
  })
  
  // 清空购物车
  cartItems.value = []
  
  // 重置购物车弹窗状态
  showCartPopup.value = false
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
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-default);
  border-radius: var(--radius-sm);
  margin: 4px;
  transition: all var(--transition-base);
  cursor: pointer;
}

.option-item:hover {
  border-color: var(--primary-blue-light);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.selected {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
  background: linear-gradient(135deg,
    rgba(30, 64, 175, 0.08) 0%,
    rgba(249, 115, 22, 0.05) 100%
  );
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.order-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  overflow: hidden;
  position: relative;
}

.content-container {
  display: flex;
  height: calc(100vh - 96px);
  margin-top: 46px;
  overflow: hidden;
}

.category-menu {
  width: 80px;
  flex-shrink: 0;
  background: var(--bg-muted);
  overflow-y: auto;
  height: 100%;
}

.product-container {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  padding: 12px;
  background: var(--bg-primary);
}

/* 确保购物车在Tabbar之上 */
:deep(.cart-bar) {
  bottom: 50px;
}

.popup-content {
  padding: 16px;
}
</style>

<style scoped>
.footer-actions {
  position: fixed;
  bottom: 0;
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  z-index: var(--z-fixed);
  width: inherit;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  box-shadow: var(--shadow-float);
}

.price-display {
  font-size: 18px;
  font-weight: bold;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-label {
  font-size: 14px;
  color: var(--text-primary);
}

.price-quantity-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-container :deep(.van-button) {
  background: var(--gradient-primary);
  border: none;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.button-container :deep(.van-button):hover {
  background: var(--gradient-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.button-container :deep(.van-button):active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
</style>
