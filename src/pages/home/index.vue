<template>
  <view class="order-page">
    <view class="content-container">
      <view class="category-menu">
        <category-list
          :categories="shopDetail?.tags || []"
          :active-category="activeCategory"
          @select="handleCategorySelect"
        />
      </view>

      <view class="product-container">
        <product-list
          :products="products"
          @add-to-cart="handleAddToCart"
          @show-cart-popup="handleShowCartPopup"
          @show-product-options="handleShowProductOptions"
        />
      </view>
    </view>

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

    <uni-popup ref="popup" type="bottom" :safe-area="false">
      <view class="popup-content">
        <view class="popup-header">{{ selectedProduct?.name }}</view>
        <view class="popup-body">
          <view v-if="selectedProduct" v-for="category in selectedProduct.option_categories || []" :key="category.id" class="category-section">
            <view class="category-title">{{ category.name }}<text v-if="category.is_required" class="required">*</text></view>
            <view class="options-container">
              <view 
                v-for="option in category.options"
                :key="option.id"
                class="option-item"
                :class="{ 'selected': isOptionSelected(category, option) }"
                @click="toggleOption(category, option)"
              >
                {{ option.name }}
                <text v-if="option.price_adjustment > 0">+¥{{ option.price_adjustment }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="footer-actions">
          <view class="price-quantity-container">
            <view class="price-display">
              ¥{{ (selectedProduct?.price || 0) + optionTotal }}
            </view>
            <view class="quantity-control" v-if="selectedProduct">
              <uni-number-box 
                v-model="productQuantity"
                :min="1"
                :max="99"
              />
            </view>
          </view>
          <view class="button-container">
            <button class="confirm-btn" @click="confirmSelection">加入购物车</button>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getShopDetail, getTagBoundProducts, createOrder } from '@/api'
import CategoryList from '@/components/CategoryList.vue'
import ProductList from '@/components/ProductList.vue'
import ShoppingCart from '@/components/ShoppingCart.vue'

const shopDetail = ref(null)

const selectedProduct = ref(null)
const popup = ref(null)
const productQuantity = ref(1)

