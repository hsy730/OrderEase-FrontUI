import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Order/index.vue')
  }
  // {
  //   path: '/orders',
  //   name: 'Orders',
  //   component: () => import('../views/Orders.vue')
  // },
  // {
  //   path: '/mine',
  //   name: 'Mine',
  //   component: () => import('../views/Mine.vue')
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 