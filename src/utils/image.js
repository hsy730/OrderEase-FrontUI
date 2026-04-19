// 图片URL处理工具函数
import { API_BASE_URL } from '@/utils/constants';

const getApiPrefix = () => import.meta.env.VITE_API_PREFIX || '/api/order-ease/v1';

/**
 * 构建正确的后端图片URL
 * - 小程序版本：使用 VITE_API_BASE_URL 构建完整URL
 * - H5版本：使用 API_BASE_URL（与 api.js 保持一致）
 *
 * @param {string} imagePath - 图片路径（来自后端的image_url字段）
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // #ifdef MP-WEIXIN
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (baseUrl) {
    return `${baseUrl}${getApiPrefix()}/product/image?path=${encodeURIComponent(imagePath)}`;
  }
  // #endif

  // H5版本：使用 API_BASE_URL，与 api.js 保持一致
  return `${API_BASE_URL}/product/image?path=${encodeURIComponent(imagePath)}`;
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

  // #ifdef MP-WEIXIN
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (baseUrl) {
    return `${baseUrl}${getApiPrefix()}/user/avatar?path=${encodeURIComponent(fileName)}`;
  }
  // #endif

  // H5版本：使用 API_BASE_URL，与 api.js 保持一致
  return `${API_BASE_URL}/user/avatar?path=${encodeURIComponent(fileName)}`;
};
