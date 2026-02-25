/**
 * @fileoverview 统一错误处理工具
 * @module utils/errorHandler
 */
import { ERROR_MESSAGES } from './constants'

/**
 * 处理 API 错误
 * @param {Error|Object} error - 错误对象
 * @param {string} [customMessage] - 自定义错误消息
 * @returns {{ success: boolean, message: string }}
 */
export const handleApiError = (error, customMessage) => {
  console.error('API Error:', error)
  
  let message = customMessage
  
  if (!message) {
    if (error.errMsg?.includes('timeout')) {
      message = '请求超时，请重试'
    } else if (error.errMsg?.includes('network')) {
      message = ERROR_MESSAGES.NETWORK_ERROR
    } else if (error.message) {
      message = error.message
    } else {
      message = ERROR_MESSAGES.REQUEST_FAILED
    }
  }
  
  uni.showToast({ title: message, icon: 'none', duration: 2000 })
  
  return { success: false, message }
}

/**
 * 处理 HTTP 状态码错误
 * @param {number} statusCode - HTTP 状态码
 * @param {Object} errorData - 错误数据
 * @returns {{ success: boolean, message: string, statusCode: number }}
 */
export const handleHttpError = (statusCode, errorData) => {
  let message = ERROR_MESSAGES.REQUEST_FAILED
  
  switch (statusCode) {
    case 400:
      message = errorData?.error || '请求参数错误'
      break
    case 401:
      message = ERROR_MESSAGES.TOKEN_EXPIRED
      break
    case 403:
      message = '没有权限访问'
      break
    case 404:
      message = '请求的资源不存在'
      break
    case 500:
      message = '服务器错误，请稍后重试'
      break
    case 502:
    case 503:
      message = '服务暂时不可用，请稍后重试'
      break
    default:
      if (errorData?.error) {
        message = errorData.error
      }
  }
  
  uni.showToast({ title: message, icon: 'none', duration: 2000 })
  
  return { success: false, message, statusCode }
}

/**
 * 检查 API 响应是否成功
 * @param {Object} response - API 响应
 * @returns {boolean}
 */
export const isResponseSuccess = (response) => {
  // 检查 HTTP 状态码和数据存在
  if (!response || response.status !== 200 || !response.data) {
    return false
  }
  // 检查业务状态码（如果后端使用 code 字段）
  if (response.data.code !== undefined && response.data.code !== null && response.data.code !== 0) {
    return false
  }
  return true
}

/**
 * 获取响应数据
 * @param {Object} response - API 响应
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
export const getResponseData = (response, defaultValue = null) => {
  if (isResponseSuccess(response)) {
    return response.data.data || response.data
  }
  return defaultValue
}

/**
 * 显示成功提示
 * @param {string} message - 提示消息
 */
export const showSuccess = (message) => {
  uni.showToast({ title: message, icon: 'success', duration: 1500 })
}

/**
 * 显示错误提示
 * @param {string} message - 错误消息
 */
export const showError = (message) => {
  uni.showToast({ title: message, icon: 'none', duration: 2000 })
}

/**
 * 显示加载中
 * @param {string} [message] - 加载提示
 */
export const showLoading = (message = '加载中...') => {
  uni.showLoading({ title: message, mask: true })
}

/**
 * 隐藏加载中
 */
export const hideLoading = () => {
  uni.hideLoading()
}

/**
 * 显示确认弹窗
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @returns {Promise<boolean>}
 */
export const showConfirm = (title, content) => {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      confirmColor: '#1E40AF',
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 包装异步请求，自动处理错误
 * @param {Function} requestFn - 请求函数
 * @param {Object} options - 选项
 * @param {string} [options.errorMessage] - 自定义错误消息
 * @param {Function} [options.onSuccess] - 成功回调
 * @param {Function} [options.onError] - 错误回调
 * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
 */
export const wrapRequest = async (requestFn, options = {}) => {
  try {
    const response = await requestFn()
    
    if (isResponseSuccess(response)) {
      if (options.onSuccess) {
        options.onSuccess(response.data)
      }
      return { success: true, data: response.data }
    }
    
    const errorResult = handleHttpError(response.status, response.data)
    if (options.onError) {
      options.onError(errorResult)
    }
    return { success: false, error: errorResult }
  } catch (error) {
    const errorResult = handleApiError(error, options.errorMessage)
    if (options.onError) {
      options.onError(errorResult)
    }
    return { success: false, error: errorResult }
  }
}
