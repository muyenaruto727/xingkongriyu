const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { requireAdmin } = require('../../../lib/apiAuth');
const { validateBookingInput } = require('../../../lib/oneOnOneBooking');
const { parseIntegerParam } = require('../../../lib/requestValidation');

async function ensureBookingTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS one_on_one_bookings (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      contact_type VARCHAR(20) NOT NULL,
      contact_value VARCHAR(255) NOT NULL,
      contact_label VARCHAR(20) NOT NULL,
      duplicate_key VARCHAR(300) NOT NULL UNIQUE,
      goal TEXT,
      preferred_time VARCHAR(120),
      status VARCHAR(20) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetBookings(req, res);
      case 'POST':
        return handleCreateBooking(req, res);
      case 'PUT':
        return handleUpdateBooking(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({
          success: false,
          error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
        });
    }
  } catch (error) {
    return handleError(error, req, res);
  }
}

async function handleGetBookings(req, res) {
  const { page = 1, limit = 10, status = '' } = req.query;
  const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
  const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 100, defaultValue: 10 });

  if (parsedPage.error || parsedLimit.error) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: '分页参数有误' },
    });
  }

  await ensureBookingTable();

  const params = [];
  const where = [];
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM one_on_one_bookings ${whereClause}`,
    params
  );

  const offset = (parsedPage.value - 1) * parsedLimit.value;
  const listParams = [...params, parsedLimit.value, offset];
  const result = await pool.query(
    `SELECT id, name, contact_type, contact_value, contact_label, goal, preferred_time, status, created_at, updated_at
     FROM one_on_one_bookings
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    listParams
  );

  return successResponse(res, {
    data: result.rows,
    pagination: {
      page: parsedPage.value,
      limit: parsedLimit.value,
      total: parseInt(countResult.rows[0].count, 10),
    },
  });
}

async function handleCreateBooking(req, res) {
  const validation = validateBookingInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: validation.message },
    });
  }

  const booking = validation.value;

  try {
    await ensureBookingTable();

    const result = await pool.query(
      `INSERT INTO one_on_one_bookings
        (name, contact_type, contact_value, contact_label, duplicate_key, goal, preferred_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [
        booking.name,
        booking.contactType,
        booking.contactValue,
        booking.contactLabel,
        booking.duplicateKey,
        booking.goal || null,
        booking.preferredTime || null,
      ]
    );

    return successResponse(res, {
      id: result.rows[0].id,
      createdAt: result.rows[0].created_at,
    }, '预约信息已提交，老师会尽快联系你');
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_RESOURCE', message: '你已经提交过预约信息，老师会尽快联系你' },
      });
    }

    return handleError(error, req, res);
  }
}

async function handleUpdateBooking(req, res) {
  const { id, status } = req.body;
  const allowedStatuses = ['new', 'contacted', 'closed'];

  if (!id || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: '预约状态参数有误' },
    });
  }

  await ensureBookingTable();

  const result = await pool.query(
    `UPDATE one_on_one_bookings
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, status, updated_at`,
    [status, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: '预约记录不存在' },
    });
  }

  return successResponse(res, result.rows[0], '预约状态已更新');
}

async function guardedHandler(req, res) {
  if (['GET', 'PUT'].includes(req.method)) {
    return requireAdmin(handler)(req, res);
  }

  return handler(req, res);
}

export default guardedHandler;
