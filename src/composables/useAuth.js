/**
 * @fileoverview 认证相关的组合式函数
 * @module composables/useAuth
 */
import { ref } from 'vue'
import { storage } from '@/store/storage'
import { userLogin } from '@/utils/api'
import { ERROR_MESSAGES, ROUTES, STORAGE_KEYS } from '@/utils/constants'
import { debugLog, debugError, debugAlert } from '@/utils/debug'

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
    debugLog('开始密码登录', { username })
    
    if (!username || !password) {
      const message = ERROR_MESSAGES.EMPTY_CREDENTIALS
      debugError('登录参数为空', message)
      uni.showToast({ title: message, icon: 'none' })
      debugAlert('登录错误', message)
      return false
    }

    try {
      loading.value = true
      debugLog('发送登录请求')
      const response = await userLogin({ username, password })
      debugLog('登录请求响应', response)

      if (!handleLoginSuccess(response)) {
        const errorMessage = response.data?.error || ERROR_MESSAGES.LOGIN_FAILED
        debugError('登录失败', errorMessage)
        uni.showToast({ title: errorMessage, icon: 'none' })
        debugAlert('登录失败', errorMessage)
        return false
      }
      return true
    } catch (error) {
      debugError('登录异常', error)
      const message = ERROR_MESSAGES.NETWORK_ERROR
      uni.showToast({ title: message, icon: 'none' })
      debugAlert('网络错误', `登录失败: ${error.message}`)
      return false
    } finally {
      loading.value = false
      debugLog('登录流程结束')
    }
  }

  /**
   * 微信授权登录 - 跳转到授权页面
   * @returns {Promise<boolean>} 是否成功跳转
   */
  const handleWeChatLogin = async () => {
    debugLog('开始微信授权登录')
    
    // #ifdef MP-WEIXIN
    try {
      loading.value = true
      debugLog('跳转到微信授权页面', ROUTES.WECHAT_AUTH)
      uni.navigateTo({ url: ROUTES.WECHAT_AUTH })
      return true
    } catch (error) {
      debugError('微信登录跳转失败', error)
      const message = ERROR_MESSAGES.WECHAT_LOGIN_FAILED
      uni.showToast({ title: message, icon: 'none' })
      debugAlert('微信登录错误', `跳转失败: ${error.message}`)
      return false
    } finally {
      loading.value = false
      debugLog('微信登录流程结束')
    }
    // #endif
    // #ifndef MP-WEIXIN
    const message = '仅支持微信小程序环境'
    uni.showToast({ title: message, icon: 'none' })
    debugAlert('环境错误', message)
    return false
    // #endif
  }

  return {
    loading,
    handlePasswordLogin,
    handleWeChatLogin
  }
}
