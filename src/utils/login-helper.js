import { checkSession } from './wechat-auth'
import { storage } from '@/store/storage'
import { STORAGE_KEYS } from './constants'
import { silentLogin } from './auth-utils'

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
