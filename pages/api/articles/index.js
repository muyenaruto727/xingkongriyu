const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');

async function handler(req, res) {
  const { method, query } = req;
  const { id, page = 1, limit = 10 } = query;

  try {
    switch (method) {
      case 'GET':
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await pool.query(
          'SELECT * FROM articles ORDER BY created_at DESC LIMIT $1 OFFSET $2',
          [parseInt(limit), offset]
        );
        const countResult = await pool.query('SELECT COUNT(*) as total FROM articles');
        const total = parseInt(countResult.rows[0].total);
        
        const responseData = {
          data: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total
          }
        };
        return successResponse(res, responseData);
        break;

      case 'POST':
        {
          const { title, content, level, category } = req.body;
          const insertResult = await pool.query(
            'INSERT INTO articles (title, content, level, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, level, category]
          );
          return successResponse(res, insertResult.rows[0], '文章添加成功');
        }
        break;

      case 'PUT':
        {
          if (!id) {
            res.status(400).json({ success: false, error: { code: 'MISSING_ID', message: 'Missing article ID' } });
            return;
          }
          const { title, content, level, category } = req.body;
          const updateResult = await pool.query(
            'UPDATE articles SET title = $1, content = $2, level = $3, category = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [title, content, level, category, parseInt(id)]
          );
          return successResponse(res, updateResult.rows[0], '文章更新成功');
        }
        break;

      case 'DELETE':
        if (!id) {
          res.status(400).json({ success: false, error: { code: 'MISSING_ID', message: 'Missing article ID' } });
          return;
        }
        await pool.query('DELETE FROM articles WHERE id = $1', [parseInt(id)]);
        return successResponse(res, null, '文章删除成功');
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${method} Not Allowed` } });
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

module.exports = handler;