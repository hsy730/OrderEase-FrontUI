import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
});

// 请求拦截器，自动添加shopId参数
api.interceptors.request.use(config => {
  // 获取本地存储参数
  const shop_id = localStorage.getItem('shop_id');
  const user_id = localStorage.getItem('user_id');
  
  const addParams = (target) => {
    if (shop_id) target.shop_id = Number(shop_id);
    if (user_id) target.user_id = user_id;
  };

  if (config.method === 'get') {
    config.params = {...config.params};
    addParams(config.params);
  } else {
    config.data = {...config.data};
    addParams(config.data);
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// export const getProducts = (tagId) => {
//   return api.get(`/tag/bound-products?tag_id=${tagId}`);
// };

export const getTagBoundProducts = (params) => {
  return api.get('/tag/bound-products', {
    params: {
      tag_id: params.tag_id,
      page: params.page,
      pageSize: params.pageSize
    }
  })
};

export const submitOrder = (orderData) => {
  return api.post('/order', orderData);
};

export const getOrders = (params) => {
  return api.get('/order/user/list', {
    params: {
      user_id: params.user_id,
      page: params.page,
      pageSize: params.pageSize
    }
  });
};

// 确保使用具名导出
export const getTags = () => {
  return api.get('/tag/list');
};

// 保持默认导出
export default api;

// 添加订单创建接口
// 修复 createOrder 方法（使用 api 实例）
export const  createOrder = (data) => {
  return api.post('/order/create', data)
}

// 外部调用接口
export const getShopDetail = () => {
  return api.get(`/shop/detail`);
}
// 订单详情接口
export const getOrderDetail = (orderId) => {
  return api.get(`/order/detail?id=${orderId}`);
}
