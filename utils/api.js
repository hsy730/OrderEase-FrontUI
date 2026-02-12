// 使用 uni.request 替代 axios，适配小程序环境
import { API_BASE_URL } from '../src/utils/constants'

// 请求拦截器封装
function requestInterceptor(options) {
  // 获取本地存储参数 (uni.getStorageSync)
  const shop_id = uni.getStorageSync('shop_id') || ''
  const user_id = uni.getStorageSync('user_id') || ''
  const token = uni.getStorageSync('token') || ''

  // 构建请求头
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // 添加 Authorization 头
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // 构建请求参数
  const url = options.url.startsWith('http') ? options.url : `${API_BASE_URL}${options.url}`

  // 构建最终参数
  const finalOptions = {
    url,
    method: options.method || 'GET',
    data: options.data,
    header: headers,
    timeout: options.timeout || 5000
  }

  // 处理参数注入
  if (options.method === 'GET') {
    // GET 请求: 参数添加到 query
    finalOptions.params = { ...options.params }
    if (shop_id) finalOptions.params.shop_id = shop_id
    if (user_id) finalOptions.params.user_id = user_id
  } else {
    // POST/PUT 请求: 参数添加到 body
    const hasBodyData = finalOptions.data && finalOptions.data !== ''
    if (hasBodyData) {
      if (shop_id) finalOptions.data.shop_id = shop_id
      if (user_id) finalOptions.data.user_id = user_id
    }
    finalOptions.params = { ...options.params }
    if (shop_id) finalOptions.params.shop_id = shop_id
    if (user_id) finalOptions.params.user_id = user_id
  }

  return finalOptions
}

// 响应拦截器封装
function responseInterceptor(response) {
  const { statusCode, data, errMsg } = response

  // 记录错误信息，便于调试
  if (statusCode !== 200) {
    console.log('API请求错误:', {
      url: response.config?.url || '',
      status: statusCode,
      message: errMsg
    })
  }

  // 处理 401 错误
  if (statusCode === 401) {
    const url = response.config?.url || ''
    const isLoginRequest = url.includes('/user/login')

    if (!isLoginRequest) {
      console.log('收到401错误，准备跳转到登录页面')
      // 清除本地存储的登录信息
      uni.removeStorageSync('token')
      uni.removeStorageSync('user_info')
      // 跳转到登录页面
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }

  return {
    status: statusCode,
    data: data,
    headers: response.header
  }
}

// 统一的请求方法
function request(options) {
  return new Promise((resolve, reject) => {
    const finalOptions = requestInterceptor(options)

    // 构建 query string
    if (finalOptions.params) {
      const queryStr = Object.keys(finalOptions.params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(finalOptions.params[key])}`)
        .join('&')
      if (queryStr) {
        finalOptions.url += (finalOptions.url.includes('?') ? '&' : '?') + queryStr
      }
    }
    delete finalOptions.params

    uni.request({
      ...finalOptions,
      success: (res) => {
        resolve(responseInterceptor({ ...res, config: options }))
      },
      fail: (err) => {
        console.log('API请求失败:', err)
        reject(err)
      }
    })
  })
}

// 导出统一的请求实例
const api = {
  get: (url, config = {}) => {
    return request({ url, method: 'GET', ...config })
  },
  post: (url, data = null, config = {}) => {
    return request({ url, method: 'POST', data, ...config })
  },
  put: (url, data = null, config = {}) => {
    return request({ url, method: 'PUT', data, ...config })
  },
  delete: (url, config = {}) => {
    return request({ url, method: 'DELETE', ...config })
  }
}

// ==================== API 接口定义 ====================

// 根据标签获取商品列表
export const getTagBoundProducts = (params) => {
  return api.get('/tag/bound-products', {
    params: {
      tag_id: params.tag_id,
      page: params.page,
      pageSize: params.pageSize
    }
  })
}

// 创建订单
export const createOrder = (data) => {
  return api.post('/order/create', data)
}

// 获取用户订单列表
export const getOrders = (params) => {
  return api.get('/order/user/list', {
    params: {
      user_id: params.user_id,
      page: params.page,
      pageSize: params.pageSize
    }
  })
}

// 获取订单详情
export const getOrderDetail = (orderId) => {
  return api.get(`/order/detail`, {
    params: { id: orderId }
  })
}

// 获取店铺详情
export const getShopDetail = () => {
  return api.get('/shop/detail')
}

// 获取标签列表
export const getTags = () => {
  return api.get('/tag/list')
}

// 用户注册
export const userRegister = (userData) => {
  return api.post('/user/register', userData)
}

// 用户登录
export const userLogin = (userData) => {
  return api.post('/user/login', userData)
}

// 用户令牌登录
export const userLoginByToken = (tokenData) => {
  return api.post('/shop/temp-login', tokenData)
}

// 提交订单（旧版本兼容）
export const submitOrder = (orderData) => {
  return api.post('/order', orderData)
}

export default api
