const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { withAdminForMethods } = require('../../../lib/apiAuth');
const { parseIntegerParam } = require('../../../lib/requestValidation');

async function handler(req, res) {
  try {
    const { method, query } = req;
    
    switch (method) {
      case 'GET':
        await handleGetCourses(req, res);
        break;
      case 'POST':
        await handleCreateCourse(req, res);
        break;
      case 'PUT':
        await handleUpdateCourse(req, res);
        break;
      case 'DELETE':
        await handleDeleteCourse(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    handleError(error, req, res);
  }
}



// 创建课程
async function handleCreateCourse(req, res) {
  const { name, format, description, isFree, status } = req.body;
  
  try {
    const query = `
      INSERT INTO courses (name, format, description, is_free, status, title, level)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const params = [name, format, description, isFree, status || '未上架', name, '初级'];
    
    const result = await pool.query(query, params);
    // 转换字段名，将 is_free 转换为 isFree
    const course = result.rows[0];
    if (course) {
      course.isFree = course.is_free;
      delete course.is_free;
    }
    return successResponse(res, course, '课程创建成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

// 更新课程
async function handleUpdateCourse(req, res) {
  const { id } = req.query;
  const { name, format, description, isFree, status } = req.body;
  
  try {
    // 检查课程是否存在
    const checkQuery = 'SELECT * FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '课程不存在' } });
    }
    
    // 获取当前课程数据
    const currentCourse = checkResult.rows[0];
    
    // 使用当前值作为默认值，只更新提供的字段
    const query = `
      UPDATE courses
      SET name = $1, format = $2, description = $3, is_free = $4, status = $5, title = $6, level = $7
      WHERE id = $8
      RETURNING *
    `;
    const params = [
      name !== undefined ? name : currentCourse.name,
      format !== undefined ? format : currentCourse.format,
      description !== undefined ? description : currentCourse.description,
      isFree !== undefined ? isFree : currentCourse.is_free,
      status !== undefined ? status : currentCourse.status,
      name !== undefined ? name : currentCourse.title,
      currentCourse.level || '初级',
      id
    ];
    
    const result = await pool.query(query, params);
    // 转换字段名，将 is_free 转换为 isFree
    const course = result.rows[0];
    if (course) {
      course.isFree = course.is_free;
      delete course.is_free;
    }
    return successResponse(res, course, '课程更新成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

// 获取课程列表
async function handleGetCourses(req, res) {
  const { page = 1, limit = 10, id, status } = req.query;
  const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
  const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 100, defaultValue: 10 });
  if (parsedPage.error || parsedLimit.error) {
    return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
  }
  
  try {
    let query = 'SELECT * FROM courses';
    let params = [];
    let whereClause = '';
    let paramIndex = 1;
    
    if (id) {
      whereClause = ' WHERE id = $' + paramIndex;
      params.push(id);
      paramIndex++;
    } else if (status) {
      whereClause = ' WHERE status = $' + paramIndex;
      params.push(status);
      paramIndex++;
    }
    
    query += whereClause;
    query += ' ORDER BY id DESC';
    
    // 分页
    if (!id) {
      const offset = (parsedPage.value - 1) * parsedLimit.value;
      query += ' LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      params.push(parsedLimit.value, offset);
    }
    
    const result = await pool.query(query, params);
    
    let total = 0;
    if (!id) {
      // 构建count查询
      let countQuery = 'SELECT COUNT(*) FROM courses' + whereClause;
      // 只使用where条件的参数，不包括limit和offset
      const countParams = params.slice(0, params.length - 2);
      const countResult = await pool.query(countQuery, countParams);
      total = parseInt(countResult.rows[0].count);
    }
    
    // 转换字段名，将 is_free 转换为 isFree
    const courses = result.rows.map(course => {
      const newCourse = { ...course };
      newCourse.isFree = newCourse.is_free;
      delete newCourse.is_free;
      return newCourse;
    });
    
    if (id) {
      // 单个课程查询
      if (courses.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '课程不存在' } });
      }
      return successResponse(res, courses[0]);
    } else {
      // 课程列表查询
      return successResponse(res, {
        data: courses,
        total,
        page: parsedPage.value,
        limit: parsedLimit.value
      });
    }
  } catch (error) {
    console.error('获取课程列表错误:', error);
    handleError(error, req, res);
  }
}

// 删除课程
async function handleDeleteCourse(req, res) {
  const { id } = req.query;
  
  try {
    // 检查课程是否存在
    const checkQuery = 'SELECT * FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '课程不存在' } });
    }
    
    const deleteQuery = 'DELETE FROM courses WHERE id = $1';
    const result = await pool.query(deleteQuery, [id]);
    
    return successResponse(res, null, '课程删除成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

export default withAdminForMethods(handler);
