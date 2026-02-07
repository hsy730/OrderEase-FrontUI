<template>
  <view class="home-container">
    <!-- 分类菜单 -->
    <CategoryList
      :categories="categories"
      :active-id="activeCategoryId"
      @category-click="handleCategoryClick"
    />

    <!-- 右侧商品区域 -->
    <view class="product-area">
      <!-- 优惠券横幅 -->
      <CouponBanner
        v-if="coupons.length > 0"
        :coupons="coupons"
        @coupon-click="handleCouponClick"
      />

      <!-- 商品列表 -->
      <scroll-view
        class="product-scroll"
        scroll-y
        @scrolltolower="loadMore"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="products.length === 0 && !loading" class="empty-state">
          <text class="empty-icon">📦</text>
          <text class="empty-text">暂无商品</text>
        </view>

        <view v-else class="product-list">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @click="handleProductClick"
            @add-to-cart="handleAddToCart"
          />
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading-state">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 没有更多数据 -->
        <view v-if="noMoreData && products.length > 0" class="no-more">
          <text>没有更多商品了</text>
        </view>
      </scroll-view>
    </view>

    <!-- 购物车弹窗 -->
    <view v-if="showCart" class="cart-overlay" @click="closeCart">
      <view class="cart-popup" @click.stop>
        <CartList
          :cart-items="cartStore.cartItems"
          @quantity-change="handleQuantityChange"
          @delete="handleDeleteCartItem"
          @checkout="handleCheckout"
        />
      </view>
    </view>

    <!-- 购物车浮动按钮 -->
    <view v-if="cartStore.cartItems.length > 0" class="cart-float-btn" @click="toggleCart">
      <view class="cart-icon">
        <text class="cart-count">{{ cartStore.totalCount }}</text>
      </view>
      <view class="cart-total">
        <text class="total-label">合计：</text>
        <text class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</text>
      </view>
      <view class="cart-action">
        <text>去结算</text>
      </view>
    </view>

    <!-- 商品选项选择弹窗 -->
    <uni-popup ref="optionPopup" type="bottom">
      <view class="option-popup">
        <view class="popup-header">
          <text class="product-name">{{ selectedProduct.name }}</text>
          <text class="close-btn" @click="closeOptionPopup">×</text>
        </view>

        <scroll-view class="option-content" scroll-y>
          <!-- 必选项（单选） -->
          <view
            v-for="category in requiredCategories"
            :key="category.id"
            class="option-category"
          >
            <view class="category-title">
              {{ category.name }}
              <text class="required-mark">*</text>
            </view>
            <view class="option-list">
              <view
                v-for="option in category.options"
                :key="option.id"
                :class="['option-item', { selected: isOptionSelected(category.id, option.id) }]"
                @click="selectRequiredOption(category.id, option)"
              >
                <text class="option-name">{{ option.name }}</text>
                <text v-if="option.price_adjustment > 0" class="option-price">
                  +¥{{ option.price_adjustment }}
                </text>
              </view>
            </view>
          </view>

          <!-- 可选项（多选） -->
          <view
            v-for="category in optionalCategories"
            :key="category.id"
            class="option-category"
          >
            <view class="category-title">
              {{ category.name }}
              <text v-if="category.min_select > 0" class="min-select">
                （至少选择{{ category.min_select }}项）
              </text>
            </view>
            <view class="option-list">
              <view
                v-for="option in category.options"
                :key="option.id"
                :class="['option-item', { selected: isOptionSelected(category.id, option.id) }]"
                @click="toggleOptionalOption(category.id, option)"
              >
                <view class="option-checkbox">
                  <text v-if="isOptionSelected(category.id, option.id)" class="checkbox-icon">✓</text>
                </view>
                <text class="option-name">{{ option.name }}</text>
                <text v-if="option.price_adjustment > 0" class="option-price">
                  +¥{{ option.price_adjustment }}
                </text>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 底部操作栏 -->
        <view class="popup-footer">
          <view class="quantity-control">
            <view class="control-btn" @click="decreaseQuantity">-</view>
            <view class="quantity-value">{{ productQuantity }}</view>
            <view class="control-btn" @click="increaseQuantity">+</view>
          </view>
          <view class="price-info">
            <text class="price">¥{{ totalPrice.toFixed(2) }}</text>
          </view>
          <button class="confirm-btn" @click="confirmAddToCart">加入购物车</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CategoryList from '@/components/CategoryList.vue'
