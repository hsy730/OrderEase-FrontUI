<script setup>
import { onLaunch as onAppLaunch, onShow as onAppShow, onHide as onAppHide } from '@dcloudio/uni-app'
import { storage } from '@/store/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { debugLog, isDebugMode } from '@/utils/debug'

onAppLaunch((options) => {
  console.log('=== App onLaunch 开始 ===')
  console.log('options:', options)

  // 解析 URL 参数中的 shop_id
  let shopId = null

  // #ifdef H5
  // H5 从 URL 查询参数获取
  const urlParams = new URLSearchParams(window.location.search)
  shopId = urlParams.get('shop_id')
  // #endif

  // #ifdef MP-WEIXIN
  // 小程序从启动参数获取
  if (options && options.query && options.query.shop_id) {
    shopId = options.query.shop_id
  }
  // #endif

  // 保存 shop_id 到 storage
  if (shopId) {
    storage.setItem(STORAGE_KEYS.SHOP_ID, shopId)
    // #ifdef MP-WEIXIN
    // 只在小程序环境下打印
    if (isDebugMode()) {
      debugLog('App onLaunch - shop_id 解析成功', { shop_id: shopId })
    }
    // #endif
  } else {
    // 尝试从 storage 读取已有的 shop_id
    const savedShopId = storage.getItem(STORAGE_KEYS.SHOP_ID)
    // #ifdef MP-WEIXIN
    // 只在小程序环境下打印
    if (isDebugMode()) {
      debugLog('App onLaunch - shop_id 状态', {
        fromUrl: shopId,
        fromStorage: savedShopId
      })
    }
    // #endif
  }

  console.log('=== App onLaunch 结束 ===')
})

onAppShow(() => {
  console.log('App Show')
})

onAppHide(() => {
  console.log('App Hide')
})
</script>

<style>
page {
  background-color: #f8f8f8;
}
</style>
