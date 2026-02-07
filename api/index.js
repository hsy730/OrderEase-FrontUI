import request from '@/utils/request'

export const getShopDetail = () => {
  return request({
    url: '/shop/detail',
    method: 'GET'
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

export const createOrder = (data) => {
  return request({
    url: '/order/create',
    method: 'POST',
    data
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

export const getOrderDetail = (orderId) => {
  return request({
    url: `/order/detail?id=${orderId}`,
    method: 'GET'
  })
}

export const userLogin = (userData) => {
  return request({
    url: '/user/login',
    method: 'POST',
    data: userData
  })
}

export const userRegister = (userData) => {
  return request({
    url: '/user/register',
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
