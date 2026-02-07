// 环境配置
const ENV = process.env.NODE_ENV || 'development'

// API配置
export const API_CONFIG = {
  development: {
    BASE_URL: 'http://127.0.0.1:8080/api/order-ease/v1'
  },
  production: {
    BASE_URL: 'https://api.yourdomain.com/api/order-ease/v1'
  }
}

export const API_BASE_URL = API_CONFIG[ENV].BASE_URL

// 小程序配置
export const MINI_PROGRAM_CONFIG = {
  APPID: '',
  SHARE_TITLE: 'OrderEase - 便捷点餐',
  SHARE_IMAGE: '/static/share-image.png'
}

// 业务配置
export const BUSINESS_CONFIG = {
  PAGE_SIZE: 20,
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024,  // 10MB
  IMAGE_QUALITY: 80
}
