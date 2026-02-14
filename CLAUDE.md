# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OrderEase-FrontUI is a Vue 3 mobile ordering frontend built with uni-app for multi-platform deployment. It supports H5 web and WeChat Mini Program, designed as a shop/product ordering system where users can browse products by category, add items to cart with customizable options, and submit orders.

## Tech Stack

- **Vue 3** with Composition API (`<script setup>`)
- **uni-app** for cross-platform development (H5 + WeChat Mini Program)
- **Vite** for build tooling
- **Axios** for API calls
- **uni-ui** - Primary UI component library (uni-app compatible)

## Development Commands

```bash
# H5 Development
npm run dev:h5            # Start H5 development server on port 3001
# Access at: http://localhost:3001/order-ease-iui/

# WeChat Mini Program Development
npm run dev:mp:weixin     # Build for WeChat Mini Program (output: dist/dev/mp-weixin)
# Use WeChat Developer Tools to open dist/dev/mp-weixin/ directory

# Production Build
npm run build:h5          # Build H5 for production (output: dist/h5)
npm run build:mp-weixin   # Build WeChat Mini Program for production (output: dist/build/mp-weixin)
npm run preview           # Preview production build locally
```

### Deployment Differences: H5 vs WeChat Mini Program

**H5 Deployment**:
- Self-hosted as a microservice (containerized or static files)
- Requires your own server (Nginx, Docker, CDN, etc.)
- Deployment options:
  - Docker: `docker build -t order-ease-frontend .` → `docker run -p 3001:80 order-ease-frontend`
  - Static: Deploy `dist/h5/` to any web server
  - Nginx config: Maps `/order-ease-iui/` to the H5 directory
- Access via URL: `http://your-domain.com/order-ease-iui/`

**WeChat Mini Program Deployment**:
- Hosted by WeChat platform (no server required on your side)
- Build output → Upload to WeChat Developer Tools → Submit for review → Publish
- WeChat platform handles all hosting and runtime
- Access via WeChat app (no URL path needed)

## Docker Deployment

```bash
docker build -t order-ease-frontend .
docker run -d -p 3001:80 --name order-ease-app order-ease-frontend
```

Or using docker-compose:
```bash
docker-compose up -d
```

Access at: `http://localhost:3001/order-ease-iui/`

Note: The Docker container uses nginx.conf which is already configured with `/order-ease-iui/` location block.

## Key Architecture Concepts

### Cross-Platform Architecture

The project uses **uni-app** to build a single codebase that deploys to:
- **H5**: Web browsers (development: `npm run dev`, production: `npm run build`)
- **WeChat Mini Program**: WeChat ecosystem (development: `npm run dev:mp-weixin`, production: `npm run build:mp-weixin`)

The build configuration in `vite.config.js` automatically detects the platform based on `UNI_PLATFORM` environment variable.

### Base Path Configuration

**H5 Base Path**: `/order-ease-iui/`
- H5 uses `/order-ease-iui/` as the base path prefix
- Reason: Unified deployment with multiple microservices under a single domain
  - OrderEase Backend: `/api/order-ease/v1/`
  - OrderEase Admin UI: `/order-ease-adminiui/`
  - OrderEase Customer UI (H5): `/order-ease-iui/`
- This enables organized URL structure and easier management of multiple components
- Configured in `vite.config.js`: `base: isH5 ? '/order-ease-iui/' : '/'`

**WeChat Mini Program**: No base path
- Mini Programs run within the WeChat ecosystem, not as web URLs
- No concept of URL paths or base path prefixes
- Uses its own routing system defined in `pages.json`
- All page paths are relative to the mini program root

**Routing Compatibility**:
- Both platforms use uni-app navigation APIs (`uni.navigateTo`, `uni.switchTab`, etc.)
- Route paths remain consistent: `/pages/login/login`, `/pages/index/index`, etc.
- Vite `base` config only affects H5 static asset references and HTML base tag
- uni-app automatically handles the base path difference during build

### Authentication Flow

Authentication is handled via:
1. **Token-based**: JWT token stored using unified storage API (`storage.getItem('token')`)
2. **User info**: Stored using unified storage API (`storage.getItem('user_info')`)
3. **Unified Storage**: `src/store/index.js` provides platform-agnostic storage:
   - H5: Uses `localStorage`
   - Mini Program: Uses `uni.getStorageSync()`

Additional auth methods:
- **Token Login**: `/pages/token-login/token-login` route for temporary shop-based auth
- **WeChat OAuth**: Configured via URL parameters (`shop_id`, `user_id`) that get stored to storage
- **WeChat Mini Program Authorization**: Implemented via `src/utils/wechat-auth.js` and `src/composables/useAuth.js`

### API Client Architecture

The project uses `uni.request` (uni-app native API) instead of Axios for cross-platform compatibility.

The API wrapper in `src/utils/api.js` has automatic parameter injection:

**Request Interceptor**:
- Automatically adds `Authorization: Bearer <token>` header if token exists
- Automatically injects `shop_id` and `user_id` from unified storage into:
  - Query parameters for GET requests without body
  - Request body for POST/PUT with JSON data
  - Query parameters for FormData (file uploads)

**Response Interceptor**:
- Handles 401 errors by clearing auth data and redirecting to login (using uni-app navigation)