import CouponBanner from '@/components/CouponBanner.vue'
import ProductCard from '@/components/ProductCard.vue'
import CartList from '@/components/CartList.vue'
import { getTagBoundProducts, createOrder } from '@/api'
import { useCartStore } from '@/stores'

const cartStore = useCartStore()

// 分类数据
const categories = ref([
  { id: 1, name: '全部' },
  { id: 2, name: '热销' },
  { id: 3, name: '主食' },
  { id: 4, name: '小食' },
  { id: 5, name: '饮料' },
  { id: 6, name: '甜点' }
])

const activeCategoryId = ref('')

// 商品数据
const products = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const noMoreData = ref(false)
const refreshing = ref(false)

// 优惠券数据
const coupons = ref([
  {
    id: 1,
    amount: 10,
    condition: '满50元可用',
    title: '新人专享券',
    validity: '2026.12.31前有效',
    received: false
  },
  {
    id: 2,
    amount: 20,
    condition: '满100元可用',
    title: '满减优惠券',
    validity: '2026.12.31前有效',
    received: true
  }
])

// 购物车数据（使用 Pinia store）
const showCart = ref(false)

// 商品选项选择
const selectedProduct = ref({})
const productQuantity = ref(1)
const selectedOptions = ref(new Map())
const optionPopup = ref(null)

// 计算属性
const requiredCategories = computed(() => {
  if (!selectedProduct.value?.option_categories) return []
  return selectedProduct.value.option_categories.filter(c => c.is_required)
})

const optionalCategories = computed(() => {
  if (!selectedProduct.value?.option_categories) return []
  return selectedProduct.value.option_categories.filter(c => !c.is_required)
})

const totalCount = computed(() => {
  return cartStore.totalCount
})

const totalPrice = computed(() => {
  const basePrice = selectedProduct.value?.price || 0
  const optionsPrice = Array.from(selectedOptions.value.values())
    .flat()
    .reduce((sum, opt) => sum + (opt.price_adjustment || 0), 0)
  return (basePrice + optionsPrice) * productQuantity.value
})

