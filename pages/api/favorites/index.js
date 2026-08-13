const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { requireAuth } = require('../../../lib/apiAuth');

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { item_type } = req.query;
        const userId = req.user.userId;

        let query = 'SELECT item_id FROM favorites WHERE user_id = $1';
        const params = [userId];
        
        if (item_type) {
          query += ' AND item_type = $2';
          params.push(item_type);
        }

        const result = await pool.query(query, params);
        const favoriteIds = result.rows.map(row => row.item_id);
        
        return successResponse(res, favoriteIds);
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'POST':
      try {
        const { item_type, item_id } = req.body;
        
        if (!item_type || !item_id) {
          return res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'Item type and item ID are required' } });
        }

        // 转换为正确的类型
        const userId = req.user.userId;
        const itemId = parseInt(item_id, 10);
        if (isNaN(itemId)) {
          return res.status(400).json({ success: false, error: { code: 'INVALID_IDS', message: 'Invalid Item ID' } });
        }

        const result = await pool.query(
          `INSERT INTO favorites (user_id, item_type, item_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, item_type, item_id) DO NOTHING
           RETURNING *`,
          [userId, item_type, itemId]
        );
        
        return successResponse(res, { favorite: result.rows[0] }, '收藏成功');
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'DELETE':
      try {
        const { item_type, item_id } = req.query;
        
        if (!item_type || !item_id) {
          return res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'Item type and item ID are required' } });
        }

        // 转换为正确的类型
        const userId = req.user.userId;
        const itemId = parseInt(item_id, 10);
        if (isNaN(itemId)) {
          return res.status(400).json({ success: false, error: { code: 'INVALID_IDS', message: 'Invalid Item ID' } });
        }

        const result = await pool.query(
          `DELETE FROM favorites
           WHERE user_id = $1 AND item_type = $2 AND item_id = $3
           RETURNING *`,
          [userId, item_type, itemId]
        );
        
        return successResponse(res, { deleted: result.rows[0] }, '取消收藏成功');
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${method} Not Allowed` } });
  }
}

export default requireAuth(handler);
