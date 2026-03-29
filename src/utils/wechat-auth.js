/**
 * @fileoverview 微信授权登录工具类
 * @module utils/wechat-auth
 */

/**
 * 微信登录 - 获取 code
 * @returns {Promise<string>} 返回微信登录 code
 * @throws {Error} 获取 code 失败时抛出错误
 */
export const wxLogin = () => {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(new Error('获取微信登录 code 失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 检查微信登录状态
 * @returns {Promise<boolean>} 返回登录状态，true 表示已登录，false 表示未登录或已过期
 */
export const checkSession = () => {
  return new Promise((resolve) => {
    uni.checkSession({
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}
