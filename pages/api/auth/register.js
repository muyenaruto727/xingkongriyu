const pool = require('../../../lib/db');
const { hashPassword } = require('../../../lib/auth');
const { successResponse, ApiError, errorCodes, handleError } = require('../../../lib/errorHandler');
const {
  calculateAccountExpiry,
  isValidInvitationCodeFormat,
  normalizeInvitationCode,
} = require('../../../lib/invitationCodes');
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
  invitation_code: Joi.string().required().messages({
    'string.empty': '邀请码不能为空',
    'any.required': '邀请码不能为空',
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
      const invitationCode = normalizeInvitationCode(value.invitation_code);

      if (!isValidInvitationCodeFormat(invitationCode)) {
        throw new ApiError(errorCodes.VALIDATION_ERROR, '邀请码格式错误');
      }

      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        throw new ApiError(errorCodes.VALIDATION_ERROR, '用户名或邮箱已存在');
      }

      const hashedPassword = await hashPassword(password);
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        const invitationResult = await client.query(
          `SELECT id, code, duration_days, is_used
             FROM invitation_codes
            WHERE code = $1
            FOR UPDATE`,
          [invitationCode]
        );

        if (invitationResult.rows.length === 0) {
          throw new ApiError(errorCodes.VALIDATION_ERROR, '邀请码不存在');
        }

        const invitation = invitationResult.rows[0];
        if (invitation.is_used) {
          throw new ApiError(errorCodes.VALIDATION_ERROR, '邀请码已被使用');
        }

        const registeredAt = new Date();
        const accountExpiresAt = calculateAccountExpiry(registeredAt, invitation.duration_days);
        const result = await client.query(
          `INSERT INTO users (username, email, password, invitation_code, invitation_code_id, account_expires_at, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'active')
           RETURNING id, username, email, role, invitation_code, account_expires_at, status, created_at`,
          [username, email, hashedPassword, invitation.code, invitation.id, accountExpiresAt]
        );

        const user = result.rows[0];

        await client.query(
          `UPDATE invitation_codes
              SET is_used = TRUE, used_by = $1, used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2`,
          [user.id, invitation.id]
        );

        await client.query('COMMIT');

        return successResponse(res, user, '注册成功');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
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
