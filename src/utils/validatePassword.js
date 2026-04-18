export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: '密码长度必须在6-20位' }
  }

  if (password.length < 6 || password.length > 20) {
    return { valid: false, error: '密码长度必须在6-20位' }
  }

  if (!/[a-zA-Z0-9]/.test(password)) {
    return { valid: false, error: '密码必须包含字母或数字' }
  }

  return { valid: true, error: null }
}
