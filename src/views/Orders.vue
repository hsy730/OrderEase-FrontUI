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
        :thumb="order.items[0]?.image"
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
import { ref } from 'vue'

const orders = ref([
  {
    id: 1,
    orderNo: '202403090001',
    createTime: '2024-03-09 12:30',
    status: '待取餐',
    totalAmount: 76,
    items: [
      {
        name: '菌菇清汤',
        price: 38,
        quantity: 2,
        image: '/food1.jpg'
      }
    ]
  }
])

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