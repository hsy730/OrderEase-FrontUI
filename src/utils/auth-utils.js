/**
 * @fileoverview 认证相关工具函数
 * @module utils/auth-utils
 */

import { wxLogin } from './wechat-auth'
import api from './api'
import { storage } from '@/store/storage'
import { STORAGE_KEYS } from './constants'

/**
 * 静默登录（微信小程序）
 * @returns {Promise<boolean>} 是否登录成功
 */
export const silentLogin = async () => {
  try {
    const code = await wxLogin()
    const response = await api.post('/user/wechat-login', {
      code,
      silent: true
    })

    if (response.data?.token) {
      storage.setItem(STORAGE_KEYS.USER_ID, response.data.user?.id)
      storage.setItem(STORAGE_KEYS.USER_INFO, response.data.user)
      storage.setItem(STORAGE_KEYS.TOKEN, response.data.token)
      return true
    }
    return false
  } catch (error) {
    console.error('静默登录失败:', error)
    return false
  }
}
