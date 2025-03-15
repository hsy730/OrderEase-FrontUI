import { createRouter, createWebHistory } from 'vue-router'

// 添加home路由配置（如果尚未存在）
const routes = [
  {
    path: '/',
    redirect: '/home' // 添加根路径重定向
  },
  { // 添加/order-ease-iui/home路由配置
    path: '/order-ease-iui/home',
    name: 'OrderEaseHome',
    component: () => import('../views/home/index.vue')
  },
  { // 添加/order-ease-iui/orders路由配置
    path: '/order-ease-iui/orders',
    name: 'OrderEaseOrders',
    component: () => import('../views/Orders.vue')
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('../views/Mine.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router