/**
 * @fileoverview 调试工具函数
 * @module utils/debug
 */

/**
 * 检查是否为调试模式
 * @returns {boolean} 是否为调试模式
 */
export const isDebugMode = () => {
  // 仅根据 VITE_DEBUG_MODE 环境变量控制调试模式
  return import.meta.env.VITE_DEBUG_MODE === 'true'
}

/**
 * 调试日志输出
 * @param {string} message - 日志消息
 * @param {*} [data] - 附加数据
 */
export const debugLog = (message, data = null) => {
  if (isDebugMode()) {
    console.log(`[DEBUG] ${message}`, data)
  }
}

/**
 * 调试错误输出
 * @param {string} message - 错误消息
 * @param {Error|Object} [error] - 错误对象
 */
export const debugError = (message, error = null) => {
  if (isDebugMode()) {
    console.error(`[DEBUG ERROR] ${message}`, error)
    
    // 在调试模式下显示 alert
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    const alertMessage = `[错误] ${message}\n${errorMessage}`
    
    // 检查是否在小程序环境
    if (typeof uni !== 'undefined' && uni.showModal) {
      uni.showModal({
        title: '调试错误',
        content: alertMessage,
        showCancel: false
      })
    } else if (typeof alert === 'function') {
      alert(alertMessage)
    }
  }
}

/**
 * 调试信息输出（仅在调试模式下）
 * @param {string} title - 标题
 * @param {*} [data] - 数据
 */
export const debugInfo = (title, data = null) => {
  if (isDebugMode()) {
    console.info(`[DEBUG INFO] ${title}`, data)
  }
}

/**
 * 显示调试弹窗（仅在调试模式下）
 * @param {string} title - 标题
 * @param {string} message - 消息
 */
export const debugAlert = (title, message) => {
  if (isDebugMode()) {
    if (typeof uni !== 'undefined' && uni.showModal) {
      uni.showModal({
        title,
        content: message,
        showCancel: false
      })
    } else if (typeof alert === 'function') {
      alert(`${title}: ${message}`)
    }
  }
}

/**
 * 包装函数以捕获和显示错误（仅在调试模式下）
 * @param {Function} fn - 要执行的函数
 * @param {string} [functionName] - 函数名称（用于错误消息）
 * @returns {Function} 包装后的函数
 */
export const debugWrap = (fn, functionName = '函数') => {
  return (...args) => {
    if (isDebugMode()) {
      try {
        return fn(...args)
      } catch (error) {
        debugError(`${functionName}执行失败`, error)
        throw error
      }
    } else {
      return fn(...args)
    }
  }
}
