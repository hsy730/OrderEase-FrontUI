import { wxLogin, checkSession } from './wechat-auth'
import { userWeChatLogin } from './api'
import { storage } from '@/store/storage'
import { STORAGE_KEYS } from './constants'

export const silentLogin = async () => {
  try {
    const code = await wxLogin()
    const response = await userWeChatLogin({
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

export const checkAndRefreshLogin = async () => {
  if (storage.getItem(STORAGE_KEYS.TOKEN)) {
    const sessionValid = await checkSession()
    if (!sessionValid) {
      return await silentLogin()
    }
    return true
  } else {
    return await silentLogin()
  }
}
