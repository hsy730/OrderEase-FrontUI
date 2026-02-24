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
 * @typedef {Object} WechatUserInfo
 * @property {string} nickName - 用户昵称
 * @property {string} avatarUrl - 用户头像URL
 * @property {number} gender - 用户性别
 * @property {string} encryptedData - 加密数据
 * @property {string} iv - 加密算法初始向量
 * @property {string} rawData - 原始数据
 * @property {string} signature - 签名
 */

/**
 * 获取用户信息 - 使用 getUserProfile (微信小程序新版)
 * @returns {Promise<WechatUserInfo>} 返回用户信息对象
 * @throws {Error} 用户拒绝授权或非微信小程序环境时抛出错误
 */
export const getUserProfile = () => {
  return {
    request: () => new Promise((resolve, reject) => {
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve({
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl,
            gender: res.userInfo.gender,
            encryptedData: res.encryptedData,
            iv: res.iv,
            rawData: res.rawData,
            signature: res.signature
          })
        },
        fail: (err) => {
          reject(new Error('用户拒绝授权'))
        }
      })
    })
  }.request()
}

/**
 * 检查微信登录状态
 * @returns {Promise<boolean>} 返回登录状态，true 表示已登录，false 表示未登录或已过期
 */
export const checkSession = () => {
  return {
    request: () => new Promise((resolve) => {
      uni.checkSession({
        success: () => resolve(true),
        fail: () => resolve(false)
      })
    })
  }.request()
}
