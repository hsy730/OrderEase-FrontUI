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
    component: () => import('../views/Order/index.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router