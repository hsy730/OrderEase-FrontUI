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
            />
            <view v-else class="image-placeholder">
              <text>暂无图片</text>
            </view>

            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-details">
                <text class="product-price">¥{{ product.price }}</text>
                <view class="stepper-container">
                  <view v-if="product.option_categories?.length" class="spec-wrapper">
                    <view v-if="product.count > 0" class="badge">{{ product.count }}</view>
                    <view class="spec-button" @click="handleShowOptions(product)">选规格</view>
                  </view>
                  <Stepper
                    v-else
                    v-model="product.count"
                    @change="(e) => handleStepperChange(product, e.delta, $event)"
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
import { ref, computed, onMounted, nextTick } from 'vue'
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

onMounted(async () => {
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
  const touch = event.touches?.[0] || event
  const startX = touch.clientX || event.clientX
  const startY = touch.clientY || event.clientY

  uni.createSelectorQuery()
    .select('.cart-icon-wrapper')
    .boundingClientRect((rect) => {
      if (rect) {
        flyingDot.value = { visible: true, startX, startY, endX: rect.left + rect.width / 2, endY: rect.top + rect.height / 2 }

        setTimeout(() => {
          flyingDot.value.visible = false
          cartBouncing.value = true
          setTimeout(() => { cartBouncing.value = false }, ANIMATION_DURATION.BOUNCE)
        }, ANIMATION_DURATION.FLY)
      }
    })
    .exec()
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

  if (category.is_required) {
    selectedOptionsMap.value.set(category.id, [option])
  } else {
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

        if (btnRect && cartRect) {
          luckyBagBubble.value = {
            visible: true,
            startX: btnRect.left + btnRect.width / 2,
            startY: btnRect.top,
            endX: cartRect.left + cartRect.width / 2,
            endY: cartRect.top + cartRect.height / 2
          }
        }

        addBtnPulsing.value = true

        setTimeout(() => { luckyBagBubble.value.visible = false }, ANIMATION_DURATION.PARABOLA)
        setTimeout(() => { addBtnPulsing.value = false }, ANIMATION_DURATION.FLY)

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
  const finalPrice = selectedProduct.value.price + optionTotal.value
  const productWithOptions = {
    ...selectedProduct.value,
    finalPrice,
    price: finalPrice,
    selectedOptions: Array.from(selectedOptionsMap.value).map(([categoryId, opts]) => ({
      category: selectedProduct.value.option_categories.find(c => c.id === categoryId)?.name,
      options: opts.map(o => o.name)
    })),
    count: productQuantity.value,
    cartItemId: `${selectedProduct.value.id}-${JSON.stringify(
      Array.from(selectedOptionsMap.value).map(([_, opts]) => opts.map(o => ({ id: o.id }))).sort()
    )}`
  }

  addToCart(productWithOptions)

  await nextTick()
  await triggerLuckyBagAnimation()

  setTimeout(() => {
    popupClosing.value = true
    setTimeout(() => {
      showOptionsPopup.value = false
      popupClosing.value = false
      productQuantity.value = 1
      selectedOptionsMap.value = new Map()
    }, ANIMATION_DURATION.FADE)
  }, ANIMATION_DURATION.PARABOLA)

  setTimeout(() => {
    cartBouncing.value = true
    setTimeout(() => { cartBouncing.value = false }, ANIMATION_DURATION.BOUNCE)
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
  if (productIndex > -1) {
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
    if (productIndex > -1) {
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

        if (item.selectedOptions && item.selectedOptions.length > 0 && item.option_categories) {
          orderItem.options = []
          item.selectedOptions.forEach(selected => {
            const category = item.option_categories.find(cat => cat.name === selected.category)
            if (category) {
              selected.options.forEach(optionName => {
                const optionDetail = category.options.find(opt => opt.name === optionName)
                if (optionDetail) {
                  orderItem.options.push({ category_id: category.id, option_id: optionDetail.id })
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
      showSuccess(TOAST_MESSAGES.ORDER_SUCCESS)
      cartItems.value = []
      products.value.forEach(p => { p.count = 0; p.lastCount = 0 })
      uni.redirectTo({ url: ROUTES.ORDERS })
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
  min-width: 32rpx;
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
