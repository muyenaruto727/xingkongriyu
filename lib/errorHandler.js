const { buildSuccessResponse } = require('./apiResponse');

class ApiError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

const errorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
};

const errorStatusCodes = {
  [errorCodes.VALIDATION_ERROR]: 400,
  [errorCodes.AUTHENTICATION_ERROR]: 401,
  [errorCodes.AUTHORIZATION_ERROR]: 403,
  [errorCodes.NOT_FOUND]: 404,
  [errorCodes.DATABASE_ERROR]: 400,
};

const handleError = (error, req, res) => {
  console.error('Error:', error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode || errorStatusCodes[error.code] || 500).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  if (error.code === '23505') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: '数据已存在',
      },
    });
  }

  if (error.code && error.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: '数据库操作失败',
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : error.message,
    },
  });
};

const successResponse = (res, data, message = '操作成功', meta = {}) => {
  return res.status(200).json(buildSuccessResponse(data, message, meta));
};

module.exports = {
  ApiError,
  errorCodes,
  errorStatusCodes,
  handleError,
  successResponse,
};
