import mockData from './data.js'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {
  async getShopDetail() {
    await delay()
    return {
      status: 200,
      data: mockData.shopDetail
    }
  },

  async getTagBoundProducts(params) {
    await delay()
    const { tag_id, page = 1, pageSize = 20 } = params
    const products = mockData.products[tag_id] || []
    
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedProducts = products.slice(start, end)
    
    return {
      status: 200,
      data: {
        code: 200,
        data: paginatedProducts,
        total: products.length,
        page,
        pageSize
      }
    }
  },

  async getOrders(params) {
    await delay()
    const { user_id, page = 1, pageSize = 10 } = params
    
    const userOrders = mockData.orders.filter(order => order.user_id === user_id)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedOrders = userOrders.slice(start, end)
    
    return {
      status: 200,
      data: {
        code: 200,
        data: paginatedOrders,
        total: userOrders.length,
        page,
        pageSize
      }
    }
  },

  async getOrderDetail(orderId) {
    await delay()
    const order = mockData.orders.find(o => o.id === orderId)
    
    if (!order) {
      return {
        status: 404,
        data: {
          code: 404,
          message: '订单不存在'
        }
      }
    }
    
    return {
      status: 200,
      data: order
    }
  },

  async createOrder(orderData) {
    await delay()
    
    const newOrder = {
      id: Date.now(),
      user_id: orderData.user_id,
      status: '待取餐',
      total_price: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      created_at: new Date().toISOString(),
      items: orderData.items.map(item => {
        const product = Object.values(mockData.products)
          .flat()
          .find(p => p.id === item.product_id)
        
        return {
          product_id: item.product_id,
          product_name: product?.name || '未知商品',
          quantity: item.quantity,
          price: item.price,
          total_price: item.price * item.quantity,
          image_url: product?.image_url || '',
          options: item.options || []
        }
      })
    }
    
    mockData.orders.unshift(newOrder)
    
    return {
      status: 200,
      data: {
        code: 200,
        message: '订单创建成功',
        data: newOrder
      }
    }
  },

  async userLogin(userData) {
    await delay()
    const { username, password } = userData
    
    const user = Object.values(mockData.users).find(
      u => u.username === username && u.password === password
    )
    
    if (!user) {
      return {
        status: 401,
        data: {
          code: 401,
          error: '用户名或密码错误'
        }
      }
    }
    
    const token = `mock_token_${Date.now()}`
    
    return {
      status: 200,
      data: {
        code: 200,
        message: '登录成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email
        }
      }
    }
  },

  async userRegister(userData) {
    await delay()
    const { username, password, phone } = userData
    
    const existingUser = Object.values(mockData.users).find(
      u => u.username === username
    )
    
    if (existingUser) {
      return {
        status: 400,
        data: {
          code: 400,
          error: '用户名已存在'
        }
      }
    }
    
    const newUser = {
      id: Date.now(),
      username,
      password,
      phone: phone || '',
      email: ''
    }
    
    mockData.users[username] = newUser
    
    return {
      status: 200,
      data: {
        code: 200,
        message: '注册成功',
        user: {
          id: newUser.id,
          username: newUser.username,
          phone: newUser.phone
        }
      }
    }
  },

  async userLoginByToken(tokenData) {
    await delay()
    const { token } = tokenData
    
    const tokenInfo = mockData.tokens[token]
    
    if (!tokenInfo) {
      return {
        status: 401,
        data: {
          code: 401,
          error: '令牌无效'
        }
      }
    }
    
    return {
      status: 200,
      data: {
        code: 200,
        message: '登录成功',
        token,
        user: tokenInfo
      }
    }
  },

  async getTags() {
    await delay()
    return {
      status: 200,
      data: {
        code: 200,
        data: mockData.shopDetail.tags
      }
    }
  }
}

export default mockApi