// 加载商品列表
const loadProducts = async (page = 1) => {
  if (loading.value) return

  try {
    loading.value = true

    const params = {
      tag_id: activeCategoryId.value || '',
      page,
      pageSize: pageSize.value
    }

    const res = await getTagBoundProducts(params)

    if (page === 1) {
      products.value = res.data.data || []
    } else {
      products.value = [...products.value, ...(res.data.data || [])]
    }

    noMoreData.value = (res.data.data || []).length < pageSize.value
  } catch (error) {
    console.error('加载商品失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  currentPage.value = 1
  await loadProducts(1)
  refreshing.value = false
}

// 加载更多
const loadMore = () => {
  if (noMoreData.value || loading.value) return
  currentPage.value++
  loadProducts(currentPage.value)
}

// 分类点击
const handleCategoryClick = (category) => {
  activeCategoryId.value = category.id
  currentPage.value = 1
  products.value = []
  noMoreData.value = false
  loadProducts(1)
}

// 商品点击
const handleProductClick = (product) => {
  // 有选项的打开选项弹窗
  if (product.option_categories && product.option_categories.length > 0) {
    selectedProduct.value = product
    productQuantity.value = 1
    selectedOptions.value.clear()
    optionPopup.value.open()
  }
}

// 添加到购物车
const handleAddToCart = (product) => {
  // 有选项的打开选项弹窗
  if (product.option_categories && product.option_categories.length > 0) {
    selectedProduct.value = product
    productQuantity.value = 1
    selectedOptions.value.clear()
    optionPopup.value.open()
  } else {
    // 没有选项的直接添加
    addToCart(product)
  }
}

// 添加到购物车逻辑
const addToCart = (product) => {
  cartStore.addToCart(product)
}

// 生成购物车项唯一标识
const generateCartItemId = (item) => {
  if (item.selectedOptions && item.selectedOptions.length > 0) {
    const sortedOptions = [...item.selectedOptions].sort((a, b) =>
      a.category.localeCompare(b.category)
    )
    return `${item.id}-${JSON.stringify(sortedOptions)}`
  }
  return `${item.id}`
}

// 切换购物车显示
const toggleCart = () => {
  showCart.value = !showCart.value
}

// 关闭购物车
const closeCart = () => {
  showCart.value = false
}

// 购物车数量变化
const handleQuantityChange = ({ cartItemId, count }) => {
  cartStore.updateQuantity(cartItemId, count)
}

// 删除购物车项
const handleDeleteCartItem = (cartItemId) => {
  cartStore.removeFromCart(cartItemId)
}

// 结算
const handleCheckout = async () => {
  if (cartStore.cartItems.length === 0) {
    uni.showToast({
      title: '购物车是空的',
      icon: 'none'
    })
    return
  }

  try {
    const orderData = {
      items: cartStore.cartItems.map(item => ({
        product_id: item.id,
        quantity: item.count,
        options: item.selectedOptions || []
      })),
      total_price: cartStore.totalPrice
    }

    const res = await createOrder(orderData)

    if (res.data.code === 200) {
      uni.showToast({
        title: '下单成功',
        icon: 'success'
      })

      // 清空购物车
      cartStore.clearCart()
      showCart.value = false

      // 跳转到订单页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/orders/index'
        })
      }, 1500)
    }
  } catch (error) {
    console.error('下单失败:', error)
    uni.showToast({
      title: error.message || '下单失败',
      icon: 'none'
    })
  }
}

// 优惠券点击
const handleCouponClick = (coupon) => {
  console.log('优惠券点击:', coupon)
}

// 必选项选择
const selectRequiredOption = (categoryId, option) => {
  selectedOptions.value.set(categoryId, [option])
}

// 可选项切换
const toggleOptionalOption = (categoryId, option) => {
  const categoryOptions = selectedOptions.value.get(categoryId) || []
  const category = optionalCategories.value.find(c => c.id === categoryId)

  const index = categoryOptions.findIndex(o => o.id === option.id)

  if (index > -1) {
    categoryOptions.splice(index, 1)
  } else {
    const maxSelect = category?.max_select || category?.options?.length
    const currentOptions = selectedOptions.value.get(categoryId) || []

    if (currentOptions.length < maxSelect) {
      categoryOptions.push(option)
    } else {
      uni.showToast({
        title: `最多选择${maxSelect}项`,
        icon: 'none'
      })
      return
    }
  }

  selectedOptions.value.set(categoryId, categoryOptions)
}

// 检查选项是否被选中
const isOptionSelected = (categoryId, optionId) => {
  const categoryOptions = selectedOptions.value.get(categoryId) || []
  return categoryOptions.some(o => o.id === optionId)
}

// 增加数量
const increaseQuantity = () => {
  if (productQuantity.value < 99) {
    productQuantity.value++
  }
}

// 减少数量
const decreaseQuantity = () => {
  if (productQuantity.value > 1) {
    productQuantity.value--
  }
}

// 验证选项选择
const validateOptions = () => {
  // 检查必选项
  for (const category of requiredCategories.value) {
    if (!selectedOptions.value.has(category.id)) {
      uni.showToast({
        title: `请选择${category.name}`,
        icon: 'none'
      })
      return false
    }
  }

  // 检查可选项的最少选择数
  for (const category of optionalCategories.value) {
    if (category.min_select > 0) {
      const selectedCount = (selectedOptions.value.get(category.id) || []).length
      if (selectedCount < category.min_select) {
        uni.showToast({
          title: `${category.name}至少选择${category.min_select}项`,
          icon: 'none'
        })
        return false
      }
    }
  }

  return true
}

