const { describe, it, expect } = require('@jest/globals')

describe('CartPopup - formatOptions 数据格式化逻辑', () => {
  const formatOptions = (selectedOptions) => {
    if (!selectedOptions || !selectedOptions.length) return ''
    return selectedOptions.map(o => o.options.map(opt => opt.name).join(', ')).join(', ')
  }

  describe('formatOptions - 格式化选中选项显示', () => {
    it('应该正确处理空选项', () => {
      expect(formatOptions(null)).toBe('')
      expect(formatOptions(undefined)).toBe('')
      expect(formatOptions([])).toBe('')
    })

    it('应该格式化单个选项类别', () => {
      const options = [{
        options: [
          { id: 1, name: '大杯' }
        ]
      }]

      const result = formatOptions(options)

      expect(result).toBe('大杯')
    })

    it('应该格式化单个类别中的多个选项', () => {
      const options = [{
        options: [
          { id: 1, name: '全糖' },
          { id: 2, name: '去冰' }
        ]
      }]

      const result = formatOptions(options)

      expect(result).toBe('全糖, 去冰')
    })

    it('应该格式化多个选项类别', () => {
      const options = [
        {
          options: [{ id: 1, name: '大杯' }]
        },
        {
          options: [
            { id: 2, name: '全糖' },
            { id: 3, name: '热' }
          ]
        }
      ]

      const result = formatOptions(options)

      expect(result).toBe('大杯, 全糖, 热')
    })

    it('应该处理复杂的真实场景数据', () => {
      const options = [
        {
          options: [{ id: 101, name: '中杯' }]
        },
        {
          options: [{ id: 201, name: '七分糖' }]
        },
        {
          options: [{ id: 301, name: '正常冰' }]
        },
        {
          options: [
            { id: 401, name: '珍珠' },
            { id: 402, name: '椰果' }
          ]
        }
      ]

      const result = formatOptions(options)

      expect(result).toBe('中杯, 七分糖, 正常冰, 珍珠, 椰果')
    })

    it('应该处理选项名称包含特殊字符的情况', () => {
      const options = [{
        options: [
          { id: 1, name: 'OATLY燕麦奶（额外收费+5元）' },
          { id: 2, name: '少冰(微凉)' }
        ]
      }]

      const result = formatOptions(options)

      expect(result).toBe('OATLY燕麦奶（额外收费+5元）, 少冰(微凉)')
    })

    it('应该处理空的options数组在某个类别中', () => {
      const options = [
        {
          options: []
        },
        {
          options: [{ id: 2, name: '全糖' }]
        }
      ]

      const result = formatOptions(options)

      expect(result).toBe(', 全糖')
    })
  })
})
