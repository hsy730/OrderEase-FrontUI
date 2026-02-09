# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

OrderEase-FrontUI is a uni-app based mobile ordering application designed for WeChat mini-programs. It's a shop/product ordering system where users can browse products by category, add items to cart with customizable options, and submit orders.

**Important:** This project uses **uni-app framework** (not standard Vue 3). While it uses Vue 3 syntax with Composition API, the framework provides cross-platform capabilities for WeChat mini-programs, H5, and other platforms.

## Tech Stack

- **uni-app** - Cross-platform framework for WeChat mini-programs, H5, and other platforms
- **Vue 3** with Composition API (`<script setup>`)
- **Vite** for build tooling
- **Pinia** for state management
- **uni-ui** - Primary UI component library (uni-app specific components)
- **Custom request wrapper** - Built-in HTTP client with interceptors

## Development Commands

```bash
npm run dev:mp-weixin    # Start WeChat mini-program development
npm run build:mp-weixin  # Build for WeChat mini-program production
npm run dev:h5           # Start H5 web development server on port 3001
npm run build:h5         # Build for H5 web production
```

## Project Structure

### Core Architecture

This is a **uni-app project**, not a standard Vue 3 web app. Key differences:

1. **Routing**: Uses `pages.json` configuration instead of Vue Router. No `src/router/index.js` is used at runtime in uni-app.
2. **Navigation**: Uses `uni.navigateTo`, `uni.redirectTo`, `uni.switchTab` instead of router methods
3. **Storage**: Uses `uni.getStorageSync`, `uni.setStorageSync` instead of `localStorage`
4. **HTTP Requests**: Uses `uni.request` wrapped in custom request utility
5. **Lifecycle**: Uses uni-app specific lifecycle hooks (`onLaunch`, `onShow`, `onHide` in `App.vue`)

### Directory Layout

```
OrderEase-FrontUI/
├── api/              # API endpoint definitions
│   └── index.js      # All API functions
├── components/       # Reusable Vue components
├── pages/            # Page components (uni-app pages)
│   ├── home/        # Main ordering page
│   ├── orders/      # Order history
│   ├── mine/        # User profile
│   ├── login/       # Login page
│   ├── register/    # Registration page
│   └── order-detail/ # Order detail page
├── stores/          # Pinia state management
│   ├── cart.js      # Shopping cart state
│   ├── user.js      # User authentication state
│   └── order.js     # Order state
├── utils/           # Utility functions
│   ├── request.js   # HTTP request wrapper with interceptors
│   ├── constants.js # API constants
│   └── image.js     # Image URL handling
├── src/             # Source directory
│   ├── App.vue      # Root component
│   ├── main.js      # App entry point
│   ├── assets/      # Static assets (CSS, images)
│   ├── components/  # Components (duplicate of root components/)
│   └── router/      # Unused - uni-app uses pages.json
├── static/          # Static files (tabbar icons, etc.)
├── pages.json       # uni-app page configuration
├── manifest.json    # uni-app platform configuration
└── vite.config.js   # Vite build configuration
```

## Key Architecture Concepts

### uni-app Page Configuration

Pages are configured in `pages.json` (not Vue Router):
- Defines all pages in the app
- Configures tabBar with icons and selected states
- Sets navigation bar styles per page
- Enables pull-to-refresh for pages

**TabBar pages**: `/pages/home/index`, `/pages/orders/index`, `/pages/mine/index`

### Navigation in uni-app

Always use uni-app navigation methods:
```javascript
// Navigate to new page (push)
uni.navigateTo({ url: '/pages/order-detail/index?id=123' })

// Redirect (replace)
uni.redirectTo({ url: '/pages/login/index' })

// Switch to tabBar page
uni.switchTab({ url: '/pages/orders/index' })

// Navigate back
uni.navigateBack()
```

### Authentication Flow

Authentication is handled via:
1. **Token-based**: JWT token stored using `uni.getStorageSync('token')`
2. **User info**: Stored using `uni.getStorageSync('user_info')`
3. **User ID**: Stored using `uni.getStorageSync('user_id')`
4. **Shop ID**: Stored using `uni.getStorageSync('shop_id')`

**Pinia User Store** (`stores/user.js`):
- `login(loginData)` - Authenticate and store user data
- `logout()` - Clear all auth data
- `isLoggedIn` (computed) - Check authentication status
- `loadFromLocal()` - Restore state from storage
- Automatically syncs with uni-app storage

### API Client Architecture

The request utility in `utils/request.js` has automatic parameter injection:

**Request Interceptor**:
- Automatically adds `Authorization: Bearer <token>` header if token exists
- Automatically injects `shop_id` and `user_id` from uni-app storage:
  - GET requests: Added to query parameters
  - POST/PUT with JSON data: Added to request body
  - FormData (file uploads): Added to query parameters

**Response Interceptor**:
- Handles 401 errors by clearing auth data and redirecting to login page

**API Base URL**: Configured in `utils/constants.js` as `http://127.0.0.1:8080/api/order-ease/v1`

**Mock Mode**: Set `USE_MOCK = true` in `utils/constants.js` to use mock data

### Available API Endpoints

Located in `api/index.js`:
- `getShopDetail()` - Shop information
- `getTagBoundProducts(params)` - Products by category with pagination
- `createOrder(data)` - Submit order
- `getOrders(params)` - Order history with pagination
- `getOrderDetail(orderId)` - Single order details
- `userLogin(userData)` - Standard login
- `userRegister(userData)` - User registration
- `userLoginByToken(tokenData)` - Token-based login for temporary shop access

