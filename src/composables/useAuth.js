/**
 * @fileoverview 认证相关的组合式函数
 * @module composables/useAuth
 */
import { ref } from 'vue'
import { storage } from '@/store/storage'
import { userLogin } from '@/utils/api'
import { ERROR_MESSAGES, ROUTES, STORAGE_KEYS } from '@/utils/constants'

/**
 * 认证组合式函数
 * @returns {{
 *   loading: import('vue').Ref<boolean>,
 *   handlePasswordLogin: (username: string, password: string) => Promise<boolean>,
 *   handleWeChatLogin: () => Promise<boolean>
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
    if (response.data?.token) {
      storage.setItem(STORAGE_KEYS.USER_ID, response.data.user?.id)
      storage.setItem(STORAGE_KEYS.USER_INFO, response.data.user)
      storage.setItem(STORAGE_KEYS.TOKEN, response.data.token)
      uni.showToast({ title: '登录成功', icon: 'success' })

      uni.reLaunch({ url: ROUTES.INDEX })
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
   * 微信授权登录 - 跳转到授权页面
   * @returns {Promise<boolean>} 是否成功跳转
   */
  const handleWeChatLogin = async () => {
    // #ifdef MP-WEIXIN
    try {
      loading.value = true
      uni.navigateTo({ url: ROUTES.WECHAT_AUTH })
      return true
    } catch (error) {
      console.error('微信登录跳转失败:', error)
      uni.showToast({ title: ERROR_MESSAGES.WECHAT_LOGIN_FAILED, icon: 'none' })
      return false
    } finally {
      loading.value = false
    }
    // #endif
    // #ifndef MP-WEIXIN
    uni.showToast({ title: '仅支持微信小程序环境', icon: 'none' })
    return false
    // #endif
  }

  return {
    loading,
    handlePasswordLogin,
    handleWeChatLogin
  }
}
