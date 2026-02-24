/**
 * @fileoverview 统一存储封装，兼容 localStorage (H5) 和 uni.getStorageSync (小程序)
 * @module store/storage
 */

const isH5 = process.env.UNI_PLATFORM === 'h5'

/**
 * 统一存储对象
 * @type {{
 *   setItem: (key: string, value: any) => void,
 *   getItem: (key: string) => any,
 *   removeItem: (key: string) => void,
 *   clear: () => void
 * }}
 */
export const storage = {
  /**
   * 存储数据
   * @param {string} key - 存储键名
   * @param {any} value - 存储值
   */
  setItem(key, value) {
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    if (isH5) {
      localStorage.setItem(key, str)
    } else {
      uni.setStorageSync(key, value)
    }
  },

  /**
   * 获取存储数据
   * @param {string} key - 存储键名
   * @returns {any} 存储的值，不存在则返回空字符串
   */
  getItem(key) {
    if (isH5) {
      const value = localStorage.getItem(key)
      if (!value) return ''
      if (/^\d{15,}$/.test(value)) {
        return value
      }
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    } else {
      return uni.getStorageSync(key)
    }
  },

  /**
   * 删除存储数据
   * @param {string} key - 存储键名
   */
  removeItem(key) {
    if (isH5) {
      localStorage.removeItem(key)
    } else {
      uni.removeStorageSync(key)
    }
  },

  /**
   * 清空所有存储数据
   */
  clear() {
    if (isH5) {
      localStorage.clear()
    } else {
      uni.clearStorageSync()
    }
  }
}
