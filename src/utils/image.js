// 图片URL处理工具函数
import { API_BASE_URL } from '@/utils/constants';

/**
 * 确保URL是绝对路径
 * 在H5环境下，如果API_BASE_URL以/开头，浏览器会把图片src当作相对路径
 * 这会导致图片URL被加上当前页面的base path
 *
 * @param {string} url - 原始URL
 * @returns {string} 绝对URL
 */
const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;

  // 如果URL以/开头，需要添加当前页面的origin
  if (url.startsWith('/')) {
    // #ifdef H5
    return `${window.location.origin}${url}`;
    // #endif
    // #ifndef H5
    return url;
    // #endif
  }

  return url;
};

/**
 * 构建正确的后端图片URL
 * 与 api.js 保持一致，使用 API_BASE_URL 构建完整URL
 *
 * @param {string} imagePath - 图片路径（来自后端的image_url字段）
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const url = `${API_BASE_URL}/product/image?path=${encodeURIComponent(imagePath)}`;
  return ensureAbsoluteUrl(url);
};

/**
 * 构建用户头像URL
 * @param {string} avatarPath - 头像路径（来自后端的avatar字段）
 * @returns {string} 完整的头像URL
 */
export const getUserAvatarUrl = (avatarPath) => {
  if (!avatarPath) return '';

  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  const fileName = avatarPath.replace('/uploads/avatars/', '');
  const url = `${API_BASE_URL}/user/avatar?path=${encodeURIComponent(fileName)}`;
  return ensureAbsoluteUrl(url);
};
