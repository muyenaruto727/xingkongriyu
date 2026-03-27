const pool = require('../../../lib/db');

async function handler(req, res) {
  const { method, query } = req;
  const { id, user_id, page = 1, limit = 10 } = query;

  try {
    switch (method) {
      case 'GET':
        let sql = 'SELECT * FROM exam_records WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (user_id) {
          sql += ` AND user_id = $${paramIndex}`;
          params.push(parseInt(user_id));
          paramIndex++;
        }

        sql += ' ORDER BY created_at DESC';
        
        // 添加分页
        const offset = (parseInt(page) - 1) * parseInt(limit);
        sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);

        const result = await pool.query(sql, params);
        
        // 获取总数
        let countSql = 'SELECT COUNT(*) as total FROM exam_records WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;
        
        if (user_id) {
          countSql += ` AND user_id = $${countParamIndex}`;
          countParams.push(parseInt(user_id));
        }
        
        const countResult = await pool.query(countSql, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.status(200).json({
          data: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total
          }
        });
        break;

      case 'POST':
        const { 
          user_id: recordUserId, 
          level, 
          sections, 
          score, 
          correct_count, 
          total_count, 
          duration, 
          answers,
          questions
        } = req.body;
        
        const insertResult = await pool.query(
          `INSERT INTO exam_records 
           (user_id, level, sections, score, correct_count, total_count, duration, answers, questions) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           RETURNING *`,
          [recordUserId, level, sections, score, correct_count, total_count, duration, JSON.stringify(answers), JSON.stringify(questions)]
        );
        res.status(201).json(insertResult.rows[0]);
        break;

      case 'DELETE':
        if (!id) {
          res.status(400).json({ error: 'Missing record ID' });
          return;
        }
        await pool.query('DELETE FROM exam_records WHERE id = $1', [parseInt(id)]);
        res.status(200).json({ message: 'Exam record deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = handler;