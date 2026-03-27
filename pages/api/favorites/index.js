const pool = require('../../../lib/db');

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { user_id, item_type } = req.query;
        
        if (!user_id) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        // 转换为正确的类型
        const userId = parseInt(user_id, 10);
        if (isNaN(userId)) {
          return res.status(400).json({ error: 'Invalid User ID' });
        }

        let query = 'SELECT item_id FROM favorites WHERE user_id = $1';
        const params = [userId];
        
        if (item_type) {
          query += ' AND item_type = $2';
          params.push(item_type);
        }

        const result = await pool.query(query, params);
        const favoriteIds = result.rows.map(row => row.item_id);
        
        res.status(200).json(favoriteIds);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
      }
      break;

    case 'POST':
      try {
        const { user_id, item_type, item_id } = req.body;
        
        if (!user_id || !item_type || !item_id) {
          return res.status(400).json({ error: 'User ID, item type, and item ID are required' });
        }

        // 转换为正确的类型
        const userId = parseInt(user_id, 10);
        const itemId = parseInt(item_id, 10);
        if (isNaN(userId) || isNaN(itemId)) {
          return res.status(400).json({ error: 'Invalid User ID or Item ID' });
        }

        const result = await pool.query(
          `INSERT INTO favorites (user_id, item_type, item_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, item_type, item_id) DO NOTHING
           RETURNING *`,
          [userId, item_type, itemId]
        );
        
        res.status(201).json({ success: true, favorite: result.rows[0] });
      } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Failed to add favorite' });
      }
      break;

    case 'DELETE':
      try {
        const { user_id, item_type, item_id } = req.query;
        
        if (!user_id || !item_type || !item_id) {
          return res.status(400).json({ error: 'User ID, item type, and item ID are required' });
        }

        // 转换为正确的类型
        const userId = parseInt(user_id, 10);
        const itemId = parseInt(item_id, 10);
        if (isNaN(userId) || isNaN(itemId)) {
          return res.status(400).json({ error: 'Invalid User ID or Item ID' });
        }

        const result = await pool.query(
          `DELETE FROM favorites
           WHERE user_id = $1 AND item_type = $2 AND item_id = $3
           RETURNING *`,
          [userId, item_type, itemId]
        );
        
        res.status(200).json({ success: true, deleted: result.rows[0] });
      } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Failed to remove favorite' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

module.exports = handler;