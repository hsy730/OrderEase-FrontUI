import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
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

export default api; 