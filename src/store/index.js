// 统一存储封装，兼容 localStorage (H5) 和 uni.getStorageSync (小程序)

const isH5 = process.env.UNI_PLATFORM === 'h5'

export const storage = {
  setItem(key, value) {
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    if (isH5) {
      localStorage.setItem(key, str)
    } else {
      uni.setStorageSync(key, value)
    }
  },

  getItem(key) {
    if (isH5) {
      const value = localStorage.getItem(key)
      if (!value) return ''
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    } else {
      return uni.getStorageSync(key)
    }
  },

  removeItem(key) {
    if (isH5) {
      localStorage.removeItem(key)
    } else {
      uni.removeStorageSync(key)
    }
  },

  clear() {
    if (isH5) {
      localStorage.clear()
    } else {
      uni.clearStorageSync()
    }
  }
}
