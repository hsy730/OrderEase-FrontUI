import { createRouter, createWebHistory } from 'vue-router'

// 修改路由配置
const router = createRouter({
  history: createWebHistory('/order-ease-iui/'), // 设置基础路径
  routes: [
    {
      path: '/', // 匹配部署路径根目录
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'Home',
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
})

export default router