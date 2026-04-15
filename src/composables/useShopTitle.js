/**
 * @fileoverview 店铺标题相关的组合式函数
 * @module composables/useShopTitle
 */
import { ref } from 'vue'
import { getShopDetail } from '@/utils/api'

// 全局缓存，避免重复请求
let cachedShopDetail = null
let isLoading = false
let pendingPromise = null

/**
 * 店铺标题组合式函数
 * 用于获取店铺信息并设置页面标题（H5 和小程序都适用）
 * 带有全局缓存机制，确保只获取一次店铺详情
 * @returns {{
 *   shopName: import('vue').Ref<string>,
 *   shopDetail: import('vue').Ref<Object|null>,
 *   loadShopTitle: () => Promise<void>
 * }}
 */
export function useShopTitle() {
  /** @type {import('vue').Ref<string>} */
  const shopName = ref(cachedShopDetail?.name || '未命名店铺')
  /** @type {import('vue').Ref<Object|null>} */
  const shopDetail = ref(cachedShopDetail)

  /**
   * 加载店铺详情并设置页面标题
   * 如果已有缓存，直接使用缓存数据
   * @returns {Promise<void>}
   */
  const loadShopTitle = async () => {
    // 如果已有缓存，直接使用
    if (cachedShopDetail) {
      shopDetail.value = cachedShopDetail
      shopName.value = cachedShopDetail.name || '未命名店铺'

      // #ifdef MP-WEIXIN
      if (cachedShopDetail.name) {
        uni.setNavigationBarTitle({ title: cachedShopDetail.name })
      }
      // #endif

      // #ifdef H5
      if (cachedShopDetail.name) {
        document.title = cachedShopDetail.name
      }
      // #endif
      return
    }

    // 如果正在加载中，等待加载完成
    if (isLoading && pendingPromise) {
      await pendingPromise
      shopDetail.value = cachedShopDetail
      shopName.value = cachedShopDetail?.name || '未命名店铺'
      return
    }

    // 开始加载
    isLoading = true
    pendingPromise = getShopDetail()

    try {
      const response = await pendingPromise
      if (response.data && response.status === 200) {
        const shopData = response.data.data || response.data
        // 缓存数据
        cachedShopDetail = shopData
        shopDetail.value = shopData

        if (shopData.name) {
          shopName.value = shopData.name

          // #ifdef MP-WEIXIN
          // 小程序动态设置导航栏标题
          uni.setNavigationBarTitle({ title: shopData.name })
          // #endif

          // #ifdef H5
          // H5 更新页面标题
          document.title = shopData.name
          // #endif
        }
      }
    } catch (error) {
      console.error('获取店铺详情失败:', error)
    } finally {
      isLoading = false
      pendingPromise = null
    }
  }

  /**
   * 清除缓存（用于需要重新获取的场景，如切换店铺）
   */
  const clearCache = () => {
    cachedShopDetail = null
    isLoading = false
    pendingPromise = null
  }

  return {
    shopName,
    shopDetail,
    loadShopTitle,
    clearCache
  }
}
