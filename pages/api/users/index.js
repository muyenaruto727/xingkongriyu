const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { page = 1, limit = 10 } = req.query;
        
        // 获取总记录数
        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);
        
        // 添加分页
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await pool.query(
          'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY id DESC LIMIT $1 OFFSET $2',
          [parseInt(limit), offset]
        );
        
        const responseData = { data: result.rows, total };
        return successResponse(res, responseData);
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'POST':
      try {
        const { username, email, password, role } = req.body;
        
        const result = await pool.query(
          `INSERT INTO users (username, email, password, role)
           VALUES ($1, $2, $3, $4)
           RETURNING id, username, email, role, created_at, updated_at`,
          [username, email, password, role || 'user']
        );
        
        return successResponse(res, result.rows[0], '用户添加成功');
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const { username, email, password, role } = req.body;
        
        let query = 'UPDATE users SET';
        const params = [];
        let paramIndex = 1;

        if (username) {
          query += ` username = $${paramIndex},`;
          params.push(username);
          paramIndex++;
        }
        if (email) {
          query += ` email = $${paramIndex},`;
          params.push(email);
          paramIndex++;
        }
        if (password) {
          query += ` password = $${paramIndex},`;
          params.push(password);
          paramIndex++;
        }
        if (role) {
          query += ` role = $${paramIndex},`;
          params.push(role);
          paramIndex++;
        }

        query += ` updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING id, username, email, role, created_at, updated_at`;
        params.push(id);

        const result = await pool.query(query, params);
        return successResponse(res, result.rows[0], '用户更新成功');
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        
        return successResponse(res, null, '用户删除成功');
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    default:
      res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }
}

module.exports = handler;