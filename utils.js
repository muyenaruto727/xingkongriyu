// 工具文件 - 包含错误处理和其他实用函数
import { message } from 'antd';

/**
 * 处理 API 错误
 * @param {Error} error - 错误对象
 * @param {Function} showMessage - 显示提示的函数（可选，默认为 antd message）
 * @returns {Object} 错误信息
 */
export const handleApiError = (error, showMessage) => {
  let errorMessage = '操作失败，请稍后重试';
  let errorCode = 'UNKNOWN_ERROR';

  if (error.response) {
    // 服务器返回错误状态码
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        errorMessage = data.error || '请求参数错误';
        errorCode = 'BAD_REQUEST';
        break;
      case 401:
        errorMessage = '未授权，请重新登录';
        errorCode = 'UNAUTHORIZED';
        // 可以在这里处理登录过期的逻辑
        break;
      case 403:
        errorMessage = '权限不足，无法操作';
        errorCode = 'FORBIDDEN';
        break;
      case 404:
        errorMessage = '请求的资源不存在';
        errorCode = 'NOT_FOUND';
        break;
      case 500:
        errorMessage = '服务器内部错误';
        errorCode = 'INTERNAL_SERVER_ERROR';
        break;
      default:
        errorMessage = data.error || `请求失败 (${status})`;
        errorCode = 'SERVER_ERROR';
    }
  } else if (error.request) {
    // 请求已发出，但没有收到响应
    errorMessage = '网络错误，请检查网络连接';
    errorCode = 'NETWORK_ERROR';
  } else {
    // 在设置请求时发生错误
    errorMessage = error.message || '请求失败';
    errorCode = 'REQUEST_ERROR';
  }

  // 显示错误提示
  const showToast = showMessage || message.error;
  showToast(errorMessage);

  return {
    message: errorMessage,
    code: errorCode,
    originalError: error
  };
};

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
