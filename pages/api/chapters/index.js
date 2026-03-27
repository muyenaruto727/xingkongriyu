const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');

async function handler(req, res) {
  try {
    const { method, query } = req;
    
    switch (method) {
      case 'GET':
        await handleGetChapters(req, res);
        break;
      case 'POST':
        await handleCreateChapter(req, res);
        break;
      case 'PUT':
        await handleUpdateChapter(req, res);
        break;
      case 'DELETE':
        await handleDeleteChapter(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

// 获取章节列表
async function handleGetChapters(req, res) {
  const { courseId } = req.query;
  
  try {
    let query = `
      SELECT 
        c.id, c.name, c.description, c.course_id, c.created_at, c.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'content', s.content,
              'video_url', s.video_url,
              'order', s."order"
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) as sections
      FROM chapters c
      LEFT JOIN sections s ON c.id = s.chapter_id
    `;
    let params = [];
    let whereClause = '';
    
    if (courseId) {
      whereClause = 'WHERE c.course_id = $1';
      params = [courseId];
    }
    
    query += ` ${whereClause} GROUP BY c.id ORDER BY c.id`;
    
    const result = await pool.query(query, params);
    
    // 处理章节数据，确保 sections 是数组
    const chapters = result.rows.map(chapter => ({
      ...chapter,
      sections: chapter.sections || []
    }));
    
    return successResponse(res, chapters, '获取章节列表成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

// 创建章节
async function handleCreateChapter(req, res) {
  const { name, description, courseId } = req.body;
  
  try {
    // 检查课程是否存在
    const checkQuery = 'SELECT * FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [courseId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '课程不存在' } });
    }
    
    const query = `
      INSERT INTO chapters (name, description, course_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const params = [name, description, courseId];
    
    const result = await pool.query(query, params);
    const chapter = result.rows[0];
    
    return successResponse(res, chapter, '章节创建成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

// 更新章节
async function handleUpdateChapter(req, res) {
  const { id } = req.query;
  const { name, description } = req.body;
  
  try {
    // 检查章节是否存在
    const checkQuery = 'SELECT * FROM chapters WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '章节不存在' } });
    }
    
    const query = `
      UPDATE chapters
      SET name = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const params = [name, description, id];
    
    const result = await pool.query(query, params);
    const chapter = result.rows[0];
    
    return successResponse(res, chapter, '章节更新成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

// 删除章节
async function handleDeleteChapter(req, res) {
  const { id } = req.query;
  
  try {
    // 检查章节是否存在
    const checkQuery = 'SELECT * FROM chapters WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '章节不存在' } });
    }
    
    // 开始事务
    await pool.query('BEGIN');
    
    try {
      // 删除章节下的所有小节
      await pool.query('DELETE FROM sections WHERE chapter_id = $1', [id]);
      
      // 删除章节
      await pool.query('DELETE FROM chapters WHERE id = $1', [id]);
      
      // 提交事务
      await pool.query('COMMIT');
      
      return successResponse(res, null, '章节删除成功');
    } catch (error) {
      // 回滚事务
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

module.exports = handler;