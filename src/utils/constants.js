/**
 * @fileoverview 应用常量配置文件
 * @module utils/constants
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080/'
const API_PREFIX = import.meta.env.VITE_API_PREFIX || 'api/order-ease/v1'

/** @type {string} API 基础 URL */
export const API_BASE_URL = `${BASE_URL}${API_PREFIX}`

/** @type {string} 应用版本号 */
export const APP_VERSION = '1.0.0'

/** @type {Record<string, string>} 路由路径常量 */
export const ROUTES = {
  LOGIN: '/pages/login/index',
  INDEX: '/pages/index/index',
  ORDERS: '/pages/orders/orders',
  MINE: '/pages/mine/mine',
  REGISTER: '/pages/register/register',
  TOKEN_LOGIN: '/pages/token-login/token-login'
}

/** @type {Record<string, string>} 页面路径（用于 navigateTo/redirectTo） */
export const PAGES = {
  LOGIN: '/pages/login/index',
  INDEX: '/pages/index/index',
  ORDERS: '/pages/orders/orders',
  MINE: '/pages/mine/mine',
  REGISTER: '/pages/register/register',
  TOKEN_LOGIN: '/pages/token-login/token-login'
}

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

/** @type {Record<string, number>} 动画时长常量 (毫秒) */
export const ANIMATION_DURATION = {
  FLY: 500,
  BOUNCE: 400,
  PARABOLA: 800,
  FADE: 300,
  SLIDE: 500
}

/** @type {Record<string, number>} 分页常量 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PRODUCTS_PAGE_SIZE: 20
}

/** @type {Record<string, number>} UI 尺寸常量 (rpx) */
export const UI = {
  HEADER_HEIGHT: 88,
  CART_BAR_HEIGHT: 100,
  SAFE_AREA_BOTTOM: 0
}

/** @type {Record<string, string>} 提示消息常量 */
export const TOAST_MESSAGES = {
  CART_ADDED: '已加入福袋',
  CART_EMPTY: '福袋为空',
  ORDER_SUCCESS: '订单创建成功',
  LOADING: '加载中...',
  FEATURE_DEVELOPING: '功能开发中'
}

/** @type {Record<string, string>} 错误消息常量 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请重试',
  LOGIN_FAILED: '登录失败',
  WECHAT_LOGIN_FAILED: '微信登录失败，请重试',
  WECHAT_AUTH_CANCELLED: '您取消了授权',
  EMPTY_CREDENTIALS: '请输入用户名和密码',
  REQUEST_FAILED: '请求失败',
  TOKEN_EXPIRED: '登录已过期，请重新登录',
  SHOP_LOAD_FAILED: '店铺数据加载失败',
  PRODUCTS_LOAD_FAILED: '商品数据加载失败'
}

/** @type {Record<string, string>} 本地存储键名常量 */
export const STORAGE_KEYS = {
  USER_ID: 'user_id',
  USER_INFO: 'user_info',
  TOKEN: 'token',
  SHOP_ID: 'shop_id'
}