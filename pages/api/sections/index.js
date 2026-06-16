const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { withAdminForMethods } = require('../../../lib/apiAuth');
const { sanitizeRichText } = require('../../../lib/sanitizeHtml');

async function handler(req, res) {
  try {
    const { method, query } = req;
    
    switch (method) {
      case 'GET':
        await handleGetSections(req, res);
        break;
      case 'POST':
        await handleCreateSection(req, res);
        break;
      case 'PUT':
        await handleUpdateSection(req, res);
        break;
      case 'DELETE':
        await handleDeleteSection(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

// 获取小节列表
async function handleGetSections(req, res) {
  const { chapterId } = req.query;
  
  try {
    let query = 'SELECT * FROM sections WHERE chapter_id = $1 ORDER BY "order"';
    const params = [chapterId];
    
    const result = await pool.query(query, params);
    
    return successResponse(res, result.rows, '获取小节列表成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

// 创建小节
async function handleCreateSection(req, res) {
  const { name, content, videoUrl, chapterId, order } = req.body;
  
  try {
    // 检查章节是否存在
    const checkQuery = 'SELECT * FROM chapters WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [chapterId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '章节不存在' } });
    }

    const duplicateResult = await pool.query(
      'SELECT id FROM sections WHERE chapter_id = $1 AND name = $2 LIMIT 1',
      [chapterId, name]
    );
    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({ success: false, error: { code: 'DUPLICATE_RESOURCE', message: '小节已存在' } });
    }
    
    const query = `
      INSERT INTO sections (name, content, video_url, chapter_id, "order")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [name, content ? sanitizeRichText(content) : null, videoUrl || null, chapterId, order || 0];
    
    const result = await pool.query(query, params);
    const section = result.rows[0];
    
    return successResponse(res, section, '小节创建成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

// 更新小节
async function handleUpdateSection(req, res) {
  const { id } = req.query;
  const { name, content, videoUrl, order } = req.body;
  
  try {
    // 检查小节是否存在
    const checkQuery = 'SELECT * FROM sections WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '小节不存在' } });
    }
    
    const query = `
      UPDATE sections
      SET name = $1, content = $2, video_url = $3, "order" = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    const params = [name, content ? sanitizeRichText(content) : null, videoUrl || null, order || 0, id];
    
    const result = await pool.query(query, params);
    const section = result.rows[0];
    
    return successResponse(res, section, '小节更新成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

// 删除小节
async function handleDeleteSection(req, res) {
  const { id } = req.query;
  
  try {
    // 检查小节是否存在
    const checkQuery = 'SELECT * FROM sections WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '小节不存在' } });
    }
    
    // 删除小节
    await pool.query('DELETE FROM sections WHERE id = $1', [id]);
    
    return successResponse(res, null, '小节删除成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

export default withAdminForMethods(handler);
