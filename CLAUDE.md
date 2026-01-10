# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OrderEase-FrontUI is a Vue 3 mobile ordering frontend designed for WeChat integration. It's a shop/product ordering system where users can browse products by category, add items to cart with customizable options, and submit orders.

## Tech Stack

- **Vue 3** with Composition API (`<script setup>`)
- **Vite** for build tooling
- **Vue Router** for navigation with authentication guards
- **Vant** - Primary UI component library (mobile-first design)
- **Element Plus** - Secondary UI library (used alongside Vant)
- **Axios** for API calls

## Development Commands

```bash
npm run dev          # Start development server on port 3001
npm run build        # Build for production
npm run build:prod   # Build with production mode
npm run preview      # Preview production build locally
```

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

## Key Architecture Concepts

### Base Path Configuration

The app is deployed with a base path `/order-ease-iui/`. This is configured in:
- `vite.config.js` - `base: '/order-ease-iui/'`
- `vite.config.js` - server proxy to `http://localhost:8080` for `/api` routes
- `src/router/index.js` - `createWebHistory('/order-ease-iui/')`
- `nginx.conf` - location blocks use `/order-ease-iui/`

Always use this base path when configuring routes or navigation.

### Authentication Flow

Authentication is handled via:
1. **Token-based**: JWT token stored in `localStorage.getItem('token')`
2. **User info**: Stored in `localStorage.getItem('user_info')`
3. **Route guards**: `src/router/index.js` has global `beforeEach` guard
   - Routes requiring auth have `meta: { requiresAuth: true }`
   - Protected routes: `/orders`, `/mine`
   - On 401 error (API interceptor in `src/api/index.js`), redirects to login

Additional auth methods:
- **Token Login**: `/token-login` route for temporary shop-based auth
- **WeChat OAuth**: Configured via URL parameters (`shop_id`, `user_id`) that get stored to localStorage

### API Client Architecture

The Axios instance in `src/api/index.js` has automatic parameter injection:

**Request Interceptor**:
- Automatically adds `Authorization: Bearer <token>` header if token exists
- Automatically injects `shop_id` and `user_id` from localStorage into:
  - Query parameters for GET requests without body
  - Request body for POST/PUT with JSON data
  - Query parameters for FormData (file uploads)

**Response Interceptor**:
- Handles 401 errors by clearing auth data and redirecting to login

**API Base URL**: Configured in `src/utils/constants.js` as `http://127.0.0.1:8080/api/order-ease/v1`

### URL Parameter Handling

Route guard in `src/router/index.js` automatically extracts `shop_id` and `user_id` from query params and stores them in localStorage. This is used for shop context and user identification.

### Product Options System

Products can have customizable options (`option_categories` array):
- Each category has `is_required` (boolean) for single/multi-select behavior
- Options have `price_adjustment` that adds to base price
- Cart items with options generate a unique `cartItemId` key based on selected options
- See `src/views/home/index.vue` for the full implementation of option selection and cart management

### Component Structure

**Main Layout** (`src/App.vue`):
- `CommonNavBar` - Top navigation with shop name
- `router-view` - Page content
- `van-tabbar` - Bottom navigation (Home, Orders, Mine)

**Key Views**:
- `src/views/home/index.vue` - Main ordering page with category sidebar and product grid
- `src/views/Orders.vue` - Order history
- `src/views/Mine.vue` - User profile
- `src/views/Login.vue` - User login
- `src/views/Register.vue` - User registration
- `src/views/TokenLogin.vue` - Token-based login

**Key Components**:
- `CategoryList` - Left sidebar for product categories
- `ProductList` - Grid of products with add-to-cart functionality
- `ShoppingCart` - Bottom cart bar with popup for item management
- `ProductCard` - Individual product display
- `CommonNavBar` - Shared top navigation

### Path Aliases

The `@` alias is configured to resolve to `src/` directory (in `vite.config.js`).

### UI Library Usage

**Vant** is the primary UI library. Components are registered in `src/main.js`. When adding new Vant components:
1. Import from `vant`
2. Import CSS if needed (most use `vant/lib/index.css`)
3. Register with `app.use()`

**Element Plus** is also available with all icons pre-registered globally.
