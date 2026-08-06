const pool = require('../../../lib/db');
const { handleError, successResponse, ApiError, errorCodes } = require('../../../lib/errorHandler');
const { requireAdmin } = require('../../../lib/apiAuth');
const { parseIntegerParam } = require('../../../lib/requestValidation');
const {
  generateInvitationCode,
  normalizeInvitationDuration,
} = require('../../../lib/invitationCodes');

async function createUniqueInvitationCode(client) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateInvitationCode();
    const existing = await client.query('SELECT id FROM invitation_codes WHERE code = $1', [code]);
    if (existing.rows.length === 0) {
      return code;
    }
  }

  throw new ApiError(errorCodes.INTERNAL_ERROR, '邀请码生成失败，请重试');
}

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { page = 1, limit = 10 } = req.query;
        const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
        const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 100, defaultValue: 10 });
        if (parsedPage.error || parsedLimit.error) {
          return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
        }

        const offset = (parsedPage.value - 1) * parsedLimit.value;
        const countResult = await pool.query('SELECT COUNT(*) FROM invitation_codes');
        const result = await pool.query(
          `SELECT ic.id, ic.code, ic.duration_days, ic.is_used, ic.used_by, ic.used_at,
                  ic.created_at, ic.updated_at, u.username AS used_by_username
             FROM invitation_codes ic
             LEFT JOIN users u ON u.id = ic.used_by
             ORDER BY ic.id DESC
             LIMIT $1 OFFSET $2`,
          [parsedLimit.value, offset]
        );

        return successResponse(res, {
          data: result.rows,
          total: parseInt(countResult.rows[0].count, 10),
        });
      } catch (error) {
        return handleError(error, req, res);
      }

    case 'POST':
      try {
        const durationDays = normalizeInvitationDuration(req.body?.duration_days);
        if (!durationDays) {
          throw new ApiError(errorCodes.VALIDATION_ERROR, '请选择有效的邀请码类型');
        }

        const client = await pool.connect();
        try {
          const code = await createUniqueInvitationCode(client);
          const result = await client.query(
            `INSERT INTO invitation_codes (code, duration_days)
             VALUES ($1, $2)
             RETURNING id, code, duration_days, is_used, used_by, used_at, created_at, updated_at`,
            [code, durationDays]
          );

          return successResponse(res, result.rows[0], '邀请码生成成功');
        } finally {
          client.release();
        }
      } catch (error) {
        return handleError(error, req, res);
      }

    default:
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: '不支持的请求方法',
        },
      });
  }
}

export default requireAdmin(handler);
