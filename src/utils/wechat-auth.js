// 微信授权登录工具类

// 微信登录 - 获取 code
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

// 获取用户信息 - 使用 getUserProfile (微信小程序新版)
export const getUserProfile = () => {
  return {
    // #ifdef MP-WEIXIN
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
    // #endif
    // #ifndef MP-WEIXIN
    request: () => Promise.reject(new Error('仅支持微信小程序环境'))
    // #endif
  }.request()
}

// 检查微信登录状态
export const checkSession = () => {
  return {
    // #ifdef MP-WEIXIN
    request: () => new Promise((resolve) => {
      uni.checkSession({
        success: () => resolve(true),
        fail: () => resolve(false)
      })
    })
    // #endif
    // #ifndef MP-WEIXIN
    request: () => Promise.resolve(false)
    // #endif
  }.request()
}
