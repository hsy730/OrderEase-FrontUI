import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(null)
  const userId = ref('')
  const isLoggedIn = computed(() => !!token.value)

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      uni.setStorageSync('token', newToken)
    } else {
      uni.removeStorageSync('token')
    }
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    if (info) {
      uni.setStorageSync('user_info', JSON.stringify(info))
    } else {
      uni.removeStorageSync('user_info')
    }
  }

  const setUserId = (id) => {
    userId.value = id
    if (id) {
      uni.setStorageSync('user_id', id)
    } else {
      uni.removeStorageSync('user_id')
    }
  }

  const login = (loginData) => {
    const { token: newToken, user } = loginData
    setToken(newToken)
    setUserInfo(user)
    setUserId(user.id)
  }

  const logout = () => {
    setToken('')
    setUserInfo(null)
    setUserId('')
  }

  const loadFromLocal = () => {
    const localToken = uni.getStorageSync('token')
    const localUserInfo = uni.getStorageSync('user_info')
    const localUserId = uni.getStorageSync('user_id')

    if (localToken) {
      token.value = localToken
    }
    if (localUserInfo) {
      try {
        userInfo.value = JSON.parse(localUserInfo)
      } catch (e) {
        console.error('加载用户信息失败:', e)
      }
    }
    if (localUserId) {
      userId.value = localUserId
    }
  }

  return {
    token,
    userInfo,
    userId,
    isLoggedIn,
    setToken,
    setUserInfo,
    setUserId,
    login,
    logout,
    loadFromLocal
  }
})
