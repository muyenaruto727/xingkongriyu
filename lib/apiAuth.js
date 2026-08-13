const { verifyToken } = require('./auth');
const pool = require('./db');
const { ACCOUNT_STATUS, isAccountExpired, resolveAccountStatus } = require('./accountExpiry');

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

async function getCurrentUser(decoded) {
  if (!decoded?.userId) return null;

  const result = await pool.query(
    `SELECT id, username, role, status, account_expires_at
       FROM users
      WHERE id = $1`,
    [decoded.userId]
  );

  return result.rows[0] || null;
}

function rejectInactiveAccount(res, status) {
  if (status === ACCOUNT_STATUS.EXPIRED) {
    return unauthorized(res, '账号已到期，请重新登录');
  }
  if (status === ACCOUNT_STATUS.DISABLED) {
    return unauthorized(res, '账号已禁用，请联系管理员');
  }
  return null;
}

function requireAuth(handler) {
  return async function authenticatedHandler(req, res) {
    const token = getBearerToken(req);
    if (!token) return unauthorized(res);

    const decoded = verifyToken(token);
    if (!decoded) return unauthorized(res, '无效的认证令牌');
    const tokenStatus = resolveAccountStatus({
      status: decoded.status,
      account_expires_at: decoded.accountExpiresAt,
    });
    const rejectedTokenStatus = rejectInactiveAccount(res, tokenStatus);
    if (rejectedTokenStatus) return rejectedTokenStatus;

    const currentUser = await getCurrentUser(decoded);
    if (!currentUser) return unauthorized(res, '用户不存在或已注销');

    const accountStatus = resolveAccountStatus(currentUser);
    const rejectedAccountStatus = rejectInactiveAccount(res, accountStatus);
    if (rejectedAccountStatus) return rejectedAccountStatus;

    if (accountStatus === ACCOUNT_STATUS.EXPIRED || isAccountExpired(currentUser.account_expires_at)) {
      return unauthorized(res, '账号已到期，请重新登录');
    }

    req.user = {
      ...decoded,
      userId: currentUser.id,
      username: currentUser.username || decoded.username,
      role: currentUser.role || decoded.role,
      status: currentUser.status || ACCOUNT_STATUS.ACTIVE,
      accountExpiresAt: currentUser.account_expires_at || decoded.accountExpiresAt,
    };
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
