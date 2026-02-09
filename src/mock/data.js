export const mockData = {
  shopDetail: {
    id: 1,
    name: 'OrderEase 示例店铺',
    description: '为您提供美味的餐点',
    tags: [
      { id: 1, name: '热销推荐' },
      { id: 2, name: '主食' },
      { id: 3, name: '饮品' },
      { id: 4, name: '小吃' },
      { id: 5, name: '甜点' }
    ]
  },

  products: {
    1: [
      {
        id: 1,
        name: '招牌红烧肉',
        price: 38,
        image_url: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=红烧肉',
        description: '精选五花肉，慢火炖煮，肥而不腻',
        option_categories: [
          {
            id: 1,
            name: '辣度',
            is_required: true,
            is_multiple: false,
            options: [
              { id: 1, name: '不辣', price_adjustment: 0 },
              { id: 2, name: '微辣', price_adjustment: 0 },
              { id: 3, name: '中辣', price_adjustment: 0 },
              { id: 4, name: '特辣', price_adjustment: 0 }
            ]
          },
          {
            id: 2,
            name: '份量',
            is_required: true,
            is_multiple: false,
            options: [
              { id: 5, name: '小份', price_adjustment: -5 },
              { id: 6, name: '标准份', price_adjustment: 0 },
              { id: 7, name: '大份', price_adjustment: 8 }
            ]
          }
        ]
      },
      {
        id: 2,
        name: '宫保鸡丁',
        price: 32,
        image_url: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=宫保鸡丁',
        description: '经典川菜，麻辣鲜香',
        option_categories: [
          {
            id: 3,
            name: '辣度',
            is_required: true,
            is_multiple: false,
            options: [
              { id: 8, name: '不辣', price_adjustment: 0 },
              { id: 9, name: '微辣', price_adjustment: 0 },
              { id: 10, name: '中辣', price_adjustment: 0 }
            ]
          }
        ]
      },
      {
        id: 3,
        name: '糖醋排骨',
        price: 42,
        image_url: 'https://via.placeholder.com/200x200/FFE66D/FFFFFF?text=糖醋排骨',
        description: '酸甜可口，老少皆宜',
        option_categories: []
      }
    ],
    2: [
      {
        id: 4,
        name: '扬州炒饭',
        price: 18,
        image_url: 'https://via.placeholder.com/200x200/95E1D3/FFFFFF?text=扬州炒饭',
        description: '粒粒分明，配料丰富',
        option_categories: [
          {
            id: 4,
            name: '加料',
            is_required: false,
            is_multiple: true,
            options: [
              { id: 11, name: '加蛋', price_adjustment: 2 },
              { id: 12, name: '加火腿', price_adjustment: 5 },
              { id: 13, name: '加虾仁', price_adjustment: 8 }
            ]
          }
        ]
      },
      {
        id: 5,
        name: '牛肉面',
        price: 22,
        image_url: 'https://via.placeholder.com/200x200/F38181/FFFFFF?text=牛肉面',
        description: '汤浓面劲，牛肉鲜嫩',
        option_categories: []
      }
    ],
    3: [
      {
        id: 6,
        name: '珍珠奶茶',
        price: 15,
        image_url: 'https://via.placeholder.com/200x200/A8E6CF/FFFFFF?text=珍珠奶茶',
        description: '经典台式奶茶',
        option_categories: [
          {
            id: 5,
            name: '甜度',
            is_required: true,
            is_multiple: false,
            options: [
              { id: 14, name: '无糖', price_adjustment: 0 },
              { id: 15, name: '三分糖', price_adjustment: 0 },
              { id: 16, name: '五分糖', price_adjustment: 0 },
              { id: 17, name: '七分糖', price_adjustment: 0 },
              { id: 18, name: '全糖', price_adjustment: 0 }
            ]
          },
          {
            id: 6,
            name: '冰度',
            is_required: true,
            is_multiple: false,

            options: [
              { id: 19, name: '去冰', price_adjustment: 0 },
              { id: 20, name: '少冰', price_adjustment: 0 },
              { id: 21, name: '正常冰', price_adjustment: 0 }
            ]
          },
          {
            id: 8,
            name: '加料',
            is_required: false,
            is_multiple: true,

            options: [
              { id: 25, name: '珍珠', price_adjustment: 0 },
              { id: 26, name: '椰果', price_adjustment: 1 },
              { id: 27, name: '布丁', price_adjustment: 2 }
            ]
          }
        ]
      },
      {
        id: 7,
        name: '柠檬红茶',
        price: 12,
        image_url: 'https://via.placeholder.com/200x200/FFD93D/FFFFFF?text=柠檬红茶',
        description: '清爽解腻',
        option_categories: []
      }
    ],
    4: [
      {
        id: 8,
        name: '炸鸡翅',
        price: 16,
        image_url: 'https://via.placeholder.com/200x200/FF8B94/FFFFFF?text=炸鸡翅',
        description: '外酥里嫩',
        option_categories: [
          {
            id: 7,
            name: '口味',
            is_required: true,
            is_multiple: false,

            options: [
              { id: 22, name: '原味', price_adjustment: 0 },
              { id: 23, name: '香辣', price_adjustment: 0 },
              { id: 24, name: '蒜香', price_adjustment: 0 }
            ]
          }
        ]
      },
      {
        id: 9,
        name: '薯条',
        price: 10,
        image_url: 'https://via.placeholder.com/200x200/FFD700/FFFFFF?text=薯条',
        description: '金黄酥脆',
        option_categories: []
      }
    ],
    5: [
      {
        id: 10,
        name: '提拉米苏',
        price: 25,
        image_url: 'https://via.placeholder.com/200x200/D4A5A5/FFFFFF?text=提拉米苏',
        description: '意式经典甜点',
        option_categories: []
      },
      {
        id: 11,
        name: '芒果布丁',
        price: 18,
        image_url: 'https://via.placeholder.com/200x200/FFB347/FFFFFF?text=芒果布丁',
        description: '新鲜芒果制作',
        option_categories: []
      }
    ],
    '-1': [
      {
        id: 12,
        name: '每日例汤',
        price: 8,
        image_url: 'https://via.placeholder.com/200x200/87CEEB/FFFFFF?text=例汤',
        description: '当日例汤',
        option_categories: []
      }
    ]
  },

  orders: [
    {
      id: 1111111111111111111,
      user_id: 9876543210987654321,
      shop_id: 1234567890,
      total_price: 76,
      status: 2,
      remark: '',
      created_at: '2025-02-06T10:30:00Z',
      updated_at: '2025-02-06T10:30:00Z',
      items: [
        {
          id: 2222222222222222222,
          order_id: 1111111111111111111,
          product_id: 1,
          product_name: '招牌红烧肉',
          product_image: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=红烧肉',
          quantity: 2,
          price: 38,
          subtotal: 76,
          options: [
            {
              id: 3333333333333333333,
              item_id: 2222222222222222222,
              category_name: '辣度',
              option_name: '中辣',
              price_adjustment: 0
            },
            {
              id: 4444444444444444444,
              item_id: 2222222222222222222,
              category_name: '份量',
              option_name: '大份',
              price_adjustment: 8
            }
          ]
        }
      ]
    },
    {
      id: 5555555555555555555,
      user_id: 9876543210987654321,
      shop_id: 1234567890,
      total_price: 89.80,
      status: 1,
      remark: '请尽快处理',
      created_at: '2025-02-06T10:30:00Z',
      updated_at: '2025-02-06T10:30:00Z',
      items: [
        {
          id: 6666666666666666666,
          order_id: 5555555555555555555,
          product_id: 6,
          product_name: '珍珠奶茶',
          product_image: 'https://via.placeholder.com/200x200/A8E6CF/FFFFFF?text=珍珠奶茶',
          quantity: 2,
          price: 28,
          subtotal: 56,
          options: [
            {
              id: 7777777777777777777,
              item_id: 6666666666666666666,
              category_name: '杯型',
              option_name: '大杯',
              price_adjustment: 5
            },
            {
              id: 8888888888888888888,
              item_id: 6666666666666666666,
              category_name: '甜度',
              option_name: '五分糖',
              price_adjustment: 0
            }
          ]
        }
      ]
    },
    {
      id: 2222222222222222222,
      user_id: 9876543210987654321,
      shop_id: 1234567890,
      total_price: 54,
      status: 3,
      remark: '',
      created_at: '2025-02-05T18:20:00Z',
      updated_at: '2025-02-05T18:20:00Z',
      items: [
        {
          id: 9999999999999999999,
          order_id: 2222222222222222222,
          product_id: 2,
          product_name: '宫保鸡丁',
          product_image: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=宫保鸡丁',
          quantity: 1,
          price: 32,
          subtotal: 32,
          options: [
            {
              id: 1000000000000000000,
              item_id: 9999999999999999999,
              category_name: '辣度',
              option_name: '微辣',
              price_adjustment: 0
            }
          ]
        },
        {
          id: 1111111111111111112,
          order_id: 2222222222222222222,
          product_id: 4,
          product_name: '扬州炒饭',
          product_image: 'https://via.placeholder.com/200x200/95E1D3/FFFFFF?text=扬州炒饭',
          quantity: 1,
          price: 22,
          subtotal: 22,
          options: []
        }
      ]
    },
    {
      id: 3333333333333333333,
      user_id: 9876543210987654321,
      shop_id: 1234567890,
      total_price: 15,
      status: 3,
      remark: '',
      created_at: '2025-02-04T12:00:00Z',
      updated_at: '2025-02-04T12:00:00Z',
      items: [
        {
          id: 1222222222222222222,
          order_id: 3333333333333333333,
          product_id: 6,
          product_name: '珍珠奶茶',
          product_image: 'https://via.placeholder.com/200x200/A8E6CF/FFFFFF?text=珍珠奶茶',
          quantity: 1,
          price: 15,
          subtotal: 15,
          options: [
            {
              id: 1333333333333333333,
              item_id: 1222222222222222222,
              category_name: '甜度',
              option_name: '七分糖',
              price_adjustment: 0
            },
            {
              id: 1444444444444444444,
              item_id: 1222222222222222222,
              category_name: '冰度',
              option_name: '少冰',
              price_adjustment: 0
            }
          ]
        }
      ]
    },
    {
      id: 4444444444444444444,
      user_id: 9876543210987654321,
      shop_id: 1234567890,
      total_price: 42,
      status: 0,
      remark: '',
      created_at: '2025-02-07T09:00:00Z',
      updated_at: '2025-02-07T09:00:00Z',
      items: [
        {
          id: 1555555555555555555,
          order_id: 4444444444444444444,
          product_id: 3,
          product_name: '糖醋排骨',
          product_image: 'https://via.placeholder.com/200x200/FFE66D/FFFFFF?text=糖醋排骨',
          quantity: 1,
          price: 42,
          subtotal: 42,
          options: []
        }
      ]
    },
    {
      id: 6666666666666666666,
      user_id: 9876543210987654321,
      shop_id: 1234567890,
      total_price: 37,
      status: 1,
      remark: '少放辣',
      created_at: '2025-02-07T11:30:00Z',
      updated_at: '2025-02-07T11:30:00Z',
      items: [
        {
          id: 1666666666666666666,
          order_id: 6666666666666666666,
          product_id: 2,
          product_name: '宫保鸡丁',
          product_image: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=宫保鸡丁',
          quantity: 1,
          price: 32,
          subtotal: 32,
          options: [
            {
              id: 1777777777777777777,
              item_id: 1666666666666666666,
              category_name: '辣度',
              option_name: '不辣',
              price_adjustment: 0
            }
          ]
        },
        {
          id: 1888888888888888888,
          order_id: 6666666666666666666,
          product_id: 5,
          product_name: '牛肉面',
          product_image: 'https://via.placeholder.com/200x200/F38181/FFFFFF?text=牛肉面',
          quantity: 1,
          price: 5,
          subtotal: 5,
          options: []
        }
      ]
    }
  ],

  users: {
    'testuser': {
      id: 1,
      username: 'testuser',
      password: '123456',
      phone: '13800138000',
      email: 'test@example.com'
    }
  },

  tokens: {
    'demo123': {
      id: 1,
      username: 'demo用户',
      phone: '13900139000'
    }
  }
}

export default mockData
