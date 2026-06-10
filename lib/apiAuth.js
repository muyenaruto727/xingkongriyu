const { verifyToken } = require('./auth');

function unauthorized(res, message = '未提供认证令牌') {
  return res.status(401).json({
    success: false,
    error: {
      code: 'AUTHENTICATION_ERROR',
      message,
    },
  });
}

function forbidden(res, message = '需要管理员权限') {
  return res.status(403).json({
    success: false,
    error: {
      code: 'AUTHORIZATION_ERROR',
      message,
    },
  });
}

function getBearerToken(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return '';
  return authHeader.substring(7);
}

function requireAuth(handler) {
  return async function authenticatedHandler(req, res) {
    const token = getBearerToken(req);
    if (!token) return unauthorized(res);

    const decoded = verifyToken(token);
    if (!decoded) return unauthorized(res, '无效的认证令牌');

    req.user = decoded;
    return handler(req, res);
  };
}

function requireAdmin(handler) {
  return requireAuth(async function adminHandler(req, res) {
    if (req.user?.role !== 'admin') return forbidden(res);
    return handler(req, res);
  });
}

function withAdminForMethods(handler, methods = ['POST', 'PUT', 'DELETE']) {
  const guarded = requireAdmin(handler);
  return async function methodGuardedHandler(req, res) {
    if (methods.includes(req.method)) return guarded(req, res);
    return handler(req, res);
  };
}

module.exports = {
  requireAuth,
  requireAdmin,
  withAdminForMethods,
};
