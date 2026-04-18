import { validatePassword } from '@/utils/validatePassword'

describe('密码校验 - validatePassword', () => {
  describe('有效密码测试用例', () => {
    it('字母和数字组合 - abc123', () => {
      const result = validatePassword('abc123')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('纯字母 - abcdef', () => {
      const result = validatePassword('abcdef')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('纯数字 - 123456', () => {
      const result = validatePassword('123456')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('20个字符长度 - abcdefghijklmn12345', () => {
      const result = validatePassword('abcdefghijklmn12345')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('大写字母 - ABCDEF', () => {
      const result = validatePassword('ABCDEF')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('包含特殊字符（类似强密码）- Abc123!@', () => {
      const result = validatePassword('Abc123!@')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })
  })

  describe('无效密码测试用例', () => {
    it('太短 - 少于6位字符 - ab12', () => {
      const result = validatePassword('ab12')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('密码长度必须在6-20位')
    })

    it('太长 - 超过20位字符', () => {
      const result = validatePassword('abcdefghijklmnopqrstuvwxyz123456')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('密码长度必须在6-20位')
    })

    it('仅特殊字符 - 不含字母或数字 - !@#$%^', () => {
      const result = validatePassword('!@#$%^')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('密码必须包含字母或数字')
    })

    it('空字符串', () => {
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('密码长度必须在6-20位')
    })

    it('null 值', () => {
      const result = validatePassword(null)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('密码长度必须在6-20位')
    })

    it('undefined 值', () => {
      const result = validatePassword(undefined)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('密码长度必须在6-20位')
    })

    it('非字符串类型 - 数字 123456', () => {
      const result = validatePassword(123456)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('密码长度必须在6-20位')
    })
  })

  describe('边界值测试', () => {
    it('最小长度边界 - 恰好6位', () => {
      const result = validatePassword('abcde1')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('最大长度边界 - 恰好20位', () => {
      const result = validatePassword('abcdefghijklmnopqrst')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('刚好超过最小长度 - 5位应该失败', () => {
      const result = validatePassword('abcde')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('密码长度必须在6-20位')
    })

    it('刚好超过最大长度 - 21位应该失败', () => {
      const result = validatePassword('abcdefghijklmnopqrstu')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('密码长度必须在6-20位')
    })
  })

  describe('特殊场景测试', () => {
    it('只有字母和空格', () => {
      const result = validatePassword('abc def')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('中文字符和数字组合', () => {
      const result = validatePassword('密码1234')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('包含换行符', () => {
      const result = validatePassword('abc\n123')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })
  })
})
