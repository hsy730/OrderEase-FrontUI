import axios from 'axios';

const api = axios.create({
  baseURL: `http://127.0.0.1:8080/api/order-ease/v1`,
  timeout: 5000
});

export const getProducts = (tagId) => {
  return api.get(`/tag/bound-products?tag_id=${tagId}`);
};

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

// 删除重复的 request 调用