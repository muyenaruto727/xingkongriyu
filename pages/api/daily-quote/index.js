const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { withAdminForMethods } = require('../../../lib/apiAuth');
const { parseIntegerParam } = require('../../../lib/requestValidation');

async function handler(req, res) {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        if (req.query.random) {
          await handleGetRandomQuote(req, res);
        } else {
          await handleGetQuotes(req, res);
        }
        break;
      case 'POST':
        await handleCreateQuote(req, res);
        break;
      case 'PUT':
        await handleUpdateQuote(req, res);
        break;
      case 'DELETE':
        await handleDeleteQuote(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

async function handleGetQuotes(req, res) {
  const { page = 1, limit = 10 } = req.query;
  const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
  const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 100, defaultValue: 10 });
  if (parsedPage.error || parsedLimit.error) {
    return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
  }
  const offset = (parsedPage.value - 1) * parsedLimit.value;

  const result = await pool.query(
    'SELECT * FROM daily_quotes ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [parsedLimit.value, offset]
  );

  const countResult = await pool.query('SELECT COUNT(*) FROM daily_quotes');

  successResponse(res, {
    data: result.rows,
    pagination: {
      page: parsedPage.value,
      limit: parsedLimit.value,
      total: parseInt(countResult.rows[0].count)
    }
  });
}

async function handleGetRandomQuote(req, res) {
  const result = await pool.query(`
    SELECT * FROM daily_quotes
    ORDER BY RANDOM()
    LIMIT 1
  `);

  if (result.rows.length > 0) {
    successResponse(res, result.rows[0]);
  } else {
    successResponse(res, null);
  }
}

async function handleCreateQuote(req, res) {
  const { sentence, meaning, source } = req.body;

  if (!sentence) {
    return res.status(400).json({ success: false, message: '句子不能为空' });
  }

  const duplicateResult = await pool.query(
    'SELECT id FROM daily_quotes WHERE sentence = $1 LIMIT 1',
    [sentence]
  );
  if (duplicateResult.rows.length > 0) {
    return res.status(409).json({ success: false, error: { code: 'DUPLICATE_RESOURCE', message: '每日一句已存在' } });
  }

  const result = await pool.query(
    'INSERT INTO daily_quotes (sentence, meaning, source) VALUES ($1, $2, $3) RETURNING *',
    [sentence, meaning || '', source || '']
  );

  successResponse(res, result.rows[0]);
}

async function handleUpdateQuote(req, res) {
  const { id, sentence, meaning, source } = req.body;

  if (!id || !sentence) {
    return res.status(400).json({ success: false, message: 'ID和句子不能为空' });
  }

  const result = await pool.query(
    'UPDATE daily_quotes SET sentence = $1, meaning = $2, source = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
    [sentence, meaning || '', source || '', id]
  );

  if (result.rows.length > 0) {
    successResponse(res, result.rows[0]);
  } else {
    res.status(404).json({ success: false, message: '记录不存在' });
  }
}

async function handleDeleteQuote(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID不能为空' });
  }

  const result = await pool.query(
    'DELETE FROM daily_quotes WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length > 0) {
    successResponse(res, { message: '删除成功' });
  } else {
    res.status(404).json({ success: false, message: '记录不存在' });
  }
}

export default withAdminForMethods(handler);
