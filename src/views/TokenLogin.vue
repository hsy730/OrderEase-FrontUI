<template>
  <div class="login-container">
    <!-- 导航栏 -->
    <CommonNavBar title="令牌登录" :show-back="true" />
    
    <div class="login-content">
      <!-- 登录表单 -->
      <div class="login-form">
        <!-- 欢迎标题 -->
        <div class="welcome-section">
          <h1 class="welcome-title">欢迎回来</h1>
          <p class="welcome-subtitle">请输入您的登录令牌</p>
        </div>
        
        <van-form @submit="handleTokenLogin">
          <!-- 令牌输入 -->
          <div class="input-group">
            <div class="input-icon">🔑</div>
            <van-field
              v-model="token"
              name="token"
              placeholder="请输入令牌"
              :rules="rules.token"
              class="custom-field"
              type="password"
            />
          </div>

          <!-- 登录按钮 -->
          <div class="button-group">
            <van-button 
              round 
              block 
              type="primary"
              native-type="submit"
              :loading="loading"
              loading-text="登录中..."
              class="login-button"
            >
              登录
            </van-button>
          </div>
        </van-form>

        <!-- 普通登录链接 -->
        <div class="register-section">
          <span class="register-text">使用普通登录？</span>
          <span class="register-link" @click="goToLogin">返回普通登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showFailToast } from 'vant'
import { userLoginByToken } from '@/api'
import CommonNavBar from '@/components/CommonNavBar.vue'

const router = useRouter()

// 令牌数据
const token = ref('')

// 表单验证规则
const rules = {
  token: [
    { required: true, message: '请输入令牌' }
  ]
}

// 登录状态
const loading = ref(false)

// 令牌登录方法
const handleTokenLogin = async () => {
  try {
    loading.value = true
    
    // 调用令牌登录API
    const response = await userLoginByToken({
      token: token.value
    })
    
    if (response.data && response.status === 200) {
      // 存储用户信息和token
      localStorage.setItem('user_id', response.data.user_info.id)
      localStorage.setItem('user_info', JSON.stringify(response.data.user_info))
      localStorage.setItem('token', response.data.token)
      
      showToast('登录成功')
      
      // 跳转到商品列表界面
      router.push('/home')
    } else {
      showFailToast(response.data?.error || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    if (error.response?.data?.error) {
      showFailToast(error.response.data.error)
    } else {
      showFailToast('网络错误，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 跳转到普通登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1989fa 0%, #36a2f7 100%);
  padding-top: 46px;
}

.login-content {
  padding: 60px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 46px);
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 32px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1989fa, #36a2f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  font-weight: 400;
}

/* 输入框组 */
.input-group {
  position: relative;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  z-index: 2;
  font-size: 20px;
  color: #1989fa;
}

.custom-field {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  padding-left: 48px;
  min-height: 56px;
}

.custom-field:focus-within {
  border-color: #1989fa;
  background: white;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.2);
}

.custom-field .van-field__control {
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
}

.custom-field .van-field__control::placeholder {
  color: #95a5a6;
  font-weight: 400;
}

/* 按钮组 */
.button-group {
  margin: 32px 0 24px;
}

.login-button {
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #1989fa, #36a2f7);
  border: none;
  box-shadow: 0 8px 20px rgba(25, 137, 250, 0.3);
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(25, 137, 250, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

/* 注册区域 */
.register-section {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #ecf0f1;
}

.register-text {
  color: #7f8c8d;
  font-size: 14px;
}

.register-link {
  color: #1989fa;
  font-weight: 600;
  margin-left: 8px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #36a2f7;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-content {
    padding: 40px 20px;
  }
  
  .login-form {
    padding: 40px 24px;
    border-radius: 20px;
  }
  
  .welcome-title {
    font-size: 28px;
  }
  
  .welcome-subtitle {
    font-size: 15px;
  }
}
</style>