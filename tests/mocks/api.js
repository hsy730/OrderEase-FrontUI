// Manual mock for @/utils/api - 用于测试
// 这个文件会自动替代真实的 api.js

const isDev = process.env.NODE_ENV !== 'production'

function requestInterceptor(options) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  const url = options.url.startsWith('http') ? options.url : `http://127.0.0.1:8080/api/order-ease/v1${options.url}`

  return {
    url,
    method: options.method || 'GET',
    data: options.data,
    header: headers,
    timeout: options.timeout || 5000
  }
}

function responseInterceptor(response) {
  const { statusCode, data, errMsg } = response

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
      delete finalOptions.params
    }

    global.uni.request({
      ...finalOptions,
      success: (res) => {
        resolve(responseInterceptor({ ...res, config: options }))
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

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

export const getTagBoundProducts = (params) => {
  return api.get('/tag/bound-products', {
    params: {
      tag_id: params.tag_id,
      page: params.page,
      pageSize: params.pageSize
    }
  })
}

export const createOrder = (data) => {
  return api.post('/order/create', data)
}

export const getOrders = (params) => {
  return api.get('/order/user/list', {
    params: {
      user_id: params.user_id,
      page: params.page,
      pageSize: params.pageSize
    }
  })
}

export const getOrderDetail = (orderId) => {
  return api.get(`/order/detail`, {
    params: { id: orderId }
  })
}

export const getShopDetail = () => {
  return api.get('/shop/detail')
}

export const getTags = () => {
  return api.get('/tag/list')
}

export const userRegister = (userData) => {
  return api.post('/user/register', userData)
}

export const userLogin = (userData) => {
  return api.post('/user/login', userData)
}

export const userLoginByToken = (tokenData) => {
  return api.post('/shop/temp-login', tokenData)
}

export const submitOrder = (orderData) => {
  return api.post('/order', orderData)
}

export const userWeChatLogin = (wechatData) => {
  return api.post('/user/wechat-login', wechatData)
}

export const getUserInfo = () => {
  return api.get('/user/info')
}

export default api
