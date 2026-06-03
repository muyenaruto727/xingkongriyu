const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');

async function handler(req, res) {
  try {
    const { method, query } = req;
    
    switch (method) {
      case 'GET':
        await handleGetTextbooks(req, res);
        break;
      case 'POST':
        await handleCreateTextbook(req, res);
        break;
      case 'PUT':
        await handleUpdateTextbook(req, res);
        break;
      case 'DELETE':
        await handleDeleteTextbook(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

// 默认教材数据（当数据库表不存在时使用）
const defaultTextbooks = [
  { id: 1, name: '综合日语1', description: '综合日语第一册', level: '初级', sort_order: 1, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lessons: [
    { id: 101, textbook_id: 1, name: '第5课', sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 102, textbook_id: 1, name: '第6课', sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 103, textbook_id: 1, name: '第7课', sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 104, textbook_id: 1, name: '第8课', sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 105, textbook_id: 1, name: '第9课', sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 106, textbook_id: 1, name: '第10课', sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 107, textbook_id: 1, name: '第11课', sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 108, textbook_id: 1, name: '第12课', sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 109, textbook_id: 1, name: '第13课', sort_order: 9, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 110, textbook_id: 1, name: '第14课', sort_order: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 111, textbook_id: 1, name: '第15课', sort_order: 11, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]},
  { id: 2, name: '综合日语2', description: '综合日语第二册', level: '初级', sort_order: 2, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lessons: [
    { id: 201, textbook_id: 2, name: '第16课', sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 202, textbook_id: 2, name: '第17课', sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 203, textbook_id: 2, name: '第18课', sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 204, textbook_id: 2, name: '第19课', sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 205, textbook_id: 2, name: '第20课', sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 206, textbook_id: 2, name: '第21课', sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 207, textbook_id: 2, name: '第22课', sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 208, textbook_id: 2, name: '第23课', sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 209, textbook_id: 2, name: '第24课', sort_order: 9, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 210, textbook_id: 2, name: '第25课', sort_order: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 211, textbook_id: 2, name: '第26课', sort_order: 11, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 212, textbook_id: 2, name: '第27课', sort_order: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 213, textbook_id: 2, name: '第28课', sort_order: 13, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 214, textbook_id: 2, name: '第29课', sort_order: 14, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 215, textbook_id: 2, name: '第30课', sort_order: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]},
  { id: 3, name: '综合日语3', description: '综合日语第三册', level: '中级', sort_order: 3, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lessons: [
    { id: 301, textbook_id: 3, name: '第1课', sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 302, textbook_id: 3, name: '第2课', sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 303, textbook_id: 3, name: '第3课', sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 304, textbook_id: 3, name: '第4课', sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 305, textbook_id: 3, name: '第5课', sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 306, textbook_id: 3, name: '第6课', sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 307, textbook_id: 3, name: '第7课', sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 308, textbook_id: 3, name: '第8课', sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 309, textbook_id: 3, name: '第9课', sort_order: 9, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 310, textbook_id: 3, name: '第10课', sort_order: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]},
  { id: 4, name: '综合日语4', description: '综合日语第四册', level: '中级', sort_order: 4, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lessons: [
    { id: 401, textbook_id: 4, name: '第11课', sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 402, textbook_id: 4, name: '第12课', sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 403, textbook_id: 4, name: '第13课', sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 404, textbook_id: 4, name: '第14课', sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 405, textbook_id: 4, name: '第15课', sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 406, textbook_id: 4, name: '第16课', sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 407, textbook_id: 4, name: '第17课', sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 408, textbook_id: 4, name: '第18课', sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 409, textbook_id: 4, name: '第19课', sort_order: 9, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 410, textbook_id: 4, name: '第20课', sort_order: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]},
  { id: 5, name: '大家的日语初级上', description: '大家的日语初级上册', level: '初级', sort_order: 5, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lessons: [
    { id: 501, textbook_id: 5, name: '第1课', sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 502, textbook_id: 5, name: '第2课', sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 503, textbook_id: 5, name: '第3课', sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 504, textbook_id: 5, name: '第4课', sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 505, textbook_id: 5, name: '第5课', sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 506, textbook_id: 5, name: '第6课', sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 507, textbook_id: 5, name: '第7课', sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 508, textbook_id: 5, name: '第8课', sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 509, textbook_id: 5, name: '第9课', sort_order: 9, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 510, textbook_id: 5, name: '第10课', sort_order: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 511, textbook_id: 5, name: '第11课', sort_order: 11, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 512, textbook_id: 5, name: '第12课', sort_order: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 513, textbook_id: 5, name: '第13课', sort_order: 13, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 514, textbook_id: 5, name: '第14课', sort_order: 14, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 515, textbook_id: 5, name: '第15课', sort_order: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 516, textbook_id: 5, name: '第16课', sort_order: 16, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 517, textbook_id: 5, name: '第17课', sort_order: 17, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 518, textbook_id: 5, name: '第18课', sort_order: 18, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 519, textbook_id: 5, name: '第19课', sort_order: 19, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 520, textbook_id: 5, name: '第20课', sort_order: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 521, textbook_id: 5, name: '第21课', sort_order: 21, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 522, textbook_id: 5, name: '第22课', sort_order: 22, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 523, textbook_id: 5, name: '第23课', sort_order: 23, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 524, textbook_id: 5, name: '第24课', sort_order: 24, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 525, textbook_id: 5, name: '第25课', sort_order: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]},
  { id: 6, name: '大家的日语初级下', description: '大家的日语初级下册', level: '初级', sort_order: 6, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lessons: [
    { id: 601, textbook_id: 6, name: '第25课', sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 602, textbook_id: 6, name: '第26课', sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 603, textbook_id: 6, name: '第27课', sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 604, textbook_id: 6, name: '第28课', sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 605, textbook_id: 6, name: '第29课', sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 606, textbook_id: 6, name: '第30课', sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 607, textbook_id: 6, name: '第31课', sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 608, textbook_id: 6, name: '第32课', sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 609, textbook_id: 6, name: '第33课', sort_order: 9, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 610, textbook_id: 6, name: '第34课', sort_order: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 611, textbook_id: 6, name: '第35课', sort_order: 11, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 612, textbook_id: 6, name: '第36课', sort_order: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 613, textbook_id: 6, name: '第37课', sort_order: 13, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 614, textbook_id: 6, name: '第38课', sort_order: 14, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 615, textbook_id: 6, name: '第39课', sort_order: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 616, textbook_id: 6, name: '第40课', sort_order: 16, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 617, textbook_id: 6, name: '第41课', sort_order: 17, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 618, textbook_id: 6, name: '第42课', sort_order: 18, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 619, textbook_id: 6, name: '第43课', sort_order: 19, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 620, textbook_id: 6, name: '第44课', sort_order: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 621, textbook_id: 6, name: '第45课', sort_order: 21, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 622, textbook_id: 6, name: '第46课', sort_order: 22, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 623, textbook_id: 6, name: '第47课', sort_order: 23, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 624, textbook_id: 6, name: '第48课', sort_order: 24, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 625, textbook_id: 6, name: '第49课', sort_order: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 626, textbook_id: 6, name: '第50课', sort_order: 26, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]},
  { id: 7, name: '大家的日语中级上', description: '大家的日语中级上册', level: '中级', sort_order: 7, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lessons: [
    { id: 701, textbook_id: 7, name: '第1课', sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 702, textbook_id: 7, name: '第2课', sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 703, textbook_id: 7, name: '第3课', sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 704, textbook_id: 7, name: '第4课', sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 705, textbook_id: 7, name: '第5课', sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 706, textbook_id: 7, name: '第6课', sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 707, textbook_id: 7, name: '第7课', sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 708, textbook_id: 7, name: '第8课', sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 709, textbook_id: 7, name: '第9课', sort_order: 9, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 710, textbook_id: 7, name: '第10课', sort_order: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 711, textbook_id: 7, name: '第11课', sort_order: 11, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 712, textbook_id: 7, name: '第12课', sort_order: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]},
  { id: 8, name: '大家的日语中级下', description: '大家的日语中级下册', level: '中级', sort_order: 8, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lessons: [
    { id: 801, textbook_id: 8, name: '第13课', sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 802, textbook_id: 8, name: '第14课', sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 803, textbook_id: 8, name: '第15课', sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 804, textbook_id: 8, name: '第16课', sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 805, textbook_id: 8, name: '第17课', sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 806, textbook_id: 8, name: '第18课', sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 807, textbook_id: 8, name: '第19课', sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 808, textbook_id: 8, name: '第20课', sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 809, textbook_id: 8, name: '第21课', sort_order: 9, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 810, textbook_id: 8, name: '第22课', sort_order: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 811, textbook_id: 8, name: '第23课', sort_order: 11, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 812, textbook_id: 8, name: '第24课', sort_order: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]},
];

// 获取教材列表（包含课程）
async function handleGetTextbooks(req, res) {
  const { id } = req.query;
  
  try {
    if (id) {
      // 获取单个教材及其课程
      const query = `
        SELECT t.*, 
               COALESCE(json_agg(l.* ORDER BY l.sort_order), '[]') as lessons
        FROM textbooks t
        LEFT JOIN textbook_lessons l ON t.id = l.textbook_id
        WHERE t.id = $1
        GROUP BY t.id
      `;
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        // 如果数据库中没有找到，尝试从默认数据中查找
        const defaultTextbook = defaultTextbooks.find(t => t.id === parseInt(id));
        if (defaultTextbook) {
          return successResponse(res, defaultTextbook);
        }
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '教材不存在' } });
      }
      
      return successResponse(res, result.rows[0]);
    } else {
      // 获取所有教材列表（带课程）
      const query = `
        SELECT t.*, 
               COALESCE(json_agg(l.* ORDER BY l.sort_order), '[]') as lessons
        FROM textbooks t
        LEFT JOIN textbook_lessons l ON t.id = l.textbook_id
        GROUP BY t.id
        ORDER BY t.sort_order, t.created_at DESC
      `;
      const result = await pool.query(query);
      
      return successResponse(res, result.rows);
    }
  } catch (error) {
    // 如果表不存在或其他数据库错误，返回默认数据
    console.warn('Database error, returning default textbooks:', error.message);
    if (error.message && error.message.includes('does not exist')) {
      return successResponse(res, defaultTextbooks);
    }
    handleError(error, req, res);
  }
}

// 创建教材
async function handleCreateTextbook(req, res) {
  const { name, description, level, sort_order, lessons } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '教材名称不能为空' } });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 创建教材
    const textbookQuery = `
      INSERT INTO textbooks (name, description, level, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const textbookResult = await client.query(textbookQuery, [name, description || '', level || '', sort_order || 0]);
    const textbook = textbookResult.rows[0];
    
    // 如果有课程数据，批量插入
    if (lessons && Array.isArray(lessons) && lessons.length > 0) {
      const lessonsQuery = `
        INSERT INTO textbook_lessons (textbook_id, name, sort_order)
        VALUES ${lessons.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(',')}
      `;
      const params = [textbook.id];
      lessons.forEach((lesson, i) => {
        params.push(lesson.name || `第${i + 1}课`);
        params.push(lesson.sort_order || i);
      });
      await client.query(lessonsQuery, params);
    }
    
    await client.query('COMMIT');
    
    // 获取包含课程的完整教材信息
    const fullQuery = `
      SELECT t.*, 
             COALESCE(json_agg(l.* ORDER BY l.sort_order), '[]') as lessons
      FROM textbooks t
      LEFT JOIN textbook_lessons l ON t.id = l.textbook_id
      WHERE t.id = $1
      GROUP BY t.id
    `;
    const fullResult = await client.query(fullQuery, [textbook.id]);
    
    return successResponse(res, fullResult.rows[0], '教材创建成功');
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505' && error.constraint === 'textbooks_name_key') {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE_NAME', message: '教材名称已存在' } });
    }
    handleError(error, req, res);
  } finally {
    client.release();
  }
}

// 更新教材
async function handleUpdateTextbook(req, res) {
  const { id } = req.query;
  const { name, description, level, sort_order, lessons } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 更新教材信息
    const textbookQuery = `
      UPDATE textbooks
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          level = COALESCE($3, level),
          sort_order = COALESCE($4, sort_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    const textbookResult = await client.query(textbookQuery, [name, description, level, sort_order, id]);
    
    if (textbookResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '教材不存在' } });
    }
    
    // 如果有课程数据，先删除旧课程再插入新课程
    if (lessons !== undefined && Array.isArray(lessons)) {
      await client.query('DELETE FROM textbook_lessons WHERE textbook_id = $1', [id]);
      
      if (lessons.length > 0) {
        const lessonsQuery = `
          INSERT INTO textbook_lessons (textbook_id, name, sort_order)
          VALUES ${lessons.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(',')}
        `;
        const params = [id];
        lessons.forEach((lesson, i) => {
          params.push(lesson.name || `第${i + 1}课`);
          params.push(lesson.sort_order || i);
        });
        await client.query(lessonsQuery, params);
      }
    }
    
    await client.query('COMMIT');
    
    // 获取包含课程的完整教材信息
    const fullQuery = `
      SELECT t.*, 
             COALESCE(json_agg(l.* ORDER BY l.sort_order), '[]') as lessons
      FROM textbooks t
      LEFT JOIN textbook_lessons l ON t.id = l.textbook_id
      WHERE t.id = $1
      GROUP BY t.id
    `;
    const fullResult = await client.query(fullQuery, [id]);
    
    return successResponse(res, fullResult.rows[0], '教材更新成功');
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505' && error.constraint === 'textbooks_name_key') {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE_NAME', message: '教材名称已存在' } });
    }
    handleError(error, req, res);
  } finally {
    client.release();
  }
}

// 删除教材
async function handleDeleteTextbook(req, res) {
  const { id } = req.query;
  
  try {
    // 检查教材是否存在
    const checkQuery = 'SELECT * FROM textbooks WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '教材不存在' } });
    }
    
    // 硬删除教材（关联的课程会自动删除）
    const deleteQuery = 'DELETE FROM textbooks WHERE id = $1';
    await pool.query(deleteQuery, [id]);
    
    return successResponse(res, null, '教材删除成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

module.exports = handler;
