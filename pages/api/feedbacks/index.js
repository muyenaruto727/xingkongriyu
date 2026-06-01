const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');

async function handler(req, res) {
  if (req.method === 'POST') {
    // 处理反馈提交
    const { user_id, question_id, exam_record_id, feedback_type, description } = req.body;
    
    if (!user_id || !question_id || !feedback_type) {
      res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'Missing required parameters' } });
      return;
    }
    
    try {
      const result = await pool.query(
        `INSERT INTO feedbacks (user_id, question_id, exam_record_id, feedback_type, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [user_id, question_id, exam_record_id, feedback_type, description]
      );
      
      return successResponse(res, { id: result.rows[0].id }, '反馈提交成功');
    } catch (error) {
      handleError(error, req, res);
    }
  } else if (req.method === 'GET') {
    // 处理获取反馈列表（用于后台管理）
    try {
      const result = await pool.query(
        `SELECT f.*, u.username, q.question_text
         FROM feedbacks f
         LEFT JOIN users u ON f.user_id = u.id
         LEFT JOIN questions q ON f.question_id = q.id
         ORDER BY f.created_at DESC`
      );
      
      return successResponse(res, { data: result.rows });
    } catch (error) {
      handleError(error, req, res);
    }
  } else if (req.method === 'PUT') {
    // 处理更新反馈状态
    const { id, status } = req.body;
    
    if (!id || !status) {
      res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'Missing required parameters' } });
      return;
    }
    
    try {
      const result = await pool.query(
        `UPDATE feedbacks SET status = $1 WHERE id = $2 RETURNING *`,
        [status, id]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feedback not found' } });
        return;
      }
      
      return successResponse(res, { data: result.rows[0] }, '状态更新成功');
    } catch (error) {
      handleError(error, req, res);
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT']);
    res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} Not Allowed` } });
  }
}

module.exports = handler;