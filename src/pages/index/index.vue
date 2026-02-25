<template>
  <view class="order-page">
    <HeaderBar />

    <view class="content-wrapper">
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

      <scroll-view class="product-container" scroll-y>
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
              lazy-load="true"
              :show-menu-by-longpress="false"
            />
            <view v-else class="image-placeholder">
              <text>暂无图片</text>
            </view>

            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-details">
                <text class="product-price">¥{{ formatPrice(product.price) }}</text>
                <view class="stepper-container">
                  <view v-if="product.option_categories?.length" class="spec-wrapper">
                    <view v-if="product.count > 0" class="badge">{{ product.count }}</view>
                    <view class="spec-button" @click="handleShowOptions(product)">选规格</view>
                  </view>
                  <Stepper
                    v-else
                    v-model="product.count"
                    @change="(e) => handleStepperChange(product, e.delta, e.event)"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <CartBar
      v-if="cartItems.length > 0"
      :count="totalCount"
      :amount="totalAmount"
      :bouncing="cartBouncing"
      @toggle="toggleCartList"
      @submit="handleSubmitOrder"
    />

    <CartPopup
      :visible="showCartPopup"
      :items="cartItems"
      @close="toggleCartList"
      @clear="handleClearCart"
      @change="handleCartChange"
    />

    <view v-if="flyingDot.visible" class="flying-dot" :style="flyingDotStyle"></view>

    <OptionsPopup
      :visible="showOptionsPopup"
      :closing="popupClosing"
      :product="selectedProduct"
      :quantity="productQuantity"
      :selected-options="selectedOptionsMap"
      :option-total="optionTotal"
      :error-message="errorMessage"
      :pulsing="addBtnPulsing"
      :bubble="luckyBagBubble"
      @close="closeOptionsPopup"
      @select="handleOptionSelect"
      @quantity="changeQuantity"
      @confirm="confirmSelection"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { getShopDetail, getTagBoundProducts, createOrder } from '@/utils/api'
import { getImageUrl } from '@/utils/image'
import { showError, showSuccess, showConfirm } from '@/utils/errorHandler'
import {
  ANIMATION_DURATION,
  PAGINATION,
  TOAST_MESSAGES,
  ERROR_MESSAGES,
  ROUTES
} from '@/utils/constants'
import HeaderBar from '@/components/HeaderBar.vue'
import Stepper from '@/components/Stepper.vue'
import CartBar from '@/components/CartBar.vue'
import CartPopup from '@/components/CartPopup.vue'
import OptionsPopup from '@/components/OptionsPopup.vue'

// 格式化价格，处理浮点精度
const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00'
  return parseFloat(price).toFixed(2)
}

const shopDetail = ref(null)
const products = ref([])
const activeCategory = ref(null)
const cartItems = ref([])
const showCartPopup = ref(false)
const cartBouncing = ref(false)

const flyingDot = ref({ visible: false, startX: 0, startY: 0, endX: 0, endY: 0 })

const luckyBagBubble = ref({ visible: false, startX: 0, startY: 0, endX: 0, endY: 0 })
const addBtnPulsing = ref(false)
const popupClosing = ref(false)

const selectedProduct = ref(null)
const showOptionsPopup = ref(false)
const productQuantity = ref(1)
const selectedOptionsMap = ref(new Map())
const errorMessage = ref('')

// 定时器管理
const timers = []

// 购物车图标位置缓存
const cartIconRect = ref(null)

const safeTimeout = (fn, delay) => {
  const timer = setTimeout(fn, delay)
  timers.push(timer)
  return timer
}

const flyingDotStyle = computed(() => ({
  left: `${flyingDot.value.startX}px`,
  top: `${flyingDot.value.startY}px`,
  '--fly-x': `${flyingDot.value.endX - flyingDot.value.startX}px`,
  '--fly-y': `${flyingDot.value.endY - flyingDot.value.startY}px`
}))

const totalCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.count, 0))

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const price = item.finalPrice || item.price || 0
    return sum + price * item.count
  }, 0)
})

const optionTotal = computed(() => {
  return Array.from(selectedOptionsMap.value.values())
    .flat()
    .reduce((sum, opt) => sum + (opt.price_adjustment || 0), 0)
})

// 更新购物车图标位置
const updateCartIconRect = () => {
  if (cartIconRect.value) return
  uni.createSelectorQuery()
    .select('.cart-icon-wrapper')
    .boundingClientRect((rect) => {
      if (rect) cartIconRect.value = rect
    })
    .exec()
}