**API Base URL**: Configured in `src/utils/constants.js` as `http://127.0.0.1:8080/api/order-ease/v1`
Note: This is hardcoded; there are no `.env` files in the project.

### URL Parameter Handling

For H5: URL parameters (`shop_id`, `user_id`) are extracted and stored to unified storage for shop context and user identification.

For Mini Program: Parameters are passed through navigation options or stored directly.

### Product Options System

Products can have customizable options (`option_categories` array):
- Each category has `is_required` (boolean) for single/multi-select behavior
- Options have `price_adjustment` that adds to base price
- Cart items with options generate a unique `cartItemId` key based on selected options
- See `src/views/home/index.vue` for the full implementation of option selection and cart management

### Component Structure

**Main Layout** (`pages.json` + TabBar):
- uni-app navigation system with tab bar configuration
- Pages: Home (`pages/index/index`), Orders (`pages/orders/orders`), Mine (`pages/mine/mine`)

**Key Pages** (in `src/pages/`):
- `index/index.vue` - Main ordering page with category sidebar and product
- `orders/orders.vue` - Order history
- `mine/mine.vue` - User profile
- `login/login.vue` - User login (with WeChat OAuth for Miniature Program)
- `register/register.vue` - User registration
- `token-login/token-login.vue` - Token-based login

**Key Components** (in `src/components/`):
Note: Component files are inlined within pages. The following components may be referenced in old documentation:
- `CategoryList` - Left sidebar for product categories
- `ProductList` - Grid of products with add-to-cart functionality
- `ShoppingCart` - Bottom cart bar with popup for item management
- `ProductCard` - Individual product display
- `CommonNavBar` - Shared top navigation

### Path Aliases

The `@` alias is configured to resolve to `src/` directory (in `vite.config.js`).

### UI Library Usage

**uni-app Native Components** are the primary UI elements for cross-platform compatibility. Key components:
- `view` - Container element (replaces `div`)
- `text` - Text element (replaces `span`)
- `image` - Image element (replaces `img`)
- `button` - Button element (replaces `<van-button>`)
- `input` - Input element (replaces `<van-field>`)
- `scroll-view` - Scrollable container
- `swiper` - Carousel/slider component

**uni-ui** components (optional) can be added for more complex UI needs:
- `uni-popup` - Modal popup (replaces `<van-popup>`)
- `uni-number-box` - Number stepper (replaces `<van-stepper>`)
- `uni-nav-bar` - Navigation bar (replaces `<van-nav-bar>`)

When adding new components, ensure they work on both H5 and Mini Program platforms.

### State Management

Uses unified storage for persistence (no Pinia/Vuex currently):
- Component-level `ref()` and `reactive()` for local state
- Unified `storage` API in `src/store/index.js` for:
  - token, user_info, shop_id, user_id persistence
  - Platform-agnostic storage (localStorage on H5, uni.getStorageSync on Mini Program)
- Props/events and `$emit()` for component communication

### Available API Endpoints

Located in `src/utils/api.js`:
- `getTagBoundProducts(params)` - Products by category
- `createOrder(data)` - Submit order
- `getOrders(params)` - Order history with pagination
- `getShopDetail()` - Shop information
- `getOrderDetail(orderId)` - Single order details
- `userRegister(userData)` - User registration
- `userLogin(userData)` - Standard login
- `userLoginByToken(tokenData)` - Token-based login
- `userWeChatLogin(wechatData)` - WeChat Mini Program authorization login
- `getTags()` - Category list

### Image Handling

Backend images use the utility in `src/utils/image.js`:
```javascript
getImageUrl(imagePath) // Returns full backend URL
```
Converts relative paths to `${API_BASE_URL}/product/image?path=${imagePath}`.

### Cart Interaction Patterns

**Products WITH Options**:
- Always show "选规格" (Select Options) button
- Quantity badge shows total in cart across all variants
- Clicking opens options popup
- Cannot decrement from product list (must use cart popup)

**Products WITHOUT Options**:
- Direct stepper control for increment/decrement
- Changes sync immediately to cart

**Cart Item Identification**:
Same product with different option combinations creates separate cart items. The unique `cartItemId` key includes serialized option data:
```javascript
const getCartItemKey = (item) => {
  if (item.selectedOptions?.length > 0) {
    return `${item.id}-${JSON.stringify(sortedOptions)}`
  }
  return `${item.id}`
}
```

### Project Migration Status

The project has been successfully migrated from traditional H5 + Vue Router to **uni-app cross-platform architecture**.

**Migration Steps Completed**:
1. ✅ Created unified storage layer (`src/store/index.js`) for cross-platform compatibility
2. ✅ Merged utility files and updated API layer to use unified storage
3. ✅ Migrated all pages to `src/pages/` directory
4. ✅ Configured `pages.json` for uni-app routing system
5. ✅ Removed Vue Router dependency
6. ✅ Updated build configuration for H5 root root deployment
7. ✅ Implemented WeChat Mini Program authorization login
8. ✅ Updated project documentation

**Key Changes**:
- All navigation now uses uni-app APIs (`uni.navigateTo`, `uni.switchTab`, etc.)
- H5 uses `/order-ease-iui/` base path for unified deployment
- Storage operations use unified `storage` API from `src/store/index.js`
- Platform-specific code can use conditional compilation: `// #ifdef H5` or `// #ifdef MP-WEIXIN`
- Vant and Element Plus are being phased out in favor of uni-app native components
