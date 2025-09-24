<template>
    <div class="orders-page">
      <div class="orders-list p-4" ref="ordersListRef" @scroll="handleScroll">
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
            <!-- <div class="text-sm text-gray-500">
              共{{ order.items.length }}件商品
            </div> -->
            <div class="order-actions" style="margin-top: 10px;">
              <van-button 
                size="small" 
                type="text"
                style="color: #1989fa; background: transparent; border: none; padding: 0; --van-button-active-background: transparent"
                @click="viewOrderDetail(order)">详情</van-button>
            </div>
          </template>
        </van-card>
        
        <!-- 加载更多提示 -->
        <div v-if="loadingMore" class="loading-more">
          <van-loading size="24px">加载中...</van-loading>
        </div>
        
        <!-- 没有更多数据提示 -->
        <div v-if="noMoreData" class="no-more-data">
          没有更多订单了
        </div>
      </div>
      
      <!-- 订单详情弹窗 -->
      <van-popup v-model:show="showDetailPopup" position="bottom" round style="height: 80%; padding: 20px;">
        <div class="order-detail">
          <h2 style="text-align: center; margin-bottom: 20px;">订单详情</h2>
          <div v-if="selectedOrder" class="order-info">
            <van-cell-group>
              <van-cell title="订单号" :value="selectedOrder.id" />
              <van-cell title="下单时间" :value="formatDate(selectedOrder.created_at)" />
              <van-cell title="订单状态">
                <template #value>
                  <van-tag :type="getStatusType(selectedOrder.status)">{{ selectedOrder.status }}</van-tag>
                </template>
              </van-cell>
              <van-cell title="总计" :value="`¥${selectedOrder.total_price}`" />
            </van-cell-group>
            
            <h3 style="margin: 20px 0 10px;">商品列表</h3>
            <van-card
              v-for="(item, index) in selectedOrder.items"
              :key="index"
              :price="item.total_price"
              :title="item.name || item.product_name"
              :thumb="getImageUrl(item.image || item.product_image_url)"
            >
              <template #num>
                <span>数量: {{ item.quantity }}</span>
              </template>
              <template #desc>
                <div v-if="item.options && item.options.length > 0">
                  <!-- 按category_id分组选项 -->
                  <div v-for="(options, categoryId) in groupOptionsByCategory(item.options)" :key="categoryId" style="font-size: 12px; color: #666;">
                    {{ options[0].category_name }}: {{ options.map(opt => opt.option_name).join(', ') }}
                    <!-- 显示该分类下所有选项的价格调整总和 -->
                    <!-- <span v-if="getCategoryPriceAdjustment(options) > 0" style="color: #ee0a24;">(+¥{{ getCategoryPriceAdjustment(options) }})</span> -->
                  </div>
                </div>
              </template>
            </van-card>
          </div>
        </div>
      </van-popup>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getOrders, getOrderDetail } from '@/api'
  import { getImageUrl } from '@/utils/image'
  import { showLoadingToast, showFailToast } from 'vant'
  
  const orders = ref([])
  const showDetailPopup = ref(false)
  const selectedOrder = ref(null)
  const ordersListRef = ref(null)
  
  // 分页相关状态
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loadingMore = ref(false)
  const noMoreData = ref(false)
  const isLoading = ref(false)
  
  // 初始化加载订单
  const loadOrders = async (page = 1) => {
    if (isLoading.value) return
    isLoading.value = true
    
    try {
      const response = await getOrders({
        user_id: localStorage.getItem('user_id'),
        page: page,
        pageSize: pageSize.value
      })
      
      if (response.data && response.data.code === 200) {
        const newOrders = response.data.data.map(order => ({
          id: order.id,
          orderNo: order.id,
          createTime: formatDate(order.created_at),
          status: order.status,
          totalAmount: order.total_price,
          items: order.items || [{
            name: order.product_name,
            price: order.total_price,
            quantity: 1,
            image: order.image_url || ''
          }]
        }))
        
        // 如果是第一页，替换数据；否则追加数据
        if (page === 1) {
          orders.value = newOrders
        } else {
          orders.value = [...orders.value, ...newOrders]
        }
        
        // 检查是否还有更多数据
        if (newOrders.length < pageSize.value) {
          noMoreData.value = true
        }
        
        // 更新当前页码
        currentPage.value = page
      }
    } catch (error) {
      console.error('获取订单失败:', error)
      if (page === 1) {
        orders.value = []
      }
      showFailToast('获取订单失败')
    } finally {
      isLoading.value = false
      loadingMore.value = false
    }
  }
  
  // 首次加载
  onMounted(async () => {
    await loadOrders(1)
  })
  
  // 滚动事件处理
  const handleScroll = () => {
    if (!ordersListRef.value || loadingMore.value || noMoreData.value) return
    
    const { scrollTop, scrollHeight, clientHeight } = ordersListRef.value
    // 当滚动到底部时加载更多
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadMore()
    }
  }
  
  // 加载更多订单
  const loadMore = () => {
    if (loadingMore.value || noMoreData.value) return
    
    loadingMore.value = true
    const nextPage = currentPage.value + 1
    loadOrders(nextPage)
  }
  
  const getStatusType = (status) => {
    const typeMap = {
      '待取餐': 'warning',
      '已完成': 'success',
      '已取消': 'danger'
    }
    return typeMap[status] || 'default'
  }
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }
  
  // 查看订单详情
  const viewOrderDetail = async (order) => {
    // 显示加载提示
    const loadingToast = showLoadingToast('加载中...')
    
    try {
      // 调用API获取订单详情
      const response = await getOrderDetail(order.id)
      
      if (response.data && response.status === 200) {
        // 设置选中的订单详情
        selectedOrder.value = response.data
        showDetailPopup.value = true
      } else {
        showFailToast('获取订单详情失败')
      }
    } catch (error) {
      console.error('获取订单详情失败:', error)
      showFailToast('获取订单详情失败')
    } finally {
      // 关闭加载提示
      loadingToast.close()
    }
  }
  
  // 按分类ID对选项进行分组
  const groupOptionsByCategory = (options) => {
    const grouped = {}
    options.forEach(option => {
      if (!grouped[option.category_id]) {
        grouped[option.category_id] = []
      }
      grouped[option.category_id].push(option)
    })
    return grouped
  }
  
  // 计算同一分类下所有选项的价格调整总和
  const getCategoryPriceAdjustment = (options) => {
    return options.reduce((sum, option) => sum + (option.price_adjustment || 0), 0)
  }
  </script>
  
  <style scoped>
  .orders-page {
    min-height: calc(100vh - 50px);
    background: #f7f8fa;
    padding-bottom: 50px;
  }
  
  :deep(.van-card) {
    background: #fff;
    margin-bottom: 12px;
    border-radius: 8px;
  }
  
  .order-detail {
    height: 100%;
    overflow-y: auto;
  }
  
  .order-info {
    margin-top: 20px;
  }
  
  .loading-more, .no-more-data {
    text-align: center;
    padding: 16px;
    color: #999;
  }
  
  .orders-list {
    height: calc(100vh - 50px);
    overflow-y: auto;
  }
  </style>