onMounted(async () => {
  // 延迟更新购物车图标位置，确保 DOM 已渲染
  safeTimeout(() => {
    nextTick(updateCartIconRect)
  }, 100)

  try {
    const { data: shopRes } = await getShopDetail()
    if (shopRes) {
      if (!shopRes.tags) shopRes.tags = []
      shopRes.tags.push({ id: -1, name: '未分类' })
      shopDetail.value = shopRes

      if (shopRes.tags.length > 0) {
        activeCategory.value = shopRes.tags[0].id
        await handleCategorySelect(shopRes.tags[0])
      }
    }
  } catch (error) {
    showError(ERROR_MESSAGES.SHOP_LOAD_FAILED)
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer))
  timers.length = 0
})

const handleCategorySelect = async (category) => {
  activeCategory.value = category.id
  try {
    const response = await getTagBoundProducts({
      tag_id: category.id,
      page: PAGINATION.DEFAULT_PAGE,
      pageSize: PAGINATION.PRODUCTS_PAGE_SIZE
    })

    if (response.status === 200) {
      products.value = response.data.data.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url,
        description: product.description,
        count: cartItems.value.find(item => item.id === product.id)?.count || 0,
        lastCount: 0,
        option_categories: (product.option_categories || []).map(cat => ({
          ...cat,
          options: [...(cat.options || [])].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        }))
      }))
      return
    }
    products.value = []
  } catch (error) {
    showError(ERROR_MESSAGES.PRODUCTS_LOAD_FAILED)
    products.value = []
  }
}

const triggerFlyAnimation = (event) => {
  if (!event) return

  let startX, startY

  if (event.touches && event.touches.length > 0) {
    startX = event.touches[0].clientX
    startY = event.touches[0].clientY
  } else if (event.clientX !== undefined) {
    startX = event.clientX
    startY = event.clientY
  } else if (event.detail && event.detail.x !== undefined) {
    startX = event.detail.x
    startY = event.detail.y
  } else {
    return
  }

  const doAnimation = (endX, endY) => {
    flyingDot.value = { visible: true, startX, startY, endX, endY }

    safeTimeout(() => {
      flyingDot.value.visible = false
      cartBouncing.value = true
      safeTimeout(() => { cartBouncing.value = false }, ANIMATION_DURATION.BOUNCE)
    }, ANIMATION_DURATION.FLY)
  }

  if (cartIconRect.value) {
    doAnimation(
      cartIconRect.value.left + cartIconRect.value.width / 2,
      cartIconRect.value.top + cartIconRect.value.height / 2
    )
  } else {
    uni.createSelectorQuery()
      .select('.cart-icon-wrapper')
      .boundingClientRect((rect) => {
        if (rect) {
          cartIconRect.value = rect
          doAnimation(rect.left + rect.width / 2, rect.top + rect.height / 2)
        } else {
          doAnimation(startX, startY + 200)
        }
      })
      .exec()
  }
}

const handleStepperChange = (product, delta, event) => {
  const productKey = `${product.id}`
  const existingIndex = cartItems.value.findIndex(item => (item.cartItemId || `${item.id}`) === productKey)

  const newCount = existingIndex > -1 ? cartItems.value[existingIndex].count + delta : delta

  if (newCount <= 0) {
    if (existingIndex > -1) cartItems.value.splice(existingIndex, 1)
    product.count = 0
    product.lastCount = 0
  } else {
    if (existingIndex > -1) {
      cartItems.value[existingIndex].count = newCount
    } else {
      cartItems.value.push({ ...product, count: newCount, cartItemId: productKey })
    }
    product.count = newCount
    product.lastCount = newCount
  }

  if (delta > 0 && event) {
    nextTick(() => triggerFlyAnimation(event))
  }
}

const handleShowOptions = (product) => {
  product.action = 'add'
  selectedProduct.value = product
  selectedOptionsMap.value = new Map()
  productQuantity.value = 1
  errorMessage.value = ''
  showOptionsPopup.value = true
}

const closeOptionsPopup = () => {
  showOptionsPopup.value = false
  errorMessage.value = ''
}

const handleOptionSelect = ({ category, option }) => {
  const categoryOptions = selectedOptionsMap.value.get(category.id) || []
  // is_multiple: false 表示单选, true 表示多选
  const isSingleSelect = !category.is_multiple

  if (isSingleSelect) {
    // 单选模式：点击已选中的则取消选择，否则替换为新的选择
    const isAlreadySelected = categoryOptions.some(o => o.id === option.id)
    if (isAlreadySelected) {
      // 取消选择
      selectedOptionsMap.value.set(category.id, [])
    } else {
      // 选择新的选项（替换之前的）
      selectedOptionsMap.value.set(category.id, [option])
    }
  } else {
    // 多选模式：切换选择状态
    const index = categoryOptions.findIndex(o => o.id === option.id)
    const newOptions = [...categoryOptions]
    if (index > -1) {
      newOptions.splice(index, 1)
    } else {
      newOptions.push(option)
    }
    selectedOptionsMap.value.set(category.id, newOptions)
  }
}

