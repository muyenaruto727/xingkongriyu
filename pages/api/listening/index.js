const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');

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

          const responseData = {
            data: result.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
          };
          return successResponse(res, responseData);
        } catch (error) {
          handleError(error, req, res);
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
          return successResponse(res, result.rows[0], '听力添加成功');
        } catch (error) {
          handleError(error, req, res);
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
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listening not found' } });
          } else {
            return successResponse(res, result.rows[0], '听力更新成功');
          }
        } catch (error) {
          handleError(error, req, res);
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
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listening not found' } });
          } else {
            return successResponse(res, null, '听力删除成功');
          }
        } catch (error) {
          handleError(error, req, res);
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${method} Not Allowed` } });
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

module.exports = handler;