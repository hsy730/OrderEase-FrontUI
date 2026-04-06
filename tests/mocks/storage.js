// Mock storage 模块用于测试 - 避免条件编译问题
const store = {}

export const storage = {
  setItem(key, value) {
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, str)
    }
    store[key] = value
  },

  getItem(key) {
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem(key)
      if (value) return value
    }
    return store[key] || ''
  },

  removeItem(key) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
    delete store[key]
  },

  clear() {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
    for (const key in store) {
      delete store[key]
    }
  }
}
