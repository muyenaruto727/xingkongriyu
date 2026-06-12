// 工具文件 - 包含错误处理和其他实用函数
import { message } from 'antd';

/**
 * 处理客户端错误
 * @param {Error} error - 错误对象
 * @param {Function} showMessage - 显示提示的函数（可选，默认为 antd message）
 * @returns {Object} 错误信息
 */
export const handleClientError = (error, showMessage) => {
  const errorMessage = error.message || '操作失败，请稍后重试';
  
  const showToast = showMessage || message.error;
  showToast(errorMessage);
  
  return {
    message: errorMessage,
    code: 'CLIENT_ERROR',
    originalError: error
  };
};

/**
 * 记录错误日志
 * @param {Error} error - 错误对象
 * @param {String} context - 错误上下文
 */
export const logError = (error, context = 'Unknown') => {
  console.error(`[${context}] Error:`, error);
  
  // 这里可以添加错误上报逻辑，如发送到错误监控系统
  // 例如：sentry.captureException(error, { tags: { context } });
};

/**
 * 格式化时间
 * @param {Number} seconds - 秒数
 * @returns {String} 格式化后的时间
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 生成唯一ID
 * @returns {String} 唯一ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
