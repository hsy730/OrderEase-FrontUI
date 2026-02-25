<script setup>
import { onLaunch as onAppLaunch, onShow as onAppShow, onHide as onAppHide } from '@dcloudio/uni-app'
import { storage } from '@/store/storage'
import { STORAGE_KEYS } from '@/utils/constants'

/**
 * 验证并清理 URL 参数
 * @param {string} paramValue - 参数值
 * @param {string} paramName - 参数名称（用于错误提示）
 * @returns {string|null} 验证通过返回参数值，否则返回 null
 */
const validateUrlParam = (paramValue, paramName) => {
  if (!paramValue) return null

  // 移除首尾空格
  const trimmedValue = paramValue.trim()

  // 检查是否为空
  if (!trimmedValue) return null

  // 检查是否为数字
  const numValue = Number(trimmedValue)
  if (isNaN(numValue)) {
    console.warn(`[URL参数验证] ${paramName} 不是有效的数字: ${trimmedValue}`)
    return null
  }

  // 检查是否为正整数
  if (!Number.isInteger(numValue) || numValue <= 0) {
    console.warn(`[URL参数验证] ${paramName} 必须为正整数: ${trimmedValue}`)
    return null
  }

  // 防止过大数值（防止整数溢出）
  if (numValue > Number.MAX_SAFE_INTEGER) {
    console.warn(`[URL参数验证] ${paramName} 数值过大: ${trimmedValue}`)
    return null
  }

  return trimmedValue
}

/**
 * 从 URL 查询参数中提取并验证参数（仅 H5 平台）
 * @param {string} paramName - 参数名称
 * @returns {string|null} 验证通过的参数值
 */
const extractUrlParam = (paramName) => {
  // #ifdef H5
  try {
    const url = new URL(window.location.href)
    const paramValue = url.searchParams.get(paramName)
    return validateUrlParam(paramValue, paramName)
  } catch (error) {
    console.error(`[URL参数提取] ${paramName} 提取失败:`, error)
    return null
  }
  // #endif

  // #ifndef H5
  return null
  // #endif
}

/**
 * 处理 URL 参数（shop_id、user_id）
 * 在应用启动时从 URL 提取并验证参数，然后存储到本地
 */
const handleUrlParams = () => {
  // 提取并验证 shop_id
  const shopId = extractUrlParam('shop_id')
  if (shopId) {
    storage.setItem(STORAGE_KEYS.SHOP_ID, shopId)
    console.log(`[URL参数] shop_id 已保存: ${shopId}`)
  }

  // 提取并验证 user_id
  const userId = extractUrlParam('user_id')
  if (userId) {
    storage.setItem(STORAGE_KEYS.USER_ID, userId)
    console.log(`[URL参数] user_id 已保存: ${userId}`)
  }
}

/**
 * 处理小程序启动参数
 * @param {Object} query - 小程序启动参数 query 对象
 */
const handleMiniProgramParams = (query) => {
  if (!query) return

  const shopId = validateUrlParam(query.shop_id, 'shop_id')
  if (shopId) {
    storage.setItem(STORAGE_KEYS.SHOP_ID, shopId)
    console.log(`[启动参数] shop_id 已保存: ${shopId}`)
  }

  const userId = validateUrlParam(query.user_id, 'user_id')
  if (userId) {
    storage.setItem(STORAGE_KEYS.USER_ID, userId)
    console.log(`[启动参数] user_id 已保存: ${userId}`)
  }
}

onAppLaunch((options) => {
  console.log('App Launch', options)

  // #ifdef H5
  handleUrlParams()
  // #endif

  // #ifndef H5
  handleMiniProgramParams(options?.query)
  // #endif
})

onAppShow(() => {
  console.log('App Show')
})

onAppHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* 全局样式 */
@import '@/assets/main.css';

page {
  background-color: #f8f8f8;
}
</style>
