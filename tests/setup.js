// Mock uni-app 全局对象 - 使用普通函数代替 jest.fn()
global.uni = {
  request: () => {},
  navigateTo: () => {},
  switchTab: () => {},
  navigateBack: () => {},
  redirectTo: () => {},
  reLaunch: () => {},
  getStorageSync: () => null,
  setStorageSync: () => {},
  removeStorageSync: () => {}
}

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: (key) => localStorageMock.store[key] || null,
  setItem: (key, value) => {
    localStorageMock.store[key] = value
  },
  removeItem: (key) => {
    delete localStorageMock.store[key]
  },
  clear: () => {
    localStorageMock.store = {}
  }
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
