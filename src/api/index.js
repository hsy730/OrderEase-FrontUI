import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import router from '@/router';
import { storage } from '@/store';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
});

// 请求拦截器，自动添加shopId参数和Authorization头
api.interceptors.request.use(config => {
  // 获取本地存储参数
  const shop_id = storage.getItem('shop_id');
  const user_id = storage.getItem('user_id');
  const token = storage.getItem('token');

  // 添加Authorization头
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 检查是否为FormData类型
  const isFormData = config.data instanceof FormData;

  if (isFormData) {
    // FormData类型（文件上传）：将参数添加到query参数中
    config.params = {...config.params};
    if (shop_id) config.params.shop_id = shop_id;
    if (user_id) config.params.user_id = user_id
  } else {
    // 检查是否有body数据
    const hasBodyData = config.data && config.data !== '';
    
    if (hasBodyData) {
      // 有body数据且非FormData：将参数添加到body中
      config.data = {...config.data};
      if (shop_id) config.data.shop_id = shop_id;
      if (user_id) config.data.user_id = user_id;
    }
    // 无body数据：将参数添加到query参数中
    config.params = {...config.params};
    if (shop_id) config.params.shop_id = shop_id;
    if (user_id) config.params.user_id = user_id
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器，处理401错误
api.interceptors.response.use(response => {
  return response;
}, error => {
  // 记录错误信息，便于调试
  console.log('API请求错误:', {
    url: error.config?.url,
    status: error.response?.status,
    message: error.message
  });

  // 处理网络错误或请求被取消的情况
  if (!error.response) {
    console.log('无响应错误:', error.message);
    return Promise.reject(error);
  }

  if (error.response.status === 401) {
    // 检查是否为登录接口
    const isLoginRequest = error.config.url.includes('/user/login');
    if (!isLoginRequest) {
      console.log('收到401错误，准备跳转到登录页面');
      // 清除本地存储的登录信息
      storage.removeItem('token');
      storage.removeItem('user_info');
      // 跳转到登录页面，使用replace防止回退
      router.replace('/login');
    }
  }
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

// 用户注册接口
export const userRegister = (userData) => {
  return api.post('/user/register', userData);
}

// 用户登录接口
export const userLogin = (userData) => {
  return api.post('/user/login', userData);
}

// 用户令牌登录接口
export const userLoginByToken = (tokenData) => {
  return api.post('/shop/temp-login', tokenData);
}
