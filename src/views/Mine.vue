<template>
  <div class="mine-page">
    <!-- 用户信息 -->
    <div v-if="isLoggedIn" class="user-info bg-white p-4 mt-2 flex items-center">
      <van-image
        round
        width="64"
        height="64"
        src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
      />
      <div class="ml-4">
        <div class="text-lg font-bold">{{ userInfo.username || '用户' }}</div>
        <div class="text-sm text-gray-500">手机号: {{ formatPhone(userInfo.phone) }}</div>
      </div>
    </div>

    <!-- 未登录状态 -->
    <div v-else class="login-prompt bg-white p-6 mt-2 text-center">
      <div class="text-lg text-gray-600 mb-4">您还未登录</div>
      <div class="flex gap-3 justify-center">
        <van-button 
          type="primary" 
          size="small"
          @click="goToLogin"
        >
          登录
        </van-button>
        <!-- <van-button 
          type="default" 
          size="small"
          @click="goToRegister"
        >
          注册
        </van-button> -->
      </div>
    </div>

    <!-- 功能列表 -->
    <div class="function-list mt-3">
      <van-cell-group>
        <van-cell 
          v-if="isLoggedIn"
          title="收货地址" 
          is-link 
          icon="location-o" 
        />
        <van-cell 
          v-if="isLoggedIn"
          title="联系电话" 
          is-link 
          icon="phone-o" 
        />
        <van-cell 
          v-if="isLoggedIn"
          title="账户设置" 
          is-link 
          icon="setting-o" 
        />
        <van-cell 
          v-if="isLoggedIn"
          title="退出登录" 
          is-link 
          icon="revoke" 
          @click="logout"
        />
        <van-cell title="关于我们" is-link icon="info-o" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'

const router = useRouter()

// 用户信息
const userInfo = ref({})

// 计算属性：是否已登录
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user_id')
})

// 格式化手机号显示
const formatPhone = (phone) => {
  if (!phone) return '未设置'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 退出登录
const logout = () => {
  showConfirmDialog({
    title: '确认退出',
    message: '您确定要退出登录吗？',
  }).then(() => {
    // 清除用户信息
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_info')
    
    // 重新加载页面
    window.location.reload()
  }).catch(() => {
    // 取消操作
  })
}

// 页面加载时获取用户信息
onMounted(() => {
  if (isLoggedIn.value) {
    const userInfoStr = localStorage.getItem('user_info')
    if (userInfoStr) {
      userInfo.value = JSON.parse(userInfoStr)
    }
  }
})
</script>

<style scoped>
.mine-page {
  min-height: calc(100vh - 50px);
  background: var(--bg-secondary);
  padding-bottom: 50px;
}

/* 用户信息卡片 */
.user-info {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  margin: var(--spacing-md);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.user-info :deep(.van-image) {
  border: 3px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

/* 登录提示卡片 */
.login-prompt {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  margin: var(--spacing-md);
  border: 1px solid var(--border-light);
}

/* 登录按钮 */
.login-prompt :deep(.van-button--primary) {
  background: var(--gradient-primary);
  border: none;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.login-prompt :deep(.van-button--primary:hover) {
  background: var(--gradient-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* 功能列表 */
.function-list {
  margin: var(--spacing-md);
}

.function-list :deep(.van-cell-group) {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
}

.function-list :deep(.van-cell) {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  transition: background var(--transition-fast);
}

.function-list :deep(.van-cell:last-child) {
  border-bottom: none;
}

.function-list :deep(.van-cell:hover) {
  background: var(--bg-secondary);
}

.function-list :deep(.van-cell__left-icon) {
  color: var(--primary-blue);
  font-size: 18px;
}

.function-list :deep(.van-cell__right-icon) {
  color: var(--text-tertiary);
}
</style>