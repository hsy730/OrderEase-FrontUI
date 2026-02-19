<template>
  <view class="order-page">
    <!-- 左侧分类菜单 -->
    <scroll-view class="category-menu" scroll-y>
      <view
        v-for="category in shopDetail?.tags || []"
        :key="category.id"
        class="category-item"
        :class="{ active: activeCategory === category.id }"
        @click="handleCategorySelect(category)"
      >
        <text class="category-text">{{ category.name }}</text>
      </view>
    </scroll-view>

    <!-- 右侧商品列表 -->
    <scroll-view class="product-container" scroll-y>
      <!-- 商品列表 -->
      <view class="product-list">
        <view v-if="products.length === 0" class="empty-tip">
          <text class="empty-text">该分类下暂无商品</text>
        </view>
        <view v-for="product in products" :key="product.id" class="product-item">
          <image
            v-if="product.image"
            :src="getImageUrl(product.image)"
            class="product-image"
            mode="aspectFill"
          />
          <view v-else class="image-placeholder">
            <text>暂无图片</text>
          </view>

          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <view class="product-details">
              <text class="product-price">¥{{ product.price }}</text>
              <view class="stepper-container">
                <!-- 有选项的商品：始终显示"选规格"按钮 + 数量气泡 -->
                <view v-if="product.option_categories?.length" class="spec-wrapper">
                  <view
                    v-if="product.count > 0"
                    class="badge"
                  >
                    {{ product.count }}
                  </view>
                  <view class="spec-button" @click="handleShowOptions(product)">
                    选规格
                  </view>
                </view>
                <!-- 无选项的商品：显示计数器 -->
                <view v-else class="stepper">
                  <view
                    v-if="product.count > 0"
                    class="stepper-btn minus"
                    @click="handleStepperChange(product, -1)"
                  >
                    -
                  </view>
                  <view v-if="product.count > 0" class="stepper-input">
                    {{ product.count }}
                  </view>
                  <view class="stepper-btn plus" @click="handleStepperChange(product, 1)">
                    +
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部购物车 -->
    <view v-if="cartItems.length > 0" class="cart-bar">
      <!-- 遮罩层 -->
      <view v-if="showCartPopup" class="overlay" @click="toggleCartList"></view>

      <!-- 购物车列表 -->
      <view v-if="showCartPopup" class="cart-list">
        <view class="cart-list-header">
          <text class="header-title">已选商品</text>
          <view class="clear-cart" @click="handleClearCart">
            <text class="clear-text">清空</text>
          </view>
        </view>
        <scroll-view class="cart-scroll" scroll-y>
          <view
            v-for="(item, index) in cartItems"
            :key="index"
            class="cart-item"
          >
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text v-if="item.selectedOptions && item.selectedOptions.length" class="options">
                {{ item.selectedOptions.map(o => o.options.join(', ')).join(', ') }}
              </text>
              <text class="item-price">¥{{ (item.finalPrice || item.price || 0).toFixed(2) }}</text>
            </view>
            <view class="controls">
              <view class="stepper">
                <view
                  class="stepper-btn minus"
                  @click="handleCountChange(item.cartItemId || item.id, -1)"
                >
                  -
                </view>
                <view class="stepper-input">{{ item.count }}</view>
                <view
                  class="stepper-btn plus"
                  @click="handleCountChange(item.cartItemId || item.id, 1)"
                >
                  +
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 购物车信息栏 -->
      <view class="cart-info" @click="toggleCartList">
        <view class="cart-icon-wrapper">
          <view v-if="totalCount > 0" class="cart-badge">{{ totalCount }}</view>
          <text class="cart-icon">🛍️</text>
        </view>
        <view class="price-info">
          <text class="symbol">¥</text>
          <text class="amount">{{ totalAmount.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-btn" @click="handleSubmitOrder">
        <text class="submit-text">选好了</text>
      </view>
    </view>

    <!-- 商品选项弹窗 -->
    <view v-if="showOptionsPopup" class="popup-mask" catchtouchmove="false">
      <view class="popup-bottom">
        <view class="popup-header">
          <text class="popup-title">{{ selectedProduct.name }}</text>
        </view>
        <scroll-view class="popup-content" scroll-y>
          <view
            v-for="category in selectedProduct.option_categories || []"
            :key="category.id"
            class="option-category"
          >
            <view class="category-title">
              <text>{{ category.name }}</text>
              <text v-if="category.is_required" class="required">*</text>
            </view>
            <view class="options-wrapper">
              <view
                v-for="option in category.options"
                :key="option.id"
                class="option-item"
                :class="{ selected: isOptionSelected(category, option) }"
                @click="toggleOption(category, option)"
              >
                <text>{{ option.name }}</text>
                <text v-if="option.price_adjustment > 0" class="price-adjust">+¥{{ option.price_adjustment }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="footer-actions">
          <view v-if="errorMessage" class="error-message">{{ errorMessage }}</view>
          <view class="left-section">
            <text class="price-display">
              ¥{{ (selectedProduct.price || 0) + optionTotal }}
            </text>
            <view class="stepper">
              <view class="stepper-btn minus" @click="changeQuantity(-1)">-</view>
              <view class="stepper-input">{{ productQuantity }}</view>
              <view class="stepper-btn plus" @click="changeQuantity(1)">+</view>
            </view>
          </view>
          <view class="add-cart-btn" @click="confirmSelection">
            加入福袋
          </view>
        </view>
        <view class="close-btn" @click="closeOptionsPopup">×</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getShopDetail, getTagBoundProducts, createOrder } from '@/utils/api'
import { getImageUrl } from '@/utils/image'

const shopDetail = ref(null)
const products = ref([])
const activeCategory = ref(null)
const cartItems = ref([])
const showCartPopup = ref(false)

// 商品选项弹窗相关
const selectedProduct = ref(null)
const showOptionsPopup = ref(false)
const productQuantity = ref(1)
const selectedOptions = ref(new Map())
const errorMessage = ref('')

onMounted(async () => {
  try {
    const { data: shopRes } = await getShopDetail()
    if (shopRes) {
      if (!shopRes.tags) {
        shopRes.tags = []
      }
      shopRes.tags.push({ id: -1, name: '未分类' })
      shopDetail.value = shopRes

      if (shopRes.tags.length > 0) {
        activeCategory.value = shopRes.tags[0].id
        await handleCategorySelect(shopRes.tags[0])
      }
    }
  } catch (error) {
    console.error('店铺数据加载失败:', error)
  }
})

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
        lastCount: 0,
        option_categories: p.option_categories || []
      }))
      return
    }
    products.value = []
  } catch (error) {
    console.error('获取商品失败:', error)
    products.value = []
  }
}

