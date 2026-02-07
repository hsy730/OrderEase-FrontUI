<script>
export default {
  onLaunch() {
    console.log('App Launch')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
/* 全局CSS变量定义 */
page {
  /* 主色调 */
  --primary-blue: #1E40AF;
  --primary-blue-light: #3B82F6;

  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-muted: #e5e7eb;

  /* 文字颜色 */
  --text-primary: #111827;
  --text-secondary: #6B7280;

  /* 边框颜色 */
  --border-default: #d1d5db;
  --border-light: #e5e7eb;

  /* 圆角 */
  --radius-sm: 16rpx;  /* 8px → 16rpx */
  --radius-md: 24rpx;  /* 12px → 24rpx */
  --radius-lg: 32rpx;  /* 16px → 32rpx */

  /* 渐变 */
  --gradient-primary: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  --gradient-hover: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
  --gradient-accent: linear-gradient(135deg, #1E40AF 0%, #F97316 100%);

  /* 阴影 (小程序不支持复杂阴影,简化处理) */
  --shadow-sm: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
  --shadow-md: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 16rpx 24rpx rgba(0, 0, 0, 0.1);
  --shadow-float: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);

  /* 过渡 */
  --transition-base: 0.2s ease;

  /* 间距 */
  --spacing-xs: 8rpx;
  --spacing-sm: 16rpx;
  --spacing-md: 24rpx;
  --spacing-lg: 32rpx;

  /* 层级 */
  --z-fixed: 100;
}

/* 全局样式 */
page {
  background-color: #f5f5f5;
  font-size: 28rpx;
  color: #333333;
}

/* 重置样式 */
* {
  box-sizing: border-box;
}

view, text, image {
  display: block;
}

/* 通用类 */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

/* 文字类 */
.text-primary {
  color: var(--primary-blue);
}

.text-secondary {
  color: var(--text-secondary);
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

/* 间距类 */
.mt-xs { margin-top: 8rpx; }
.mt-sm { margin-top: 16rpx; }
.mt-md { margin-top: 24rpx; }
.mt-lg { margin-top: 32rpx; }

.mb-xs { margin-bottom: 8rpx; }
.mb-sm { margin-bottom: 16rpx; }
.mb-md { margin-bottom: 24rpx; }
.mb-lg { margin-bottom: 32rpx; }

.pt-xs { padding-top: 8rpx; }
.pt-sm { padding-top: 16rpx; }
.pt-md { padding-top: 24rpx; }
.pt-lg { padding-top: 32rpx; }

.pb-xs { padding-bottom: 8rpx; }
.pb-sm { padding-bottom: 16rpx; }
.pb-md { padding-bottom: 24rpx; }
.pb-lg { padding-bottom: 32rpx; }

.p-sm { padding: 16rpx; }
.p-md { padding: 24rpx; }
.p-lg { padding: 32rpx; }
</style>
