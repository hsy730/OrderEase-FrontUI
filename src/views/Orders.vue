<template>
    <div class="orders-page">
      <van-nav-bar
        title="中关村店"
        fixed
        placeholder
      />
      
      <div class="orders-list p-4">
        <van-card
          v-for="order in orders"
          :key="order.id"
          :price="order.totalAmount"
          :title="order.orderNo"
          :desc="order.createTime"
          :thumb="getImageUrl(order.items[0]?.image)"
        >
          <template #tags>
            <van-tag :type="getStatusType(order.status)">{{ order.status }}</van-tag>
          </template>
          <template #footer>
            <div class="text-sm text-gray-500">
              共{{ order.items.length }}件商品
            </div>
          </template>
        </van-card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getOrders } from '@/api'
  import { getImageUrl } from '@/utils/image'
  
  const orders = ref([])
  
  onMounted(async () => {
    try {
      const response = await getOrders({
        user_id: localStorage.getItem('userId'), // 假设用户ID存储在本地存储
        page: 1,
        page_size: 50
      })
      
      if (response.data && response.data.code === 200) {
        orders.value = response.data.data.map(order => ({
          id: order.id,
          orderNo: order.id, // 使用接口返回的订单ID
          createTime: new Date().toLocaleString(), // 需要根据接口实际字段调整
          status: order.status,
          totalAmount: order.total_price,
          items: [{
            name: order.product_name,
            price: order.total_price,
            quantity: 1, // 需要根据接口实际数据调整
            image: order.image_url || '' // 添加图片URL字段
          }]
        }))
      }
    } catch (error) {
      console.error('获取订单失败:', error)
      orders.value = []
    }
  })
  
  const getStatusType = (status) => {
    const typeMap = {
      '待取餐': 'warning',
      '已完成': 'success',
      '已取消': 'danger'
    }
    return typeMap[status] || 'default'
  }
  </script>
  
  <style scoped>
  .orders-page {
    min-height: 100vh;
    background: #f7f8fa;
    padding-bottom: 50px;
  }
  
  :deep(.van-card) {
    background: #fff;
    margin-bottom: 12px;
    border-radius: 8px;
  }
  </style>