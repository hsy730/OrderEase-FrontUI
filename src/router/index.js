import { createRouter, createWebHistory } from 'vue-router'
import { storage } from '@/store'

// 检查用户是否已登录
const isAuthenticated = () => {
  const token = storage.getItem('token')
  const userInfo = storage.getItem('user_info')
  return !!(token && userInfo)
}

// 需要登录验证的路由列表
const authRequiredRoutes = ['/orders', '/mine']

// 修改路由配置
const router = createRouter({
  history: createWebHistory('/'), // 设置基础路径为根路径
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
      component: () => import('../views/Orders.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/mine',
      name: 'Mine',
      component: () => import('../views/Mine.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/token-login',
      name: 'TokenLogin',
      component: () => import('../views/TokenLogin.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue')
    }
  ]
})

// 全局前置守卫，用于登录验证和解析URL参数
router.beforeEach((to, from, next) => {
  // 检查是否需要登录验证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    // 未登录且访问需要认证的路由，跳转到登录页面
    next({ 
      path: '/login',
      query: { redirect: to.fullPath } // 保存目标路由，登录后跳转回去
    })
    return
  }

  // 如果已登录但访问登录页面，跳转到首页
  if (to.path === '/login' && isAuthenticated()) {
    next('/home')
    return
  }

  // 检查URL参数
  const shopId = to.query.shop_id;
  const userId = to.query.user_id;

  if (shopId) {
    storage.setItem('shop_id', shopId);
  }
  if (userId) {
    storage.setItem('user_id', userId);
  }

  next();
});

export default router