// 确认添加到购物车
const confirmAddToCart = () => {
  if (!validateOptions()) return

  const productWithOptions = {
    ...selectedProduct.value,
    finalPrice: totalPrice.value / productQuantity.value,
    price: totalPrice.value / productQuantity.value,
    selectedOptions: Array.from(selectedOptions.value.entries()).map(([categoryId, opts]) => ({
      category: requiredCategories.value.find(c => c.id === categoryId)?.name ||
                optionalCategories.value.find(c => c.id === categoryId)?.name,
      categoryId,
      options: opts.map(o => ({
        id: o.id,
        name: o.name,
        price_adjustment: o.price_adjustment
      }))
    })),
    count: productQuantity.value
  }

  addToCart(productWithOptions)
  closeOptionPopup()
}

// 关闭选项弹窗
const closeOptionPopup = () => {
  productQuantity.value = 1
  selectedOptions.value.clear()
  optionPopup.value.close()
}

// 页面加载
onMounted(() => {
  cartStore.loadCartFromLocal()
  loadProducts(1)
})
</script>

<script>
export default {
  onShareAppMessage() {
    return {
      title: '快来点餐吧',
      path: '/pages/home/index',
      imageUrl: '/static/share-image.png'
    }
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  background: var(--bg-secondary);
}

.product-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.product-scroll {
  flex: 1;
  height: 0;
  overflow-y: auto;
  padding: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.product-list > view {
  width: calc(50% - 8rpx);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid var(--border-light);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 16rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.no-more {
  text-align: center;
  padding: 40rpx 0;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.cart-popup {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
}

.cart-float-btn {
  position: fixed;
  bottom: 32rpx;
  left: 32rpx;
  right: 32rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  box-shadow: var(--shadow-lg);
  z-index: 999;
}

.cart-icon {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-count {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 8rpx;
  background: #f56c6c;
  color: #fff;
  font-size: 20rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.cart-total {
  flex: 1;
  display: flex;
  align-items: baseline;
  margin-left: 24rpx;
}

.total-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.total-price {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
  margin-left: 8rpx;
}

.cart-action {
  padding: 16rpx 32rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 32rpx;
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
}

.option-popup {
  height: 70vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid var(--border-light);
}

.product-name {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-primary);
}

.close-btn {
  font-size: 48rpx;
  color: #999;
  padding: 0 16rpx;
}

.option-content {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx;
}

.option-category {
  margin-bottom: 40rpx;
}

.category-title {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: bold;
  margin-bottom: 20rpx;
}

.required-mark {
  color: #f56c6c;
  margin-left: 4rpx;
}

.min-select {
  font-size: 24rpx;
  color: var(--text-secondary);
  font-weight: normal;
  margin-left: 8rpx;
}

.option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: var(--bg-secondary);
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.option-item.selected {
  background: rgba(30, 64, 175, 0.1);
  border-color: var(--primary-blue);
}

.option-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid var(--border-default);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  transition: all 0.3s;
}

.option-item.selected .option-checkbox {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
}

.checkbox-icon {
  font-size: 24rpx;
  color: #fff;
  line-height: 1;
}

.option-name {
  font-size: 26rpx;
  color: var(--text-primary);
}

.option-price {
  font-size: 24rpx;
  color: #f56c6c;
  margin-left: 8rpx;
}

.popup-footer {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid var(--border-light);
  background: #fff;
}

.quantity-control {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 32rpx;
  overflow: hidden;
}

.control-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: var(--text-primary);
  background: #fff;
  transition: all 0.2s;
}

.control-btn:active {
  background: var(--bg-muted);
}

.quantity-value {
  width: 80rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.price-info {
  flex: 1;
  text-align: center;
}

.price {
  font-size: 40rpx;
  color: #f56c6c;
  font-weight: bold;
}

.confirm-btn {
  margin-left: 24rpx;
  padding: 16rpx 48rpx;
  background: var(--gradient-primary);
  color: #fff;
  border: none;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.confirm-btn:active {
  opacity: 0.9;
}
</style>
