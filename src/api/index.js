import { API_BASE_URL, USE_MOCK } from '@/utils/constants'
import mockApi from '@/mock/index.js'

const request = (config) => {
  return new Promise((resolve, reject) => {
    const shop_id = uni.getStorageSync('shop_id')
    const user_id = uni.getStorageSync('user_id')
    const token = uni.getStorageSync('token')
    
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const url = `${API_BASE_URL}${config.url}`
    
    let data = config.data || {}
    let params = config.params || {}
    
    if (shop_id) {
      data.shop_id = shop_id
      params.shop_id = shop_id
    }
    
    if (user_id) {
      data.user_id = user_id
      params.user_id = user_id
    }
    
    uni.request({
      url,
      method: config.method || 'GET',
      data: config.method === 'GET' ? params : data,
      header: headers,
      timeout: 5000,
      success: (res) => {
        resolve({
          data: res.data,
          status: res.statusCode,
          headers: res.header,
          config: config
        })
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

const mockRequest = (config) => {
  return new Promise((resolve, reject) => {
    const { url, method, data, params } = config
    
    const requestConfig = {
      url,
      method,
      data: data || {},
      params: params || {}
    }
    
    mockApiRequest(requestConfig)
      .then(resolve)
      .catch(reject)
  })
}

const mockApiRequest = async (config) => {
  const { url, method, data, params } = config
  
  switch (url) {
    case '/shop/detail':
      return await mockApi.getShopDetail()
    
    case '/tag/bound-products':
      return await mockApi.getTagBoundProducts(params)
    
    case '/order/user/list':
      return await mockApi.getOrders(params)
    
    case '/order/detail':
      const orderId = params.id || data.id
      return await mockApi.getOrderDetail(orderId)
    
    case '/order/create':
      return await mockApi.createOrder(data)
    
    case '/user/login':
      return await mockApi.userLogin(data)
    
    case '/user/register':
      return await mockApi.userRegister(data)
    
    case '/shop/temp-login':
      return await mockApi.userLoginByToken(data)
    
    case '/tag/list':
      return await mockApi.getTags()
    
    default:
      return {
        status: 404,
        data: {
          code: 404,
          error: 'Mock API not found'
        }
      }
  }
}

export const getTagBoundProducts = (params) => {
  return (USE_MOCK ? mockRequest : request)({
    url: '/tag/bound-products',
    method: 'GET',
    params: {
      tag_id: params.tag_id,
      page: params.page,
      pageSize: params.pageSize
    }
  })
}

export const submitOrder = (orderData) => {
  return (USE_MOCK ? mockRequest : request)({
    url: '/order',
    method: 'POST',
    data: orderData
  })
}

export const getOrders = (params) => {
  return (USE_MOCK ? mockRequest : request)({
    url: '/order/user/list',
    method: 'GET',
    params: {
      user_id: params.user_id,
      page: params.page,
      pageSize: params.pageSize
    }
  })
}

export const getTags = () => {
  return (USE_MOCK ? mockRequest : request)({
    url: '/tag/list',
    method: 'GET'
  })
}

export const createOrder = (data) => {
  return (USE_MOCK ? mockRequest : request)({
    url: '/order/create',
    method: 'POST',
    data
  })
}

export const getShopDetail = () => {
  return (USE_MOCK ? mockRequest : request)({
    url: '/shop/detail',
    method: 'GET'
  })
}

export const getOrderDetail = (orderId) => {
  return (USE_MOCK ? mockRequest : request)({
    url: `/order/detail?id=${orderId}`,
    method: 'GET'
  })
}

export const userRegister = (userData) => {
  return (USE_MOCK ? mockRequest : request)({
    url: '/user/register',
    method: 'POST',
    data: userData
  })
}

export const userLogin = (userData) => {
  return (USE_MOCK ? mockRequest : request)({
    url: '/user/login',
    method: 'POST',
    data: userData
  })
}

export const userLoginByToken = (tokenData) => {
  return (USE_MOCK ? mockRequest : request)({
    url: '/shop/temp-login',
    method: 'POST',
    data: tokenData
  })
}

export default request
