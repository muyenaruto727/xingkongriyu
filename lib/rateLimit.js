const rateLimit = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later.'
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const forwardedFor = req.headers && req.headers['x-forwarded-for'];
    const ip = req.ip
      || (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : undefined)
      || (req.connection && req.connection.remoteAddress)
      || 'unknown';
    const now = Date.now();

    if (max <= 0) {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message
        }
      });
      return false;
    }

    if (requests.has(ip)) {
      const [timestamp, count] = requests.get(ip);

      if (now - timestamp < windowMs) {
        if (count >= max) {
          res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message
            }
          });
          return false;
        }
        requests.set(ip, [timestamp, count + 1]);
      } else {
        requests.set(ip, [now, 1]);
      }
    } else {
      requests.set(ip, [now, 1]);
    }

    if (typeof next === 'function') {
      next();
    }
    return true;
  };
};

async function applyRateLimit(req, res, limiter) {
  return limiter(req, res) !== false;
}

function withRateLimit(handler, options = {}) {
  const limiter = typeof options === 'function' ? options : rateLimit(options);

  return async (req, res) => {
    const allowed = await applyRateLimit(req, res, limiter);
    if (!allowed) {
      return undefined;
    }

    return handler(req, res);
  };
}

rateLimit.applyRateLimit = applyRateLimit;
rateLimit.withRateLimit = withRateLimit;

module.exports = rateLimit;
