const pool = require('../../../lib/db');
const { hashPassword } = require('../../../lib/auth');
const { successResponse, ApiError, errorCodes, handleError } = require('../../../lib/errorHandler');
const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': '用户名只能包含字母和数字',
    'string.min': '用户名至少3个字符',
    'string.max': '用户名最多30个字符',
    'any.required': '用户名不能为空',
  }),
  email: Joi.string().email().required().messages({
    'string.email': '请输入有效的邮箱地址',
    'any.required': '邮箱不能为空',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '密码至少6个字符',
    'any.required': '密码不能为空',
  }),
});

async function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    try {
      const { error, value } = registerSchema.validate(req.body);
      
      if (error) {
        throw new ApiError(errorCodes.VALIDATION_ERROR, error.details[0].message);
      }

      const { username, email, password } = value;

      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        throw new ApiError(errorCodes.VALIDATION_ERROR, '用户名或邮箱已存在');
      }

      const hashedPassword = await hashPassword(password);

      const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role, created_at',
        [username, email, hashedPassword]
      );

      const user = result.rows[0];

      return successResponse(res, user, '注册成功');
    } catch (error) {
      return handleError(error, req, res);
    }
  } else {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: '不支持的请求方法',
      },
    });
  }
}

module.exports = handler;