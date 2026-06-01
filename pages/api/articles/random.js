const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');

async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { level } = req.query;
      
      let query = 'SELECT * FROM articles WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (level && level !== '全部' && level !== '') {
        query += ` AND level = $${paramIndex}`;
        params.push(level);
        paramIndex++;
      }

      // 随机排序并只返回一篇文章
      query += ' ORDER BY RANDOM() LIMIT 1';

      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No articles found for the specified level' } });
        return;
      }

      return successResponse(res, result.rows[0]);
    } catch (error) {
      handleError(error, req, res);
    }
  } else {
    res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }
}

module.exports = handler;