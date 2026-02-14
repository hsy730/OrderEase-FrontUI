import { ref } from 'vue'
import { storage } from '@/store'
import { userLogin } from '@/utils/api'

export function useAuth() {
  const loading = ref(false)

  // 登录成功后的处理
  const handleLoginSuccess = (response) => {
    if (response.data?.message === '登录成功') {
      storage.setItem('user_id', response.data.user.id)
      storage.setItem('user_info', response.data.user)
      storage.setItem('token', response.data.token)
      uni.showToast({ title: '登录成功', icon: 'success' })

      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
      return true
    }
    return false
  }

  // 用户名密码登录
  const handlePasswordLogin = async (username, password) => {
    if (!username || !password) {
      uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return false
    }

    try {
      loading.value = true
      const response = await userLogin({ username, password })

      if (!handleLoginSuccess(response)) {
        uni.showToast({ title: response.data?.error || '登录失败', icon: 'none' })
        return false
      }
      return true
    } catch (error) {
      console.error('登录失败:', error)
      uni.showToast({ title: '网络错误，请重试', icon: 'none' })
      return false
    } finally {
      loading.value = false
    }
  }

  // 微信授权登录
  const handleWeChatLogin = async (wechatLoginApi) => {
    // #ifdef MP-WEIXIN
    try {
      loading.value = true

      // 获取微信登录 code
      const code = await new Promise((resolve, reject) => {
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

      // 获取用户授权
      const userInfo = await new Promise((resolve, reject) => {
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

      // 调用后端微信登录接口
      const response = await wechatLoginApi({ code, userInfo })

      if (!handleLoginSuccess(response)) {
        uni.showToast({ title: response.data?.error || '微信登录失败', icon: 'none' })
        return false
      }
      return true
    } catch (error) {
      console.error('微信登录失败:', error)
      if (error.message === '用户拒绝授权') {
        uni.showToast({ title: '您取消了授权', icon: 'none' })
      } else {
        uni.showToast({ title: '微信登录失败，请重试', icon: 'none' })
      }
      return false
    } finally {
      loading.value = false
    }
    // #endif
    // #ifndef MP-WEIXIN
    uni.showToast({ title: '仅支持小程序环境', icon: 'none' })
    return false
    // #endif
  }

  return {
    loading,
    handlePasswordLogin,
    handleWeChatLogin
  }
}
