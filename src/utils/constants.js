/**
 * @fileoverview 应用常量配置文件
 * @module utils/constants
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080/'
const API_PREFIX = import.meta.env.VITE_API_PREFIX || 'api/order-ease/v1'

/** @type {string} API 基础 URL */
export const API_BASE_URL = `${BASE_URL}${API_PREFIX}`

/** @enum {number} 订单状态枚举 */
export const ORDER_STATUS = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY: 3,
  COMPLETED: 4,
  CANCELLED: 5
}

/** @type {Record<number, string>} 订单状态文本映射 */
export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING]: '待确认',
  [ORDER_STATUS.CONFIRMED]: '已确认',
  [ORDER_STATUS.PREPARING]: '制作中',
  [ORDER_STATUS.READY]: '待取餐',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消'
}

/** @type {Record<string, string>} 错误消息常量 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请重试',
  LOGIN_FAILED: '登录失败',
  WECHAT_LOGIN_FAILED: '微信登录失败，请重试',
  WECHAT_AUTH_CANCELLED: '您取消了授权',
  EMPTY_CREDENTIALS: '请输入用户名和密码',
  REQUEST_FAILED: '请求失败',
  TOKEN_EXPIRED: '登录已过期，请重新登录'
}

/** @type {Record<string, string>} 本地存储键名常量 */
export const STORAGE_KEYS = {
  USER_ID: 'user_id',
  USER_INFO: 'user_info',
  TOKEN: 'token',
  SHOP_ID: 'shop_id'
}