### State Management with Pinia

Three main stores in `stores/`:

**Cart Store** (`stores/cart.js`):
- `cartItems` - Array of items in cart
- `totalCount` (computed) - Total item count
- `totalPrice` (computed) - Total cart price
- `addToCart(product)` - Add item to cart
- `removeFromCart(cartItemId)` - Remove item
- `updateQuantity(cartItemId, count)` - Update item quantity
- `clearCart()` - Empty cart
- `loadCartFromLocal()` / `saveCartToLocal()` - Persist to storage

**User Store** (`stores/user.js`):
- `token`, `userInfo`, `userId` - Auth data
- `isLoggedIn` (computed) - Auth status
- `login(loginData)` - Authenticate
- `logout()` - Clear auth
- `loadFromLocal()` - Restore from storage

**Order Store** (`stores/order.js`):
- `orders` - Order list
- `orderDetail` - Current order detail
- `loading`, `currentPage`, `pageSize`, `noMoreData` - Pagination state
- `getOrderStatusText(status)` - Get status display text
- `getStatusIcon(status)` - Get status emoji

### Product Options System

Products can have customizable options (`option_categories` array):
- Each category has `is_required` (boolean) for single/multi-select behavior
- Options have `price_adjustment` that adds to base price
- Cart items with options generate a unique `cartItemId` key based on selected options
- See `pages/home/index.vue` for full implementation of option selection

**Cart Item Identification**:
Same product with different option combinations creates separate cart items. Unique `cartItemId` key includes serialized option data:
```javascript
const generateCartItemId = (item) => {
  if (item.selectedOptions && item.selectedOptions.length > 0) {
    const sortedOptions = [...item.selectedOptions].sort((a, b) =>
      a.category.localeCompare(b.category)
    )
    return `${item.id}-${JSON.stringify(sortedOptions)}`
  }
  return `${item.id}`
}
```

### Cart Interaction Patterns

**Products WITH Options**:
- Always show "选规格" (Select Options) button
- Quantity badge shows total in cart across all variants
- Clicking opens options popup (`uni-popup` component)
- Cannot decrement from product list (must use cart popup)

**Products WITHOUT Options**:
- Direct add to cart
- Changes sync immediately to cart store

### Component Communication

- Parent to Child: Props
- Child to Parent: Custom events (`@event-name`)
- Cross-component: Pinia stores
- Event emission: `defineEmits(['event-name'])`

### Path Aliases

The `@` alias is configured to resolve to `src/` directory (in `vite.config.js`).

### Styling

- Uses `rpx` units for responsive layout (uni-app standard)
- PostCSS plugin `postcss-pxtorpx-pro` converts px to rpx (0.5 ratio)
- CSS custom properties defined in `src/assets/theme-blue-orange.css`
- Main styles imported in `src/App.vue`

### Image Handling

Backend images use the utility in `utils/image.js`:
```javascript
getImageUrl(imagePath) // Returns full backend URL
```
Converts relative paths to `${API_BASE_URL}/product/image?path=${imagePath}`.

## Development Notes

### Adding New Pages

1. Create page component in `pages/your-page/index.vue`
2. Register in `pages.json`:
```json
{
  "path": "pages/your-page/index",
  "style": {
    "navigationBarTitleText": "Page Title"
  }
}
```

### Using uni-app Components

Import and use uni-app components directly:
```vue
<template>
  <uni-popup ref="popup" type="bottom">
    <!-- content -->
  </uni-popup>
</template>
```

Common uni-app components:
- `uni-popup` - Modal/popup dialogs
- `uni-icons` - Icons
- `uni-transition` - Transitions/animations

### Storage Persistence

Always use uni-app storage APIs:
```javascript
// Read
uni.getStorageSync('key')

// Write
uni.setStorageSync('key', value)

// Remove
uni.removeStorageSync('key')
```

Pinia stores automatically sync with storage for cart, user, and order data.

### Platform-Specific Code

Use conditional compilation for platform-specific code:
```javascript
// #ifdef H5
// H5-specific code
// #endif

// #ifdef MP-WEIXIN
// WeChat mini-program specific code
// #endif
```

### API Request Pattern

Always import API functions from `@/api`:
```javascript
import { getProducts, createOrder } from '@/api'

const res = await getProducts({ tag_id: '1', page: 1, pageSize: 10 })
```

Request utility automatically handles:
- Authorization headers
- shop_id/user_id injection
- Error handling and 401 redirects

### Component Registration

Components are auto-imported in uni-app. Just import in template or script:
```vue
<script setup>
import ProductCard from '@/components/ProductCard.vue'
</script>
```

## Testing and Debugging

### WeChat DevTools

For mini-program development:
1. Run `npm run dev:mp-weixin`
2. Open WeChat DevTools
3. Import project from `dist/dev/mp-weixin/` directory

### H5 Development

For web development:
1. Run `npm run dev:h5`
2. Access at `http://localhost:3001`
3. Dev server proxies `/api` requests to `http://localhost:8080`

### Mock Data

Set `USE_MOCK = true` in `utils/constants.js` to use mock data instead of real API.

## Important Files Reference

- `pages.json` - Page and tabBar configuration
- `manifest.json` - Platform-specific configuration (WeChat appid, permissions)
- `vite.config.js` - Build configuration and path aliases
- `utils/request.js` - HTTP client with interceptors
- `utils/constants.js` - API base URL and mock mode
- `stores/cart.js` - Cart state management
- `stores/user.js` - User authentication state
- `api/index.js` - All API endpoint definitions
- `pages/home/index.vue` - Main ordering page with cart logic
