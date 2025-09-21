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
      path: '/orders',
      name: 'Orders',
      component: () => import('../views/Orders.vue')
    },
    {
      path: '/mine',
      name: 'Mine',
      component: () => import('../views/Mine.vue')
    }
  ]
})

// 全局前置守卫，用于解析URL中的shopId参数
router.beforeEach((to, from, next) => {
  // 检查URL参数
  const shopId = to.query.shop_id;
  const userId = to.query.user_id;
  
  if (shopId) {
    localStorage.setItem('shop_id', shopId);
  }
  if (userId) {
    localStorage.setItem('user_id', userId);
  }
  next();
});

export default router