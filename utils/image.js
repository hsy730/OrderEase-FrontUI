// 获取图片完整 URL
export function getImageUrl(imagePath) {
  if (!imagePath) return ''

  // 如果已经是完整 URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // 构建后端服务器 URL
  const API_BASE_URL = 'http://127.0.0.1:8080/api/order-ease/v1'

  return `${API_BASE_URL}/product/image?path=${encodeURIComponent(imagePath)}`
}