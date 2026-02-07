import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])

  const totalCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.count, 0)
  })

  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (item.finalPrice * item.count), 0)
  })

  const addToCart = (product) => {
    const existingItem = cartItems.value.find(item => item.cartItemId === product.cartItemId)
    if (existingItem) {
      existingItem.count += product.count
    } else {
      cartItems.value.push(product)
    }
  }

  const removeFromCart = (cartItemId) => {
    cartItems.value = cartItems.value.filter(item => item.cartItemId !== cartItemId)
  }

  const updateQuantity = (cartItemId, newCount) => {
    const item = cartItems.value.find(item => item.cartItemId === cartItemId)
    if (item) {
      item.count = newCount
      if (newCount <= 0) {
        removeFromCart(cartItemId)
      }
    }
  }

  const clearCart = () => {
    cartItems.value = []
  }

  const loadCartFromLocal = () => {
    const cartData = uni.getStorageSync('cart_data')
    if (cartData) {
      try {
        cartItems.value = JSON.parse(cartData)
      } catch (e) {
        console.error('加载购物车失败:', e)
      }
    }
  }

  const saveCartToLocal = () => {
    try {
      uni.setStorageSync('cart_data', JSON.stringify(cartItems.value))
    } catch (e) {
      console.error('保存购物车失败:', e)
    }
  }

  return {
    cartItems,
    totalCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCartFromLocal,
    saveCartToLocal
  }
})
