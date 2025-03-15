import axios from 'axios';

const api = axios.create({
  baseURL: `http://127.0.0.1:8080/api/order-ease/v1`,
  timeout: 5000
});

export const getCategories = () => {
  return api.get('/categories');
};

export const getProducts = (categoryId) => {
  return api.get(`/products?categoryId=${categoryId}`);
};

export const submitOrder = (orderData) => {
  return api.post('/orders', orderData);
};

export const getOrders = () => {
  return api.get('/orders');
};

// 确保使用具名导出
export const getTags = () => {
  return api.get('/tag/list');
};

// 保持默认导出
export default api;