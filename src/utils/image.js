// 图片URL处理工具函数
import { API_BASE_URL } from '@/utils/constants';

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

  return `${API_BASE_URL}/user/avatar?path=${encodeURIComponent(fileName)}`;
};
