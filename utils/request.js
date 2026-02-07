import { API_BASE_URL } from './constants'

const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取本地存储的参数
    const shop_id = uni.getStorageSync('shop_id')
    const user_id = uni.getStorageSync('user_id')
    const token = uni.getStorageSync('token')
    
    // 准备请求头
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }
    
    // 添加Authorization头
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    
    // 处理请求方法和参数
    const method = options.method || 'GET'
    let requestData = options.data
    let requestParams = options.params || {}
    
    // 检查是否为FormData类型
    const isFormData = options.data instanceof FormData
    
    if (method === 'POST' || method === 'PUT') {
      if (isFormData) {
        // FormData类型：参数添加到query参数中
        if (shop_id) requestParams.shop_id = shop_id
        if (user_id) requestParams.user_id = user_id
      } else {
        // 普通JSON数据
        const hasBodyData = requestData && requestData !== ''
        
        if (hasBodyData) {
          // 有body数据：参数添加到body中
          requestData = { ...requestData }
          if (shop_id) requestData.shop_id = shop_id
          if (user_id) requestData.user_id = user_id
        } else {
          // 无body数据：参数添加到query参数中
          if (shop_id) requestParams.shop_id = shop_id
          if (user_id) requestParams.user_id = user_id
        }
      }
    } else {
      // GET/DELETE请求：参数添加到query参数中
      if (shop_id) requestParams.shop_id = shop_id
      if (user_id) requestParams.user_id = user_id
    }
    
    // 发起请求
    uni.request({
      url: API_BASE_URL + options.url,
      method,
      data: requestData,
      params: requestParams,
      header,
      timeout: options.timeout || 5000,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res)
        } else if (res.statusCode === 401) {
          // 清除登录信息
          uni.removeStorageSync('token')
          uni.removeStorageSync('user_info')
          
          // 跳转到登录页（使用replace防止回退）
          const pages = getCurrentPages()
          const currentPage = pages[pages.length - 1]
          if (!currentPage.route.includes('login/index')) {
            uni.redirectTo({
              url: '/pages/login/index'
            })
          }
          
          reject(new Error('登录已过期'))
        } else {
          reject(new Error(res.data?.message || '请求失败'))
        }
      },
      fail: (err) => {
        console.error('请求失败:', {
          url: options.url,
          method,
          message: err.errMsg
        })
        reject(err)
      }
    })
  })
}

export default request
