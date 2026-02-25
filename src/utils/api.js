// 使用 uni.request 替代 axios，适配小程序环境
import { API_BASE_URL, STORAGE_KEYS } from './constants'
import { storage } from '@/store/storage'

const isDev = import.meta.env.DEV

function requestInterceptor(options) {
  const shop_id = storage.getItem(STORAGE_KEYS.SHOP_ID) || ''
  const user_id = storage.getItem(STORAGE_KEYS.USER_ID) || ''
  const token = storage.getItem(STORAGE_KEYS.TOKEN) || ''

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = options.url.startsWith('http') ? options.url : `${API_BASE_URL}${options.url}`

  const finalOptions = {
    url,
    method: options.method || 'GET',
    data: options.data,
    header: headers,
    timeout: options.timeout || 5000
  }

  if (options.method === 'GET') {
    finalOptions.params = { ...options.params }
    if (shop_id) finalOptions.params.shop_id = shop_id
    if (user_id) finalOptions.params.user_id = user_id
  } else {
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

function responseInterceptor(response) {
  const { statusCode, data, errMsg } = response

  if (isDev && statusCode !== 200) {
    console.log('API请求错误:', {
      url: response.config?.url || '',
      status: statusCode,
      message: errMsg
    })
  }

  if (statusCode === 401) {
    const url = response.config?.url || ''
    const isLoginRequest = url.includes('/user/login')

    if (!isLoginRequest) {
      storage.removeItem(STORAGE_KEYS.TOKEN)
      storage.removeItem(STORAGE_KEYS.USER_INFO)
      uni.reLaunch({ url: '/pages/login/index' })
    }
  }

  return {
    status: statusCode,
    data: data,
    headers: response.header
  }
}

function request(options) {
  return new Promise((resolve, reject) => {
    const finalOptions = requestInterceptor(options)

    if (finalOptions.params) {
      const queryStr = Object.keys(finalOptions.params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(finalOptions.params[key])}`)
        .join('&')
      if (queryStr) {
        finalOptions.url += (finalOptions.url.includes('?') ? '&' : '?') + queryStr
      }
    }
    delete finalOptions.params

    if (isDev) {
      console.log('API Request:', finalOptions.url)
    }

    uni.request({
      ...finalOptions,
      success: (res) => {
        if (isDev) {
          console.log('API Response:', finalOptions.url, res.statusCode)
        }
        resolve(responseInterceptor({ ...res, config: options }))
      },
      fail: (err) => {
        if (isDev) {
          console.log('API请求失败:', err)
        }
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

// 微信小程序授权登录
export const userWeChatLogin = (wechatData) => {
  return api.post('/user/wechat-login', wechatData)
}

export default api
