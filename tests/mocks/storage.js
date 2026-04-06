// Mock storage 模块用于测试 - 避免条件编译问题
import { jest } from '@jest/globals'

const store = {}

export const storage = {
  setItem: jest.fn((key, value) => {
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, str)
    }
    store[key] = value
  }),

  getItem: jest.fn((key) => {
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem(key)
      if (value) return value
    }
    return store[key] || ''
  }),

  removeItem: jest.fn((key) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
    delete store[key]
  }),

  clear: jest.fn(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
    for (const key in store) {
      delete store[key]
    }
  })
}