// 选中选项价格总计
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
    const newOptions = [...categoryOptions]
    if (index > -1) {
      newOptions.splice(index, 1)
    } else {
      newOptions.push(option)
    }
    selectedOptions.value.set(category.id, newOptions)
  }
}

const isOptionSelected = (category, option) => {
  const categoryOptions = selectedOptions.value.get(category.id) || []
  return categoryOptions.some(opt => opt.id === option.id)
}

const handleShowOptions = (product) => {
  product.action = 'add'
  selectedProduct.value = product
  selectedOptions.value = new Map()
  productQuantity.value = 1
  errorMessage.value = ''
  showOptionsPopup.value = true
}

const closeOptionsPopup = () => {
  showOptionsPopup.value = false
  errorMessage.value = ''
}

const changeQuantity = (delta) => {
  productQuantity.value = Math.max(1, productQuantity.value + delta)
}

const confirmSelection = () => {
  if (!selectedProduct.value) return

  const requiredCategories = (selectedProduct.value.option_categories || []).filter(c => c.is_required === true || c.is_required === 1)
  for (const category of requiredCategories) {
    const selected = selectedOptions.value.get(category.id)
    if (!selected || selected.length === 0) {
      errorMessage.value = `请选择${category.name}`
      return
    }
  }

  errorMessage.value = ''
  const finalPrice = selectedProduct.value.price + optionTotal.value
  const productWithOptions = {
    ...selectedProduct.value,
    finalPrice: finalPrice,
    price: finalPrice,
    selectedOptions: Array.from(selectedOptions.value).map(([categoryId, opts]) => ({
      category: selectedProduct.value.option_categories.find(c => c.id === categoryId)?.name,
      options: opts.map(o => o.name)
    })),
    count: productQuantity.value,
    cartItemId: `${selectedProduct.value.id}-${JSON.stringify(
      Array.from(selectedOptions.value).map(([_, opts]) => opts.map(o => ({ id: o.id }))).sort()
    )}`
  }

  addToCart(productWithOptions)
  showOptionsPopup.value = false
  productQuantity.value = 1
  selectedOptions.value = new Map()
  uni.showToast({ title: '已加入福袋', icon: 'success' })
}

