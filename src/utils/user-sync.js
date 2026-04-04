/**
 * @fileoverview 用户信息同步工具
 * @module utils/user-sync
 * @description 处理小程序用户信息的获取和同步，支持昵称/头像变更检测
 */

import { storage } from '@/store/storage'
import { STORAGE_KEYS } from './constants'
import { wxLogin } from './wechat-auth'
import api from './api'

/**
 * 用户信息同步配置
 */
const SYNC_CONFIG = {
  // 用户信息缓存有效期（7天）
  USER_INFO_CACHE_DAYS: 7,
  // 本地存储键名
  LAST_SYNC_KEY: 'user_info_last_sync'
}

/**
 * 获取本地存储的用户信息更新时间
 * @returns {number} 时间戳，如果没有则返回0
 */
const getLastSyncTime = () => {
  const lastSync = storage.getItem(SYNC_CONFIG.LAST_SYNC_KEY)
  return lastSync ? parseInt(lastSync, 10) : 0
}

/**
 * 更新本地同步时间
 */
const updateSyncTime = () => {
  storage.setItem(SYNC_CONFIG.LAST_SYNC_KEY, Date.now().toString())
}

/**
 * 检查是否需要同步用户信息
 * @returns {boolean} 是否需要同步
 */
export const shouldSyncUserInfo = () => {
  const lastSync = getLastSyncTime()
  if (!lastSync) return true

  const cacheDuration = SYNC_CONFIG.USER_INFO_CACHE_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - lastSync > cacheDuration
}

/**
 * 获取微信用户信息（使用最新版接口）
 * @returns {Promise<{nickname: string, avatarUrl: string}|null>} 用户信息
 */
export const getWeChatUserProfile = () => {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    // 使用 getUserProfile 获取用户信息（需要用户点击触发）
    uni.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const { nickName, avatarUrl } = res.userInfo
        resolve({
          nickname: nickName,
          avatarUrl: avatarUrl
        })
      },
      fail: () => {
        resolve(null)
      }
    })
    // #endif

    // #ifndef MP-WEIXIN
    resolve(null)
    // #endif
  })
}

/**
 * 同步用户信息到后端
 * @param {Object} userInfo - 用户信息
 * @param {string} userInfo.nickname - 用户昵称
 * @param {string} userInfo.avatarUrl - 用户头像URL
 * @returns {Promise<boolean>} 是否同步成功
 */
export const syncUserInfoToServer = async (userInfo) => {
  try {
    const response = await api.post('/user/sync-info', {
      nickname: userInfo.nickname,
      avatar_url: userInfo.avatarUrl
    })

    if (response.data?.success) {
      // 更新本地存储
      const currentUserInfo = storage.getItem(STORAGE_KEYS.USER_INFO) || {}
      storage.setItem(STORAGE_KEYS.USER_INFO, {
        ...currentUserInfo,
        ...response.data.user
      })
      updateSyncTime()
      return true
    }
    return false
  } catch (error) {
    console.error('同步用户信息失败:', error)
    return false
  }
}

/**
 * 静默同步用户信息（不需要用户点击）
 * 适用于小程序启动时或后台自动同步
 * @returns {Promise<boolean>} 是否同步成功
 */
export const silentSyncUserInfo = async () => {
  try {
    // 检查是否需要同步
    if (!shouldSyncUserInfo()) {
      return true
    }

    // 获取微信登录 code
    const code = await wxLogin()

    // 调用后端同步接口
    const response = await api.post('/user/silent-sync', {
      code,
      platform: 'wechat_mp'
    })

    if (response.data?.user) {
      // 更新本地用户信息
      storage.setItem(STORAGE_KEYS.USER_INFO, response.data.user)
      updateSyncTime()
      return true
    }
    return false
  } catch (error) {
    console.error('静默同步用户信息失败:', error)
    return false
  }
}

/**
 * 主动更新用户信息（需要用户交互）
 * 适用于用户点击"更新信息"按钮时
 * @returns {Promise<boolean>} 是否更新成功
 */
export const activeSyncUserInfo = async () => {
  try {
    // 获取最新的微信用户信息
    const wechatUserInfo = await getWeChatUserProfile()

    if (!wechatUserInfo) {
      return false
    }

    // 检查信息是否有变化
    const currentUserInfo = storage.getItem(STORAGE_KEYS.USER_INFO) || {}
    const hasChanged =
      currentUserInfo.nickname !== wechatUserInfo.nickname ||
      currentUserInfo.avatar !== wechatUserInfo.avatarUrl

    if (!hasChanged) {
      updateSyncTime()
      return true
    }

    // 同步到后端
    const success = await syncUserInfoToServer(wechatUserInfo)

    if (success) {
      uni.showToast({
        title: '信息已更新',
        icon: 'success'
      })
    }

    return success
  } catch (error) {
    console.error('主动同步用户信息失败:', error)
    return false
  }
}

/**
 * 检查并同步用户信息（智能判断）
 * 根据场景自动选择同步方式
 * @param {Object} options - 配置选项
 * @param {boolean} options.force - 是否强制同步（忽略时间间隔）
 * @param {boolean} options.silent - 是否静默同步（不需要用户交互）
 * @returns {Promise<boolean>} 是否同步成功
 */
export const checkAndSyncUserInfo = async (options = {}) => {
  const { force = false, silent = true } = options

  // 如果强制同步或需要同步
  if (force || shouldSyncUserInfo()) {
    if (silent) {
      return await silentSyncUserInfo()
    } else {
      return await activeSyncUserInfo()
    }
  }

  return true
}

/**
 * 清除用户信息同步记录
 * 用于退出登录时清理
 */
export const clearUserSyncRecord = () => {
  storage.removeItem(SYNC_CONFIG.LAST_SYNC_KEY)
}
