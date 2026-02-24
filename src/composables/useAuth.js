/**
 * @fileoverview 认证相关的组合式函数
 * @module composables/useAuth
 */
import { ref } from 'vue'
import { storage } from '@/store/storage'
import { userLogin } from '@/utils/api'
import { wxLogin, getUserProfile } from '@/utils/wechat-auth'
import { ERROR_MESSAGES } from '@/utils/constants'

/**
 * 认证组合式函数
 * @returns {{
 *   loading: import('vue').Ref<boolean>,
 *   handlePasswordLogin: (username: string, password: string) => Promise<boolean>,
 *   handleWeChatLogin: (wechatLoginApi: Function) => Promise<boolean>
 * }}
 */
export function useAuth() {
  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false)

  /**
   * 处理登录成功响应
   * @param {Object} response - 登录响应
   * @param {Object} response.data - 响应数据
   * @param {string} response.data.message - 响应消息
   * @param {Object} response.data.user - 用户信息
   * @param {string} response.data.token - 认证令牌
   * @returns {boolean} 登录是否成功
   */
  const handleLoginSuccess = (response) => {
    if (response.data?.message === '登录成功') {
      storage.setItem('user_id', response.data.user.id)
      storage.setItem('user_info', response.data.user)
      storage.setItem('token', response.data.token)
      uni.showToast({ title: '登录成功', icon: 'success' })

      uni.reLaunch({ url: '/pages/index/index' })
      return true
    }
    return false
  }

  /**
   * 用户名密码登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<boolean>} 登录是否成功
   */
  const handlePasswordLogin = async (username, password) => {
    if (!username || !password) {
      uni.showToast({ title: ERROR_MESSAGES.EMPTY_CREDENTIALS, icon: 'none' })
      return false
    }

    try {
      loading.value = true
      const response = await userLogin({ username, password })

      if (!handleLoginSuccess(response)) {
        uni.showToast({ title: response.data?.error || ERROR_MESSAGES.LOGIN_FAILED, icon: 'none' })
        return false
      }
      return true
    } catch (error) {
      console.error('登录失败:', error)
      uni.showToast({ title: ERROR_MESSAGES.NETWORK_ERROR, icon: 'none' })
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 微信授权登录
   * @param {Function} wechatLoginApi - 微信登录 API 函数
   * @returns {Promise<boolean>} 登录是否成功
   */
  const handleWeChatLogin = async (wechatLoginApi) => {
    try {
      loading.value = true

      const code = await wxLogin()
      const userInfo = await getUserProfile()

      const response = await wechatLoginApi({ code, userInfo })

      if (!handleLoginSuccess(response)) {
        uni.showToast({ title: response.data?.error || ERROR_MESSAGES.WECHAT_LOGIN_FAILED, icon: 'none' })
        return false
      }
      return true
    } catch (error) {
      console.error('微信登录失败:', error)
      if (error.message === '用户拒绝授权') {
        uni.showToast({ title: ERROR_MESSAGES.WECHAT_AUTH_CANCELLED, icon: 'none' })
      } else {
        uni.showToast({ title: ERROR_MESSAGES.WECHAT_LOGIN_FAILED, icon: 'none' })
      }
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    handlePasswordLogin,
    handleWeChatLogin
  }
}