const addToCart = (product) => {
  const productKey = product.cartItemId || `${product.id}`

  const existingIndex = cartItems.value.findIndex(
    item => (item.cartItemId || `${item.id}`) === productKey
  )

  if (existingIndex > -1) {
    cartItems.value[existingIndex].count += product.count || 1
  } else {
    cartItems.value.push({
      ...product,
      count: product.count || 1,
      cartItemId: productKey
    })
  }

  // 同步到商品列表
  const productIndex = products.value.findIndex(p => p.id === product.id)
  if (productIndex > -1) {
    if (product.selectedOptions && product.selectedOptions.length > 0) {
      const totalProductCount = cartItems.value
        .filter(item => item.id === product.id)
        .reduce((sum, item) => sum + item.count, 0)
      products.value[productIndex].count = totalProductCount
      products.value[productIndex].lastCount = totalProductCount
    } else {
      products.value[productIndex].count = cartItems.value[existingIndex]?.count || product.count || 1
      products.value[productIndex].lastCount = products.value[productIndex].count
    }
  }
}

const handleStepperChange = (product, delta) => {
  const productKey = `${product.id}`
  const existingIndex = cartItems.value.findIndex(
    item => (item.cartItemId || `${item.id}`) === productKey
  )

  let newCount
  if (existingIndex > -1) {
    newCount = cartItems.value[existingIndex].count + delta
  } else {
    newCount = delta
  }

  if (newCount <= 0) {
    if (existingIndex > -1) {
      cartItems.value.splice(existingIndex, 1)
    }
    product.count = 0
    product.lastCount = 0
  } else {
    if (existingIndex > -1) {
      cartItems.value[existingIndex].count = newCount
    } else {
      cartItems.value.push({
        ...product,
        count: newCount,
        cartItemId: productKey
      })
    }
    product.count = newCount
    product.lastCount = newCount
  }
}

const handleCountChange = (id, delta) => {
  const cartIndex = cartItems.value.findIndex(
    item => (item.cartItemId || `${item.id}`) === `${id}`
  )

  if (cartIndex > -1) {
    const newCount = Math.max(0, cartItems.value[cartIndex].count + delta)
    const productId = cartItems.value[cartIndex].id

    // 同步到商品列表
    const productIndex = products.value.findIndex(p => p.id === productId)
    if (productIndex > -1) {
      const totalProductCount = cartItems.value
        .filter(item => item.id === productId && (item.cartItemId || `${item.id}`) !== `${id}`)
        .reduce((sum, item) => sum + item.count, 0) + newCount
      products.value[productIndex].count = totalProductCount
      products.value[productIndex].lastCount = totalProductCount
    }

    if (newCount > 0) {
      cartItems.value[cartIndex].count = newCount
    } else {
      cartItems.value.splice(cartIndex, 1)
    }

    // 如果购物车为空，隐藏弹窗
    if (cartItems.value.length === 0) {
      showCartPopup.value = false
    }
  }
}

const toggleCartList = () => {
  showCartPopup.value = !showCartPopup.value
}

const handleClearCart = () => {
  // 先关闭购物车弹窗，再显示确认弹窗
  showCartPopup.value = false
  uni.showModal({
    title: '确认',
    content: '确定清空福袋吗?',
    success: (res) => {
      if (res.confirm) {
        cartItems.value = []
        products.value.forEach(p => {
          p.count = 0
          p.lastCount = 0
        })
      }
    }
  })
}

const totalCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.count, 0)
})

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const price = item.finalPrice || item.price || 0
    return sum + price * item.count
  }, 0)
})

const handleSubmitOrder = async () => {
  if (cartItems.value.length === 0) {
    uni.showToast({ title: '福袋为空', icon: 'none' })
    return
  }

  try {
    const orderData = {
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
      products.value.forEach(p => {
        p.count = 0
        p.lastCount = 0
      })
      uni.redirectTo({ url: '/pages/orders/orders' })
    } else {
      uni.showToast({ title: response.data.error || '订单创建失败', icon: 'none' })
    }
  } catch (error) {
    console.error('订单提交失败:', error)
    uni.showToast({ title: '订单提交失败', icon: 'none' })
  }
}
</script>

<style scoped>
.order-page {
  height: 100vh;
  display: flex;
  flex-direction: row;
  background: #F8FAFC;
}

/* 左侧分类菜单 */
.category-menu {
  width: 160rpx;
  background: #FDFDFD;
  height: 100vh;
}

.category-item {
  padding: 24rpx 16rpx;
  text-align: center;
  border-bottom: 1rpx solid #E2E8F0;
  transition: all 0.25s;
  position: relative;
}

.category-item.active {
  background: #F0F7FF;
}

.category-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6rpx;
  background: linear-gradient(180deg, #1E40AF 0%, #3B82F6 100%);
  border-radius: 0 4rpx 4rpx 0;
}

.category-item.active .category-text {
  color: #1E40AF;
  font-weight: bold;
}

.category-text {
  font-size: 26rpx;
  color: #475569;
}

