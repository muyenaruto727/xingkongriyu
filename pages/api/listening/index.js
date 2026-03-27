const pool = require('../../../lib/db');

async function handler(req, res) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // 处理获取听力列表
        try {
          const { page = 1, limit = 10, id } = query;
          const offset = (page - 1) * limit;

          // 构建查询
          let queryText = 'SELECT * FROM listening';
          let countQuery = 'SELECT COUNT(*) FROM listening';
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
          console.error('Error fetching listening:', error);
          res.status(500).json({ error: 'Failed to fetch listening' });
        }
        break;

      case 'POST':
        // 处理添加听力
        try {
          const { difficulty, audioUrl, exerciseType, groups, explanation } = body;

          // 插入数据
          const query = `
            INSERT INTO listening (difficulty, audio_url, exercise_type, groups, explanation)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `;
          const params = [difficulty, audioUrl, exerciseType, JSON.stringify(groups), explanation];

          const result = await pool.query(query, params);
          res.status(201).json(result.rows[0]);
        } catch (error) {
          console.error('Error adding listening:', error);
          res.status(500).json({ error: 'Failed to add listening' });
        }
        break;

      case 'PUT':
        // 处理更新听力
        try {
          const { id } = query;
          const { difficulty, audioUrl, exerciseType, groups, explanation } = body;

          // 更新数据
          const query = `
            UPDATE listening
            SET difficulty = $1, audio_url = $2, exercise_type = $3, groups = $4, explanation = $5
            WHERE id = $6
            RETURNING *
          `;
          const params = [difficulty, audioUrl, exerciseType, JSON.stringify(groups), explanation, id];

          const result = await pool.query(query, params);
          if (result.rows.length === 0) {
            res.status(404).json({ error: 'Listening not found' });
          } else {
            res.status(200).json(result.rows[0]);
          }
        } catch (error) {
          console.error('Error updating listening:', error);
          res.status(500).json({ error: 'Failed to update listening' });
        }
        break;

      case 'DELETE':
        // 处理删除听力
        try {
          const { id } = query;

          // 删除数据
          const deleteQuery = 'DELETE FROM listening WHERE id = $1';
          const result = await pool.query(deleteQuery, [id]);

          if (result.rowCount === 0) {
            res.status(404).json({ error: 'Listening not found' });
          } else {
            res.status(200).json({ message: 'Listening deleted successfully' });
          }
        } catch (error) {
          console.error('Error deleting listening:', error);
          res.status(500).json({ error: 'Failed to delete listening' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in listening API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = handler;