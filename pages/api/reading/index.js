const pool = require('../../../lib/db');

async function handler(req, res) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // 处理获取阅读列表
        try {
          const { page = 1, limit = 10, id } = query;
          const offset = (page - 1) * limit;

          // 构建查询
          let queryText = 'SELECT * FROM reading';
          let countQuery = 'SELECT COUNT(*) FROM reading';
          let params = [];
          let countParams = [];

          // 添加搜索条件
          if (id) {
            queryText += ' WHERE id = $1';
            countQuery += ' WHERE id = $1';
            params.push(id);
            countParams.push(id);
          }

          // 添加分页参数
          params.push(limit);
          params.push(offset);

          // 执行查询
          const result = await pool.query(queryText + ' ORDER BY id DESC LIMIT $' + (params.length - 1) + ' OFFSET $' + params.length, params);
          const countResult = await pool.query(countQuery, countParams);

          const total = parseInt(countResult.rows[0].count);

          res.status(200).json({
            data: result.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
          });
        } catch (error) {
          console.error('Error fetching reading:', error);
          res.status(500).json({ error: 'Failed to fetch reading' });
        }
        break;

      case 'POST':
        // 处理添加阅读
        try {
          const { difficulty, article, groups } = body;

          // 插入数据
          const query = `
            INSERT INTO reading (difficulty, article, groups)
            VALUES ($1, $2, $3)
            RETURNING *
          `;
          const params = [difficulty, article, JSON.stringify(groups)];

          const result = await pool.query(query, params);
          res.status(201).json(result.rows[0]);
        } catch (error) {
          console.error('Error adding reading:', error);
          res.status(500).json({ error: 'Failed to add reading' });
        }
        break;

      case 'PUT':
        // 处理更新阅读
        try {
          const { id } = query;
          const { difficulty, article, groups } = body;

          // 更新数据
          const updateQuery = `
            UPDATE reading
            SET difficulty = $1, article = $2, groups = $3
            WHERE id = $4
            RETURNING *
          `;
          const params = [difficulty, article, JSON.stringify(groups), id];

          const result = await pool.query(updateQuery, params);
          if (result.rows.length === 0) {
            res.status(404).json({ error: 'Reading not found' });
          } else {
            res.status(200).json(result.rows[0]);
          }
        } catch (error) {
          console.error('Error updating reading:', error);
          res.status(500).json({ error: 'Failed to update reading' });
        }
        break;

      case 'DELETE':
        // 处理删除阅读
        try {
          const { id } = query;

          // 删除数据
          const deleteQuery = 'DELETE FROM reading WHERE id = $1';
          const result = await pool.query(deleteQuery, [id]);

          if (result.rowCount === 0) {
            res.status(404).json({ error: 'Reading not found' });
          } else {
            res.status(200).json({ message: 'Reading deleted successfully' });
          }
        } catch (error) {
          console.error('Error deleting reading:', error);
          res.status(500).json({ error: 'Failed to delete reading' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in reading API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = handler;