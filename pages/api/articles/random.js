const pool = require('../../../lib/db');

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
        res.status(404).json({ error: 'No articles found for the specified level' });
        return;
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching random article:', error);
      res.status(500).json({ error: 'Failed to fetch random article' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = handler;