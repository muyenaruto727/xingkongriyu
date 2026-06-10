const pool = require('../../../lib/db');
const { comparePassword, generateToken } = require('../../../lib/auth');
const { successResponse, ApiError, errorCodes, handleError } = require('../../../lib/errorHandler');
const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': '用户名不能为空',
    'any.required': '用户名不能为空',
  }),
  password: Joi.string().required().messages({
    'string.empty': '密码不能为空',
    'any.required': '密码不能为空',
  }),
});

async function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    try {
      const { error, value } = loginSchema.validate(req.body);
      
      if (error) {
        throw new ApiError(errorCodes.VALIDATION_ERROR, error.details[0].message);
      }

      const { username, password } = value;

      const result = await pool.query(
        'SELECT id, username, email, password, role, created_at, updated_at FROM users WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        throw new ApiError(errorCodes.AUTHENTICATION_ERROR, '用户名或密码错误');
      }

      const user = result.rows[0];
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new ApiError(errorCodes.AUTHENTICATION_ERROR, '用户名或密码错误');
      }

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      const { password: _, ...userWithoutPassword } = user;

      return successResponse(res, {
        user: userWithoutPassword,
        token,
      }, '登录成功');
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

export default handler;