.product-container {
  flex: 1;
  height: 100vh;
  padding: 24rpx;
  overflow-y: auto;
}

.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #94A3B8;
}

.product-item {
  display: flex;
  margin-bottom: 24rpx;
  background: #FFFFFF;
  padding: 16rpx;
  border-radius: 16rpx;
  border: 1rpx solid #E2E8F0;
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
}

.image-placeholder {
  width: 120rpx;
  height: 120rpx;
  background: #F8FAFC;
  border: 2rpx dashed #F97316;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F97316;
  font-size: 24rpx;
}

.product-info {
  margin-left: 24rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #0F172A;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  color: #EA580C;
  font-size: 32rpx;
  font-weight: bold;
}

/* 计数器 */
.stepper {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stepper-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
}

.stepper-btn.plus {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
}

.stepper-btn.minus {
  background: #FFFFFF;
  color: #1E40AF;
  border: 1rpx solid #1E40AF;
}

.stepper-input {
  width: 48rpx;
  text-align: center;
  font-size: 26rpx;
  color: #0F172A;
}

/* 选规格按钮 */
.spec-wrapper {
  position: relative;
}

.spec-button {
  min-width: 96rpx;
  height: 56rpx;
  padding: 0 24rpx;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
  border-radius: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #F97316;
  color: #FFFFFF;
  border-radius: 20rpx;
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  font-weight: bold;
  min-width: 32rpx;
  text-align: center;
}

/* 购物车栏 */
.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #FFFFFF;
  border-top: 1rpx solid #E2E8F0;
  display: flex;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 8rpx 32rpx rgba(30, 64, 175, 0.15);
}

.cart-info {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  gap: 24rpx;
}

.cart-icon-wrapper {
  position: relative;
}

.cart-icon {
  font-size: 48rpx;
}

.cart-badge {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  background: #F97316;
  color: #FFFFFF;
  border-radius: 24rpx;
  padding: 4rpx 16rpx;
  font-size: 20rpx;
  font-weight: bold;
  min-width: 36rpx;
  text-align: center;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price-info .symbol {
  font-size: 24rpx;
  color: #475569;
}

.price-info .amount {
  font-size: 40rpx;
  font-weight: bold;
  color: #EA580C;
}

.submit-btn {
  width: 240rpx;
  height: 80rpx;
  margin: 10rpx 16rpx;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(30, 64, 175, 0.3);
}

.submit-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
}

/* 购物车弹窗 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 200rpx);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.cart-list {
  position: absolute;
  bottom: 100rpx;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  max-height: 80vh;
  overflow: hidden;
  z-index: 1000;
}

.cart-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background-color: #F8FAFC;
  border-bottom: 1rpx solid #E2E8F0;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #0F172A;
}

.clear-cart {
  padding: 8rpx 16rpx;
}

.clear-text {
  font-size: 28rpx;
  color: #EF4444;
}

.cart-scroll {
  max-height: 60vh;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #E2E8F0;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 8rpx;
}

.options {
  font-size: 24rpx;
  color: #94A3B8;
  margin-bottom: 8rpx;
}

.item-price {
  font-size: 28rpx;
  font-weight: bold;
  color: #EA580C;
}

.controls {
  display: flex;
  align-items: center;
}

/* 商品选项弹窗 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.popup-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 2001;
}

.popup-header {
  padding: 32rpx;
  text-align: center;
  border-bottom: 1rpx solid #E2E8F0;
}

.popup-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #0F172A;
}

.popup-content {
  max-height: 60vh;
  padding: 32rpx;
}

.option-category {
  margin-bottom: 40rpx;
}

.category-title {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #0F172A;
}

.required {
  color: #EF4444;
  margin-left: 8rpx;
}

.options-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-item {
  padding: 24rpx 32rpx;
  background-color: #F8FAFC;
  border: 2rpx solid #E2E8F0;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.option-item.selected {
  border-color: #1E40AF;
  color: #1E40AF;
  background: rgba(30, 64, 175, 0.08);
}

.price-adjust {
  font-size: 24rpx;
  color: #F97316;
}

.footer-actions {
  position: relative;
  padding: 32rpx;
  border-top: 1rpx solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.price-display {
  font-size: 40rpx;
  font-weight: bold;
  color: #EA580C;
}

.add-cart-btn {
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
  border-radius: 56rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.error-message {
  position: absolute;
  top: -60rpx;
  left: 32rpx;
  right: 32rpx;
  background: #FEF2F2;
  border: 1rpx solid #FECACA;
  color: #DC2626;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 24rpx;
  right: 32rpx;
  font-size: 48rpx;
  color: #94A3B8;
  line-height: 1;
  padding: 8rpx;
}
</style>