import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const orderDetail = ref(null)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const noMoreData = ref(false)

  const setOrders = (newOrders) => {
    orders.value = newOrders
  }

  const appendOrders = (newOrders) => {
    orders.value = [...orders.value, ...newOrders]
  }

  const setOrderDetail = (detail) => {
    orderDetail.value = detail
  }

  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  const setCurrentPage = (page) => {
    currentPage.value = page
  }

  const setNoMoreData = (noMore) => {
    noMoreData.value = noMore
  }

  const resetOrders = () => {
    orders.value = []
    currentPage.value = 1
    noMoreData.value = false
  }

  const getOrderStatusText = (status) => {
    const statusMap = {
      'pending': '待支付',
      'paid': '已支付',
      'preparing': '制作中',
      'ready': '待取餐',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知状态'
  }

  const getStatusIcon = (status) => {
    const iconMap = {
      'pending': '⏰',
      'paid': '💰',
      'preparing': '👨‍🍳',
      'ready': '📦',
      'completed': '✅',
      'cancelled': '❌'
    }
    return iconMap[status] || '📋'
  }

  return {
    orders,
    orderDetail,
    loading,
    currentPage,
    pageSize,
    noMoreData,
    setOrders,
    appendOrders,
    setOrderDetail,
    setLoading,
    setCurrentPage,
    setNoMoreData,
    resetOrders,
    getOrderStatusText,
    getStatusIcon
  }
})
