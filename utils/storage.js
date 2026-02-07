export const storage = {
  set(key, value) {
    try {
      uni.setStorageSync(key, value)
    } catch (e) {
      console.error('存储失败:', e)
    }
  },

  get(key) {
    try {
      return uni.getStorageSync(key)
    } catch (e) {
      console.error('读取失败:', e)
      return null
    }
  },

  remove(key) {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('删除失败:', e)
    }
  },

  clear() {
    try {
      uni.clearStorageSync()
    } catch (e) {
      console.error('清空失败:', e)
    }
  }
}