const changeQuantity = (delta) => {
  productQuantity.value = Math.max(1, productQuantity.value + delta)
}

// 生成稳定的选项哈希
const generateStableOptionsHash = (selectedOptionsMap) => {
  // 稳定的排序和序列化
  const sortedOptions = Array.from(selectedOptionsMap)
    .map(([catId, opts]) => ({
      category_id: Number(catId),
      option_ids: opts.map(o => o.id).sort((a, b) => a - b)
    }))
    .sort((a, b) => a.category_id - b.category_id)

  return JSON.stringify(sortedOptions)
}

const triggerLuckyBagAnimation = () => {
  return new Promise((resolve) => {
    uni.createSelectorQuery()
      .select('.add-cart-btn')
      .boundingClientRect()
      .select('.cart-icon-wrapper')
      .boundingClientRect()
      .exec((rects) => {
        const btnRect = rects[0]
        const cartRect = rects[1]

        if (btnRect) {
          const endX = cartRect ? cartRect.left + cartRect.width / 2 : btnRect.left
          const endY = cartRect ? cartRect.top + cartRect.height / 2 : btnRect.top + 200

          luckyBagBubble.value = {
            visible: true,
            startX: btnRect.left + btnRect.width / 2,
            startY: btnRect.top,
            endX,
            endY
          }
        }

        addBtnPulsing.value = true

        safeTimeout(() => { luckyBagBubble.value.visible = false }, ANIMATION_DURATION.PARABOLA)
        safeTimeout(() => { addBtnPulsing.value = false }, ANIMATION_DURATION.FLY)

        resolve()
      })
  })
}

const confirmSelection = async () => {
  if (!selectedProduct.value) return

  const requiredCategories = (selectedProduct.value.option_categories || []).filter(c => c.is_required === true || c.is_required === 1)
  for (const category of requiredCategories) {
    const selected = selectedOptionsMap.value.get(category.id)
    if (!selected || selected.length === 0) {
      errorMessage.value = `请选择${category.name}`
      return
    }
  }

  errorMessage.value = ''
  // 修复浮点数精度问题
  const finalPrice = parseFloat((selectedProduct.value.price + optionTotal.value).toFixed(2))

  // 存储完整的选项信息（包括 id，而非仅名称）
  const selectedOptionsData = Array.from(selectedOptionsMap.value).map(([categoryId, opts]) => {
    const category = selectedProduct.value.option_categories.find(c => c.id === categoryId)
    return {
      category: category?.name,
      category_id: category?.id,
      options: opts.map(o => ({ name: o.name, id: o.id }))
    }
  })

  const productWithOptions = {
    ...selectedProduct.value,
    finalPrice,
    price: finalPrice,
    selectedOptions: selectedOptionsData,
    count: productQuantity.value,
    // 使用稳定的哈希算法
    cartItemId: `${selectedProduct.value.id}-${generateStableOptionsHash(selectedOptionsMap.value)}`
  }

  addToCart(productWithOptions)

  await nextTick()
  safeTimeout(() => {
    triggerLuckyBagAnimation()
  }, 50)

  safeTimeout(() => {
    popupClosing.value = true
    safeTimeout(() => {
      showOptionsPopup.value = false
      popupClosing.value = false
      productQuantity.value = 1
      selectedOptionsMap.value = new Map()
    }, ANIMATION_DURATION.FADE)
  }, ANIMATION_DURATION.PARABOLA)

  safeTimeout(() => {
    cartBouncing.value = true
    safeTimeout(() => { cartBouncing.value = false }, ANIMATION_DURATION.BOUNCE)
  }, ANIMATION_DURATION.PARABOLA)

  showSuccess(TOAST_MESSAGES.CART_ADDED)
}