onMounted(async () => {
  try {
    const { data: shopRes } = await getShopDetail()
    
    if (shopRes) {
      if (shopRes.tags==null) {
        shopRes.tags = [];
      }
      shopRes.tags.push({id: -1, name: "未分类"})
      shopDetail.value = shopRes;
      error.value = ''
      
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

const products = ref([])

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
    uni.showToast({
      title: '购物车为空',
      icon: 'none'
    })
    return
  }

  try {
    const orderData = {
      user_id: parseInt(uni.getStorageSync('userId')),
      items: cartItems.value.map(item => {
        const orderItem = {
          product_id: item.id,
          quantity: item.count,
          price: item.price
        }
        
        if (item.selectedOptions && item.selectedOptions.length > 0 && item.option_categories) {
          orderItem.options = []
          
          item.selectedOptions.forEach(selected => {
            const category = item.option_categories.find(cat => cat.name === selected.category)
            if (category) {
              selected.options.forEach(optionName => {
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

    const response = await createOrder(orderData)
    
    if (response.status === 200) {
      uni.showToast({ title: '订单创建成功', icon: 'success' })
      cartItems.value = []
      uni.switchTab({
        url: '/pages/orders/index'
      })
    } else {
      throw new Error(response.data.error || '订单创建失败')
    }
  } catch (error) {
    console.error('订单提交失败:', error)
    uni.showToast({
      title: error.message || '订单提交失败',
      icon: 'none'
    })
  }
}

const addToCart = (product) => {
  const getCartItemKey = (item) => {
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      const sortedOptions = [...item.selectedOptions].sort((a, b) => 
        a.category.localeCompare(b.category)
      );
      return `${item.id}-${JSON.stringify(sortedOptions)}`;
    }
    return `${item.id}`;
  };

  const productKey = getCartItemKey(product);
  
  let cartItemIndex = -1;
  
  const existingIndex = cartItems.value.findIndex(item => 
    getCartItemKey(item) === productKey
  );

  if (existingIndex > -1) {
    if (product.action === 'add') {
      cartItems.value[existingIndex].count += product.count;
    } else {
      cartItems.value[existingIndex].count = Math.max(0, cartItems.value[existingIndex].count - product.count);
    }
    
    if (cartItems.value[existingIndex].count === 0) {
      handleRemoveItem(product.id)
    }
    cartItemIndex = existingIndex;
  } else {
    const cartItem = {
      ...product,
      basePrice: product.price,
      count: product.count || 1,
      cartItemId: productKey
    };
    
    cartItems.value.push(cartItem);
    cartItemIndex = cartItems.value.length - 1;
  }
  
  const productIndex = products.value.findIndex(p => p.id === product.id)
  if (productIndex > -1 && cartItemIndex < cartItems.value.length) {
    if (product.selectedOptions && product.selectedOptions.length > 0) {
      const totalProductCount = cartItems.value
        .filter(item => item.id === product.id)
        .reduce((sum, item) => sum + item.count, 0);
      
      products.value[productIndex].count = totalProductCount;
      products.value[productIndex].lastCount = totalProductCount;
    } else if (cartItemIndex >= 0) {
      const cartItem = cartItems.value[cartItemIndex];
      if (cartItem) {
        products.value[productIndex].count = cartItem.count;
        products.value[productIndex].lastCount = cartItem.count;
      }
    }
  }
}

const handleAddToCart = (product) => {
  if (product.option_categories?.length) {
    if (product.action === 'add') {
      selectedProduct.value = product
      popup.value.open()
    } else {
      showCartPopup.value = true
      uni.showToast({
        title: '请在购物车中移除定制商品',
        icon: 'none'
      })
    }
  } else {
    addToCart({ ...product, count: 1 })
  }
}

const handleShowCartPopup = (product) => {
  showCartPopup.value = true
  uni.showToast({
    title: '请在购物车中移除定制商品',
    icon: 'none'
  })
}

const handleShowProductOptions = (product) => {
  selectedProduct.value = product
  popup.value.open()
}

const confirmSelection = () => {
  if (!selectedProduct.value) return

  const finalPrice = selectedProduct.value.price + optionTotal.value

  const productWithOptions = {
    ...selectedProduct.value,
    finalPrice: finalPrice,
    price: finalPrice,
    selectedOptions: Array.from(selectedOptions.value).map(([categoryId, opts]) => ({
      category: selectedProduct.value.option_categories.find(c => c.id === categoryId)?.name,
      options: opts.map(o => o.name)
    })),
    count: productQuantity.value
  }

  addToCart(productWithOptions)
  popup.value.close()
  productQuantity.value = 1
  selectedOptions.value = new Map()
}

const handleRemoveItem = (id) => {
  if (typeof id === 'string' && id.includes('-')) {
    cartItems.value = cartItems.value.filter(item => item.cartItemId !== id)
  } else {
    cartItems.value = cartItems.value.filter(item => item.id !== id)
  }
  
  recalculateProductCounts()
}

const handleCountChange = (id, count) => {
  let cartIndex = -1;
  let productId = id;
  if (typeof id === 'string' && id.includes('-')) {
    cartIndex = cartItems.value.findIndex(item => item.cartItemId === id)
    if (cartIndex > -1) {
      productId = cartItems.value[cartIndex].id;
    }
  } else {
    cartIndex = cartItems.value.findIndex(item => item.id === id)
  }
  
  if (cartIndex > -1) {
    cartItems.value[cartIndex].count = count
    recalculateProductCounts()
    
    if (count === 0) {
      handleRemoveItem(id)
    }
  }
}

const handleCountUpdate = (id, newCount) => {
  let cartIndex = -1;
  let productId = id;
  if (typeof id === 'string' && id.includes('-')) {
    cartIndex = cartItems.value.findIndex(item => item.cartItemId === id)
    if (cartIndex > -1) {
      productId = cartItems.value[cartIndex].id;
    }
  } else {
    cartIndex = cartItems.value.findIndex(item => item.id === id)
  }
  
  if (cartIndex > -1) {
    const productIndex = products.value.findIndex(p => p.id === productId)
    if (productIndex > -1) {
      if (typeof id !== 'string' || !id.includes('-')) {
        products.value[productIndex].count = Math.max(0, newCount)
        products.value[productIndex].lastCount = Math.max(0, newCount)
      } else {
        const totalProductCount = cartItems.value
          .filter(item => item.id === productId)
          .reduce((sum, item) => {
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
      handleRemoveItem(id)
    }
  }
}

const recalculateProductCounts = () => {
  products.value.forEach(product => {
    product.count = 0
    product.lastCount = 0
  })
  
  cartItems.value.forEach(item => {
    const productIndex = products.value.findIndex(p => p.id === item.id)
    if (productIndex > -1) {
      products.value[productIndex].count += item.count
      products.value[productIndex].lastCount += item.count
    }
  })
}

const handleClearCart = () => {
  products.value.forEach(product => {
    product.count = 0
    product.lastCount = 0
  })
  
  cartItems.value = []
  showCartPopup.value = false
}

const selectedOptions = ref(new Map())

const optionTotal = computed(() => {
  return Array.from(selectedOptions.value.values())
    .flat()
    .reduce((sum, opt) => sum + (opt.price_adjustment || 0), 0)
})

const toggleOption = (category, option) => {
  const categoryOptions = selectedOptions.value.get(category.id) || []
  
  if (category.is_required) {
    selectedOptions.value.set(category.id, [option])
  } else {
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
.order-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  overflow: hidden;
  position: relative;
}

.content-container {
  display: flex;
  height: calc(100vh - 96px);
  margin-top: 44px;
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

.popup-content {
  background: var(--bg-primary);
  border-radius: 16px 16px 0 0;
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.popup-header {
  text-align: left;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.popup-body {
  max-height: 40vh;
  overflow-y: auto;
}

.category-section {
  margin-top: 10px;
}

.category-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.required {
  color: red;
}

.options-container {
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
}

.option-item.selected {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
  background: linear-gradient(135deg,
    rgba(30, 64, 175, 0.08) 0%,
    rgba(249, 115, 22, 0.05) 100%
  );
}

.footer-actions {
  position: sticky;
  bottom: 0;
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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

.price-quantity-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-container {
  width: 100%;
}

.confirm-btn {
  width: 100%;
  height: 44px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 600;
}

.cart-bar {
  bottom: 50px;
}
</style>
