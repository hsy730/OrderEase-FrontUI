import { API_BASE_URL } from '@/utils/constants'

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

export const getTagBoundProducts = (params) => {
  return request({
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
  return request({
    url: '/order',
    method: 'POST',
    data: orderData
  })
}

export const getOrders = (params) => {
  return request({
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
  return request({
    url: '/tag/list',
    method: 'GET'
  })
}

export const createOrder = (data) => {
  return request({
    url: '/order/create',
    method: 'POST',
    data
  })
}

export const getShopDetail = () => {
  return request({
    url: '/shop/detail',
    method: 'GET'
  })
}

export const getOrderDetail = (orderId) => {
  return request({
    url: `/order/detail?id=${orderId}`,
    method: 'GET'
  })
}

export const userRegister = (userData) => {
  return request({
    url: '/user/register',
    method: 'POST',
    data: userData
  })
}

export const userLogin = (userData) => {
  return request({
    url: '/user/login',
    method: 'POST',
    data: userData
  })
}

export const userLoginByToken = (tokenData) => {
  return request({
    url: '/shop/temp-login',
    method: 'POST',
    data: tokenData
  })
}

export default request
