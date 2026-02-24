import { ERROR_MESSAGES } from './constants'

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

export const showSuccess = (message) => {
  uni.showToast({ title: message, icon: 'success', duration: 1500 })
}

export const showError = (message) => {
  uni.showToast({ title: message, icon: 'none', duration: 2000 })
}

export const showLoading = (message = '加载中...') => {
  uni.showLoading({ title: message, mask: true })
}

export const hideLoading = () => {
  uni.hideLoading()
}

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
