// 简单的内存速率限制实现
const rateLimit = (options = {}) => {
  const { 
    windowMs = 60 * 1000, // 时间窗口（毫秒）
    max = 100, // 时间窗口内最大请求数
    message = 'Too many requests, please try again later.' 
  } = options;

  // 存储请求记录
  const requests = new Map();

  return (req, res, next) => {
    // 获取客户端IP
    const ip = req.ip || req.connection.remoteAddress;
    
    // 获取当前时间
    const now = Date.now();
    
    // 检查IP是否在记录中
    if (requests.has(ip)) {
      const [timestamp, count] = requests.get(ip);
      
      // 检查是否在时间窗口内
      if (now - timestamp < windowMs) {
        // 检查请求数是否超过限制
        if (count >= max) {
          return res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message
            }
          });
        }
        // 更新请求数
        requests.set(ip, [timestamp, count + 1]);
      } else {
        // 时间窗口已过，重置计数
        requests.set(ip, [now, 1]);
      }
    } else {
      // 新IP，初始化记录
      requests.set(ip, [now, 1]);
    }
    
    next();
  };
};

module.exports = rateLimit;