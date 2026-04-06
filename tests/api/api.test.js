// 通过 jest.config.js 的 moduleNameMapper 映射到 tests/mocks/api.js
import { jest } from '@jest/globals'
import {
  getTagBoundProducts,
  createOrder,
  getOrders,
  getOrderDetail,
  getShopDetail,
  getTags,
  userRegister,
  userLogin,
  userLoginByToken,
  submitOrder,
  userWeChatLogin,
  getUserInfo
} from '@/utils/api'

// Mock storage module
jest.mock('@/store/storage', () => {
  const store = {}
  return {
    storage: {
      getItem: jest.fn((key) => store[key] || ''),
      setItem: jest.fn((key, value) => { store[key] = value }),
      removeItem: jest.fn((key) => { delete store[key] }),
      clear: jest.fn(() => { for (const key in store) delete store[key] })
    }
  }
})

// Mock auth-utils
jest.mock('@/utils/auth-utils', () => ({
  silentLogin: jest.fn(() => Promise.resolve(false))
}))

import { storage } from '@/store/storage'

describe('API 接口响应解析测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    global.uni.request = jest.fn((options) => {
      options.success({
        statusCode: 200,
        data: { code: 200, data: {} },
        header: {}
      })
    })
  })

  describe('getTagBoundProducts - 根据标签获取商品列表', () => {
    it('应该正确解析成功响应 (200)', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          message: 'success',
          data: {
            list: [
              { id: 1, name: '商品1', price: 10 },
              { id: 2, name: '商品2', price: 20 }
            ],
            total: 2,
            page: 1,
            pageSize: 20
          }
        },
        header: { 'content-type': 'application/json' }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await getTagBoundProducts({ tag_id: 1, page: 1, pageSize: 20 })

      expect(result.status).toBe(200)
      expect(result.data).toBeDefined()
      expect(result.data.code).toBe(200)
      expect(result.data.data.list).toHaveLength(2)
      expect(result.data.data.total).toBe(2)
      expect(result.headers).toBeDefined()
    })

    it('应该处理空列表响应', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          data: { list: [], total: 0, page: 1, pageSize: 20 }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await getTagBoundProducts({ tag_id: 1, page: 1, pageSize: 20 })

      expect(result.status).toBe(200)
      expect(result.data.data.list).toHaveLength(0)
      expect(result.data.data.total).toBe(0)
    })

    it('应该处理带规格选项的商品数据', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          data: {
            list: [
              {
                id: 1,
                name: '奶茶',
                price: 15,
                option_categories: [
                  {
                    id: 1,
                    name: '糖度',
                    is_required: true,
                    options: [
                      { id: 1, name: '全糖', price_adjustment: 0 },
                      { id: 2, name: '半糖', price_adjustment: 0 }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await getTagBoundProducts({ tag_id: 1 })

      expect(result.data.data.list[0].option_categories).toBeDefined()
      expect(result.data.data.list[0].option_categories[0].options).toHaveLength(2)
    })
  })

  describe('createOrder - 创建订单', () => {
    it('应该正确解析创建订单的成功响应', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          message: '订单创建成功',
          data: {
            order_id: 'ORD20240101001',
            order_no: 'NO123456789',
            status: 0,
            total_amount: 35.5,
            items: [
              { product_id: 1, quantity: 2, price: 15 },
              { product_id: 2, quantity: 1, price: 5.5 }
            ],
            created_at: '2024-01-01T12:00:00Z'
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const orderData = {
        items: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ]
      }

      const result = await createOrder(orderData)

      expect(result.status).toBe(200)
      expect(result.data.code).toBe(200)
      expect(result.data.data.order_id).toBe('ORD20240101001')
      expect(result.data.data.items).toHaveLength(2)
      expect(typeof result.data.data.total_amount).toBe('number')
    })

    it('应该处理创建失败的情况', async () => {
      const mockResponse = {
        statusCode: 400,
        data: {
          code: 400,
          message: '库存不足',
          data: null
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await createOrder({})

      expect(result.status).toBe(400)
      expect(result.data.code).toBe(400)
      expect(result.data.message).toContain('库存不足')
    })
  })

  describe('getOrders - 获取用户订单列表', () => {
    it('应该正确解析订单列表的分页响应', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          data: {
            list: [
              {
                id: 1,
                order_no: 'NO001',
                status: 0,
                total_amount: 50,
                created_at: '2024-01-01T10:00:00Z'
              },
              {
                id: 2,
                order_no: 'NO002',
                status: 3,
                total_amount: 30,
                created_at: '2024-01-02T14:00:00Z'
              }
            ],
            total: 2,
            page: 1,
            pageSize: 10
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await getOrders({ user_id: 'user123', page: 1, pageSize: 10 })

      expect(result.status).toBe(200)
      expect(result.data.data.list).toHaveLength(2)
      expect(result.data.data.total).toBe(2)
      expect(result.data.data.page).toBe(1)
      expect([0, 3]).toContain(result.data.data.list[0].status)
      expect(typeof result.data.data.list[0].total_amount).toBe('number')
    })
  })

  describe('getOrderDetail - 获取订单详情', () => {
    it('应该正确解析包含完整信息的订单详情', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          data: {
            id: 1,
            order_no: 'NO001',
            status: 2,
            status_text: '制作中',
            total_amount: 88,
            discount_amount: 5,
            final_amount: 83,
            items: [
              {
                id: 1,
                product_name: '拿铁咖啡',
                quantity: 2,
                unit_price: 28,
                subtotal: 56,
                selected_options: [
                  { category_name: '温度', option_name: '热' },
                  { category_name: '糖度', option_name: '半糖' }
                ]
              }
            ],
            shop_info: {
              id: 1,
              name: '测试店铺'
            },
            remark: '少冰'
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await getOrderDetail(1)

      expect(result.status).toBe(200)
      expect(result.data.data.id).toBe(1)
      expect(result.data.data.items[0].selected_options).toHaveLength(2)
      expect(result.data.data.total_amount).toBe(88)
      expect(result.data.data.final_amount).toBe(83)
      expect(result.data.data.shop_info.name).toBe('测试店铺')
    })
  })

  describe('getShopDetail - 获取店铺详情', () => {
    it('应该正确解析店铺完整信息', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          data: {
            id: 1,
            name: '星巴克旗舰店',
            address: '北京市朝阳区xxx路',
            business_hours: '08:00-22:00',
            tags_count: 10,
            products_count: 100
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await getShopDetail()

      expect(result.status).toBe(200)
      expect(result.data.data.name).toBe('星巴克旗舰店')
      expect(result.data.data.tags_count).toBe(10)
    })
  })

  describe('getTags - 获取标签列表', () => {
    it('应该正确解析标签列表及其排序', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          data: [
            { id: 1, name: '热门推荐', sort_order: 1 },
            { id: 2, name: '饮品', sort_order: 2 },
            { id: 3, name: '甜点', sort_order: 3 }
          ]
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await getTags()

      expect(result.status).toBe(200)
      expect(result.data.data).toHaveLength(3)
      expect(result.data.data.every(tag => tag.id && tag.name)).toBe(true)
    })
  })

  describe('userRegister - 用户注册', () => {
    it('应该正确解析注册成功的响应', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          message: '注册成功',
          data: {
            user_id: 'user_new_001',
            username: 'testuser',
            token: 'jwt_token_xxxxxx'
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await userRegister({ username: 'testuser', password: 'password123' })

      expect(result.status).toBe(200)
      expect(result.data.code).toBe(200)
      expect(result.data.data.user_id).toBe('user_new_001')
      expect(result.data.data.token).toBeDefined()
    })
  })

  describe('userLogin - 用户登录', () => {
    it('应该正确解析登录成功并返回token和用户信息', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          message: '登录成功',
          data: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
              id: 'user_001',
              username: 'testuser',
              role: 'customer'
            }
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await userLogin({ username: 'testuser', password: 'password123' })

      expect(result.status).toBe(200)
      expect(result.data.code).toBe(200)
      expect(result.data.data.token).toBeTruthy()
      expect(result.data.data.user.role).toBe('customer')
    })
  })

  describe('userLoginByToken - 令牌登录', () => {
    it('应该正确解析临时令牌登录的响应', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          message: '登录成功',
          data: {
            token: 'temp_shop_token_xxx',
            shop_id: 'shop_001',
            expires_in: 86400
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await userLoginByToken({ token: 'temp_token_123' })

      expect(result.status).toBe(200)
      expect(result.data.data.shop_id).toBe('shop_001')
      expect(result.data.data.expires_in).toBe(86400)
    })
  })

  describe('submitOrder - 提交订单（旧版兼容）', () => {
    it('应该正确解析旧版提交订单的响应', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          message: '下单成功',
          data: {
            order_id: 12345,
            amount: 66.5
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await submitOrder({ products: [{ id: 1, qty: 2 }], total: 66.5 })

      expect(result.status).toBe(200)
      expect(result.data.data.order_id).toBe(12345)
    })
  })

  describe('userWeChatLogin - 微信小程序授权登录', () => {
    it('应该正确解析微信登录成功响应', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          message: '微信登录成功',
          data: {
            token: 'wx_jwt_token_xxx',
            user: {
              openid: 'oXXXX_xxxxxxxxxxxx',
              is_new_user: false
            }
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await userWeChatLogin({ code: 'wx_auth_code_123' })

      expect(result.status).toBe(200)
      expect(result.data.data.token).toBeDefined()
      expect(result.data.data.user.openid).toBeTruthy()
      expect(result.data.data.user.is_new_user).toBe(false)
    })
  })

  describe('getUserInfo - 获取当前登录用户信息', () => {
    it('应该正确解析完整的用户信息', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          data: {
            id: 'user_001',
            username: 'testuser',
            points: 1500,
            level: 'gold'
          }
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      storage.getItem.mockReturnValue('valid_token')

      const result = await getUserInfo()

      expect(result.status).toBe(200)
      expect(result.data.data.points).toBe(1500)
      expect(result.data.data.level).toBe('gold')
    })
  })

  describe('网络请求异常处理', () => {
    it('应该处理网络连接失败', async () => {
      global.uni.request.mockImplementation((options) => {
        options.fail({ errMsg: 'request:fail net::ERR_CONNECTION_REFUSED' })
      })

      try {
        await getShopDetail()
        throw new Error('Expected function to throw')
      } catch (error) {
        expect(error.errMsg).toContain('ERR_CONNECTION_REFUSED')
      }
    })
  })

  describe('HTTP 状态码处理', () => {
    it('应该处理 500 服务器内部错误', async () => {
      const mockResponse = {
        statusCode: 500,
        data: {
          code: 500,
          message: '服务器内部错误',
          data: null
        }
      }

      global.uni.request.mockImplementation((options) => {
        options.success(mockResponse)
      })

      const result = await getShopDetail()

      expect(result.status).toBe(500)
      expect(result.data.code).toBe(500)
    })
  })

  describe('请求拦截器验证', () => {
    it('应该正确传递请求参数到 uni.request', async () => {
      let capturedOptions = null
      global.uni.request.mockImplementation((options) => {
        capturedOptions = options
        options.success({
          statusCode: 200,
          data: { code: 200, data: {} }
        })
      })

      await getShopDetail()

      expect(capturedOptions).toBeDefined()
      expect(capturedOptions.method).toBe('GET')
      expect(capturedOptions.url).toContain('/shop/detail')
    })

    it('应该在请求头中包含 Content-Type', async () => {
      let capturedOptions = null
      global.uni.request.mockImplementation((options) => {
        capturedOptions = options
        options.success({
          statusCode: 200,
          data: { code: 200, data: {} }
        })
      })

      await createOrder({ items: [] })

      expect(capturedOptions.header['Content-Type']).toBe('application/json')
    })
  })
})