const addToCart = (product) => {
  const productKey = product.cartItemId || `${product.id}`
  const existingIndex = cartItems.value.findIndex(item => (item.cartItemId || `${item.id}`) === productKey)

  if (existingIndex > -1) {
    cartItems.value[existingIndex].count += product.count || 1
  } else {
    cartItems.value.push({ ...product, count: product.count || 1, cartItemId: productKey })
  }

  const productIndex = products.value.findIndex(p => p.id === product.id)
  // 安全检查：确保 productIndex 有效
  if (productIndex >= 0 && productIndex < products.value.length) {
    if (product.selectedOptions && product.selectedOptions.length > 0) {
      const totalProductCount = cartItems.value.filter(item => item.id === product.id).reduce((sum, item) => sum + item.count, 0)
      products.value[productIndex].count = totalProductCount
      products.value[productIndex].lastCount = totalProductCount
    } else {
      products.value[productIndex].count = cartItems.value[existingIndex]?.count || product.count || 1
      products.value[productIndex].lastCount = products.value[productIndex].count
    }
  }
}

const toggleCartList = () => {
  showCartPopup.value = !showCartPopup.value
}

const handleClearCart = async () => {
  showCartPopup.value = false
  const confirmed = await showConfirm('确认', '确定清空福袋吗?')
  if (confirmed) {
    cartItems.value = []
    products.value.forEach(p => { p.count = 0; p.lastCount = 0 })
  }
}

const handleCartChange = ({ item, delta }) => {
  const cartIndex = cartItems.value.findIndex(i => (i.cartItemId || `${i.id}`) === `${item.cartItemId || item.id}`)

  if (cartIndex > -1) {
    const newCount = Math.max(0, cartItems.value[cartIndex].count + delta)
    const productId = cartItems.value[cartIndex].id

    const productIndex = products.value.findIndex(p => p.id === productId)
    // 安全检查：确保 productIndex 有效
    if (productIndex >= 0 && productIndex < products.value.length) {
      const totalProductCount = cartItems.value
        .filter(i => i.id === productId && (i.cartItemId || `${i.id}`) !== `${item.cartItemId || item.id}`)
        .reduce((sum, i) => sum + i.count, 0) + newCount
      products.value[productIndex].count = totalProductCount
      products.value[productIndex].lastCount = totalProductCount
    }

    if (newCount > 0) {
      cartItems.value[cartIndex].count = newCount
    } else {
      cartItems.value.splice(cartIndex, 1)
    }

    if (cartItems.value.length === 0) {
      showCartPopup.value = false
    }
  }
}

const handleSubmitOrder = async () => {
  if (cartItems.value.length === 0) {
    showError(TOAST_MESSAGES.CART_EMPTY)
    return
  }

  try {
    const orderData = {
      items: cartItems.value.map(item => {
        const orderItem = { product_id: item.id, quantity: item.count, price: item.price }

        // 使用存储的完整选项信息（category_id 和 option_id）
        if (item.selectedOptions && item.selectedOptions.length > 0) {
          orderItem.options = []
          item.selectedOptions.forEach(selected => {
            selected.options.forEach(optionData => {
              if (selected.category_id && optionData.id) {
                orderItem.options.push({ category_id: selected.category_id, option_id: optionData.id })
              }
            })
          })
        }
        return orderItem
      })
    }

    const response = await createOrder(orderData)

    if (response.status === 200) {
      showSuccess(TOAST_MESSAGES.ORDER_SUCCESS)
      cartItems.value = []
      products.value.forEach(p => { p.count = 0; p.lastCount = 0 })
      uni.switchTab({ url: ROUTES.ORDERS })
    } else {
      showError(response.data.error || '订单创建失败')
    }
  } catch (error) {
    showError('订单提交失败')
  }
}
</script>

<style scoped>
.order-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
}

.category-menu {
  width: 160rpx;
  background: #FDFDFD;
  height: 100%;
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

.content-wrapper {
  display: flex;
  flex: 1;
  height: calc(100vh - 88rpx);
  margin-top: 88rpx;
}

.product-container {
  flex: 1;
  height: 100%;
  padding: 24rpx;
  overflow-y: auto;
}

.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.empty-text {
  color: #94A3B8;
  font-size: 28rpx;
}

.product-list {
  padding-bottom: 120rpx;
}

.product-item {
  display: flex;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #E2E8F0;
  box-shadow: 0 2rpx 16rpx rgba(45, 52, 54, 0.08);
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.image-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
  font-size: 24rpx;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.product-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.stepper-container {
  display: flex;
  align-items: center;
}

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
  min-width: 32raring;
  text-align: center;
}

.flying-dot {
  position: fixed;
  width: 24rpx;
  height: 24rpx;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 3000;
  animation: flyToCart 0.5s ease-in-out forwards;
}

@keyframes flyToCart {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--fly-x), var(--fly-y)) scale(0.3);
  }
}
</style>
