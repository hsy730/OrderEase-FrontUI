<template>
  <div class="register-container">
    <!-- 导航栏 -->
    <CommonNavBar title="用户注册" :show-back="true" />
    
    <div class="register-content">
      <!-- 注册表单 -->
      <div class="register-form">
        <h2 class="register-title">创建账号</h2>
        
        <van-form @submit="handleRegister">
          <!-- 用户名输入 -->
          <van-cell-group>
            <van-field
              v-model="form.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名（2-20位）"
              :rules="rules.username"
            />
          </van-cell-group>

          <!-- 密码输入 -->
          <van-cell-group>
            <van-field
              v-model="form.password"
              name="password"
              label="密码"
              placeholder="请输入密码（6位字母或数字）"
              :rules="rules.password"
              type="password"
            />
          </van-cell-group>

          <!-- 确认密码 -->
          <van-cell-group>
            <van-field
              v-model="form.confirmPassword"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              :rules="rules.confirmPassword"
              type="password"
            />
          </van-cell-group>

          <!-- 注册按钮 -->
          <div style="margin: 16px;">
            <van-button 
              round 
              block 
              type="primary"
              native-type="submit"
              :loading="loading"
              loading-text="注册中..."
            >
              注册
            </van-button>
          </div>
        </van-form>

        <!-- 登录链接 -->
        <div class="login-link">
          <span>已有账号？</span>
          <span class="link" @click="goToLogin">立即登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showFailToast } from 'vant'
import CommonNavBar from '@/components/CommonNavBar.vue'
import { userRegister } from '@/api'

const router = useRouter()

// 表单数据
const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 2, max: 20, message: '用户名长度2-20位' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { pattern: /^[a-zA-Z0-9]{6}$/, message: '密码必须为6位字母或数字' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    { 
      validator: (value) => value === form.value.password, 
      message: '两次密码输入不一致' 
    }
  ]
}

// 注册状态
const loading = ref(false)

// 注册方法
const handleRegister = async () => {
  try {
    loading.value = true
    
    // 调用注册API
    const response = await userRegister({
      username: form.value.username,
      password: form.value.password
    })
    
    if (response.data && response.data.message === '注册成功') {
      showToast('注册成功')
      
      // 跳转到登录页面
      router.push('/login')
    } else {
      showFailToast(response.data?.error || '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', error)
    if (error.response?.data?.error) {
      showFailToast(error.response.data.error)
    } else {
      showFailToast('网络错误，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
}

.register-content {
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 46px);
}

.register-form {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 30px 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(30, 64, 175, 0.2);
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: var(--text-secondary);
}

.link {
  color: var(--primary-blue);
  margin-left: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: color var(--transition-base);
}

.link:hover {
  color: var(--primary-blue-light);
  text-decoration: underline;
}

/* 表单样式调整 */
:deep(.van-cell-group) {
  margin-bottom: 20px;
  background: transparent;
}

:deep(.van-field) {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all var(--transition-base);
}

:deep(.van-field:focus-within) {
  border-color: var(--primary-blue);
  background: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.15);
}

/* 注册按钮 */
:deep(.van-button--primary) {
  background: var(--gradient-primary);
  border: none;
  height: 48px;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

:deep(.van-button--primary:hover) {
  background: var(--gradient-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
</style>