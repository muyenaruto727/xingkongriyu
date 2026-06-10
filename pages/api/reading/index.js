const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { withAdminForMethods } = require('../../../lib/apiAuth');
const { parseIntegerParam } = require('../../../lib/requestValidation');

async function handler(req, res) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // 处理获取阅读列表
        try {
          const { page = 1, limit = 10, id } = query;
          const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
          const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 100, defaultValue: 10 });
          if (parsedPage.error || parsedLimit.error) {
            return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
          }
          const offset = (parsedPage.value - 1) * parsedLimit.value;

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
          params.push(parsedLimit.value);
          params.push(offset);

          // 执行查询
          const result = await pool.query(queryText + ' ORDER BY id DESC LIMIT $' + (params.length - 1) + ' OFFSET $' + params.length, params);
          const countResult = await pool.query(countQuery, countParams);

          const total = parseInt(countResult.rows[0].count);

          const responseData = {
            data: result.rows,
            total,
            page: parsedPage.value,
            limit: parsedLimit.value
          };
          return successResponse(res, responseData);
        } catch (error) {
          handleError(error, req, res);
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
          return successResponse(res, result.rows[0], '阅读添加成功');
        } catch (error) {
          handleError(error, req, res);
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
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Reading not found' } });
          } else {
            return successResponse(res, result.rows[0], '阅读更新成功');
          }
        } catch (error) {
          handleError(error, req, res);
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
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Reading not found' } });
          } else {
            return successResponse(res, null, '阅读删除成功');
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

export default withAdminForMethods(handler);
