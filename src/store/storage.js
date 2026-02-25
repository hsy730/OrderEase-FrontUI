/**
 * @fileoverview 统一存储封装，兼容 localStorage (H5) 和 uni.getStorageSync (小程序)
 * @module store/storage
 */

// 使用条件编译进行平台检测，确保跨平台兼容性
let isH5 = false
// #ifdef H5
isH5 = true
// #endif

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
    // #ifdef H5
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(key, str)
    // #endif

    // #ifndef H5
    uni.setStorageSync(key, value)
    // #endif
  },

  /**
   * 获取存储数据
   * @param {string} key - 存储键名
   * @returns {any} 存储的值，不存在则返回空字符串
   */
  getItem(key) {
    // #ifdef H5
    const value = localStorage.getItem(key)
    if (!value) return ''
    // 只对 JSON 对象/数组进行 parse，简单字符串直接返回
    // 防止大整数（如用户ID、shop_id）因 JSON.parse 导致精度丢失
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
    return value
    // #endif

    // #ifndef H5
    const value = uni.getStorageSync(key)
    // 处理小程序可能返回 undefined 或 null 的情况
    return value !== undefined && value !== null ? value : ''
    // #endif
  },

  /**
   * 删除存储数据
   * @param {string} key - 存储键名
   */
  removeItem(key) {
    // #ifdef H5
    localStorage.removeItem(key)
    // #endif

    // #ifndef H5
    uni.removeStorageSync(key)
    // #endif
  },

  /**
   * 清空所有存储数据
   */
  clear() {
    // #ifdef H5
    localStorage.clear()
    // #endif

    // #ifndef H5
    uni.clearStorageSync()
    // #endif
  }
}
