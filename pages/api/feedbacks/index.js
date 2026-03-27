const pool = require('../../../lib/db');

async function handler(req, res) {
  if (req.method === 'POST') {
    // 处理反馈提交
    const { user_id, question_id, exam_record_id, feedback_type, description } = req.body;
    
    if (!user_id || !question_id || !feedback_type) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    try {
      const result = await pool.query(
        `INSERT INTO feedbacks (user_id, question_id, exam_record_id, feedback_type, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [user_id, question_id, exam_record_id, feedback_type, description]
      );
      
      res.status(201).json({ id: result.rows[0].id, message: 'Feedback submitted successfully' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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
      
      res.status(200).json({ data: result.rows });
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'PUT') {
    // 处理更新反馈状态
    const { id, status } = req.body;
    
    if (!id || !status) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    try {
      const result = await pool.query(
        `UPDATE feedbacks SET status = $1 WHERE id = $2 RETURNING *`,
        [status, id]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Feedback not found' });
        return;
      }
      
      res.status(200).json({ data: result.rows[0], message: 'Status updated successfully' });
    } catch (error) {
      console.error('Error updating feedback status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

module.exports = handler;