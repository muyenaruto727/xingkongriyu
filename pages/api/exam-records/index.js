const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { parseIntegerParam } = require('../../../lib/requestValidation');

async function handler(req, res) {
  const { method, query } = req;
  const { id, user_id, page = 1, limit = 10 } = query;

  try {
    switch (method) {
      case 'GET':
        const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
        const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 100, defaultValue: 10 });
        if (parsedPage.error || parsedLimit.error) {
          return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
        }
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
        const offset = (parsedPage.value - 1) * parsedLimit.value;
        sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parsedLimit.value, offset);

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

        const responseData = {
          data: result.rows,
          pagination: {
            page: parsedPage.value,
            limit: parsedLimit.value,
            total
          }
        };
        return successResponse(res, responseData);
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
        return successResponse(res, insertResult.rows[0], '考试记录添加成功');
        break;

      case 'DELETE':
        if (!id) {
          res.status(400).json({ success: false, error: { code: 'MISSING_ID', message: 'Missing record ID' } });
          return;
        }
        await pool.query('DELETE FROM exam_records WHERE id = $1', [parseInt(id)]);
        return successResponse(res, null, '考试记录删除成功');
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${method} Not Allowed` } });
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

export default handler;
