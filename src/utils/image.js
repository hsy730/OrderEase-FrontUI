// 图片URL处理工具函数

/**
 * 构建正确的后端图片URL
 * @param {string} imagePath - 图片路径（来自后端的image_url字段）
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (imagePath) => {
  // 如果没有图片路径，返回空字符串
  if (!imagePath) return '';
  
  // 如果已经是完整URL，直接返回
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // 构建正确的后端图片URL
  // 根据后端API的实际路径，应该是 /api/order-ease/v1/product/image/{imagePath}
  // 但由于vite.config.js中的代理配置会移除/api前缀，所以实际请求会变成
  // http://localhost:8080/api/order-ease/v1/product/image/{imagePath}
  return `http://127.0.0.1:8080/api/order-ease/v1/product/image?path=${imagePath}`;
};