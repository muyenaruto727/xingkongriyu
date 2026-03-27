const pool = require('../../../lib/db');
const rateLimit = require('../../../lib/rateLimit');
const cache = require('../../../lib/cache');

// 应用速率限制
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 100, // 每分钟最多100个请求
  message: '请求过于频繁，请稍后再试。'
});

async function handler(req, res) {
  // 应用速率限制
  await new Promise((resolve, reject) => {
    limiter(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { level, tag, search, textbooks, lessons, page = 1, limit = 10 } = req.query;
        
        // 生成缓存键
        const cacheKey = cache.generateKey('vocabulary', {
          level,
          tag,
          search,
          textbooks,
          lessons,
          page,
          limit
        });
        
        // 尝试从缓存获取数据
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          return res.status(200).json(cachedData);
        }
        
        let query = 'SELECT * FROM vocabulary WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (level && level !== '全部' && level !== '') {
          query += ` AND level = $${paramIndex}`;
          params.push(level);
          paramIndex++;
        }

        if (tag && tag !== '全部' && tag !== '') {
          query += ` AND tag = $${paramIndex}`;
          params.push(tag);
          paramIndex++;
        }

        // 处理多选教材
        if (textbooks) {
          const textbookList = Array.isArray(textbooks) ? textbooks : [textbooks];
          if (textbookList.length > 0 && textbookList[0] !== '') {
            // 使用OR条件匹配逗号分隔的教材
            const textbookConditions = textbookList.map(() => `(textbook = $${paramIndex} OR textbook LIKE $${paramIndex}||',%' OR textbook LIKE '%,'||$${paramIndex} OR textbook LIKE '%,'||$${paramIndex}||',%')`).join(' OR ');
            query += ` AND (${textbookConditions})`;
            params.push(...textbookList);
            paramIndex++;
          }
        }

        // 处理多选课程
        if (lessons) {
          const lessonList = Array.isArray(lessons) ? lessons : [lessons];
          if (lessonList.length > 0 && lessonList[0] !== '') {
            // 提取课程名称部分
            const extractedLessons = lessonList.map(lessonItem => {
              const parts = lessonItem.split(':');
              return parts.length > 1 ? parts[1] : lessonItem;
            });
            // 使用OR条件匹配逗号分隔的课程
            const lessonConditions = extractedLessons.map(() => `(lesson = $${paramIndex} OR lesson LIKE $${paramIndex}||',%' OR lesson LIKE '%,'||$${paramIndex} OR lesson LIKE '%,'||$${paramIndex}||',%')`).join(' OR ');
            query += ` AND (${lessonConditions})`;
            params.push(...extractedLessons);
            paramIndex++;
          }
        }

        if (search) {
          query += ` AND (japanese ILIKE $${paramIndex} OR pronunciation ILIKE $${paramIndex})`;
          params.push(`%${search}%`);
          paramIndex++;
        }

        // 获取总记录数（优化：只查询必要的字段）
        const countQuery = `SELECT COUNT(*) FROM vocabulary WHERE ${query.replace('SELECT * FROM vocabulary WHERE ', '')}`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // 添加分页
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY id DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
        params.push(parseInt(limit), offset);

        const result = await pool.query(query, params);
        const responseData = { data: result.rows, total };
        
        // 存入缓存，缓存时间为5分钟
        cache.set(cacheKey, responseData, 5 * 60 * 1000);
        
        res.status(200).json(responseData);
      } catch (error) {
        console.error('Error fetching vocabulary:', error);
        res.status(500).json({ error: 'Failed to fetch vocabulary' });
      }
      break;

    case 'POST':
      try {
        const { batch, japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples, textbook, lesson } = req.body;
        
        // 处理批量导入
        if (batch && Array.isArray(batch)) {
          const results = [];
          for (const item of batch) {
            // 构建动态SQL查询，根据数据库结构调整
            let query, params;
            try {
              // 尝试包含textbook和lesson字段
              query = `INSERT INTO vocabulary (japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples, textbook, lesson)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                       RETURNING *`;
              params = [
                item.japanese,
                item.pronunciation,
                item.chinese,
                item.level,
                Array.isArray(item.category) ? item.category.join(',') : item.category,
                Array.isArray(item.pitchAccent) ? item.pitchAccent.join(',') : item.pitchAccent,
                item.tag,
                Array.isArray(item.examples) ? item.examples : [item.examples],
                Array.isArray(item.textbooks) ? item.textbooks.join(',') : item.textbooks,
                Array.isArray(item.lessons) ? item.lessons.join(',') : item.lessons
              ];
              const result = await pool.query(query, params);
              results.push(result.rows[0]);
            } catch (e) {
              // 如果失败，尝试不包含textbook和lesson字段
              console.log('Falling back to original schema without textbook and lesson');
              query = `INSERT INTO vocabulary (japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                       RETURNING *`;
              params = [
                item.japanese,
                item.pronunciation,
                item.chinese,
                item.level,
                Array.isArray(item.category) ? item.category.join(',') : item.category,
                Array.isArray(item.pitchAccent) ? item.pitchAccent.join(',') : item.pitchAccent,
                item.tag,
                Array.isArray(item.examples) ? item.examples : [item.examples]
              ];
              const result = await pool.query(query, params);
              results.push(result.rows[0]);
            }
          }
          // 清除缓存
          cache.clear();
          res.status(201).json({ message: '批量导入成功', data: results });
        } else {
          // 处理单个词汇添加
          // 构建动态SQL查询，根据数据库结构调整
          let query, params;
          try {
            // 尝试包含textbook和lesson字段
            query = `INSERT INTO vocabulary (japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples, textbook, lesson)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     RETURNING *`;
            params = [japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples || [], textbook, lesson];
            const result = await pool.query(query, params);
            // 清除缓存
            cache.clear();
            res.status(201).json(result.rows[0]);
          } catch (e) {
            // 如果失败，尝试不包含textbook和lesson字段
            console.log('Falling back to original schema without textbook and lesson');
            query = `INSERT INTO vocabulary (japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING *`;
            params = [japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples || []];
            const result = await pool.query(query, params);
            // 清除缓存
            cache.clear();
            res.status(201).json(result.rows[0]);
          }
        }
      } catch (error) {
        console.error('Error creating vocabulary:', error);
        res.status(500).json({ error: 'Failed to create vocabulary' });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const { japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples, textbook, lesson } = req.body;
        
        // 构建动态SQL查询，根据数据库结构调整
        let query, params;
        try {
          // 尝试包含textbook和lesson字段
          query = `UPDATE vocabulary 
                   SET japanese = $1, pronunciation = $2, chinese = $3, level = $4, 
                       category = $5, pitch_accent = $6, tag = $7, examples = $8, 
                       textbook = $9, lesson = $10, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $11
                   RETURNING *`;
          params = [japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples || [], textbook, lesson, id];
          const result = await pool.query(query, params);
          // 清除缓存
          cache.clear();
          res.status(200).json(result.rows[0]);
        } catch (e) {
          // 如果失败，尝试不包含textbook和lesson字段
          console.log('Falling back to original schema without textbook and lesson');
          query = `UPDATE vocabulary 
                   SET japanese = $1, pronunciation = $2, chinese = $3, level = $4, 
                       category = $5, pitch_accent = $6, tag = $7, examples = $8, 
                       updated_at = CURRENT_TIMESTAMP
                   WHERE id = $9
                   RETURNING *`;
          params = [japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples || [], id];
          const result = await pool.query(query, params);
          // 清除缓存
          cache.clear();
          res.status(200).json(result.rows[0]);
        }
      } catch (error) {
        console.error('Error updating vocabulary:', error);
        res.status(500).json({ error: 'Failed to update vocabulary' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        await pool.query('DELETE FROM vocabulary WHERE id = $1', [id]);
        
        // 清除缓存
        cache.clear();
        
        res.status(200).json({ message: 'Vocabulary deleted successfully' });
      } catch (error) {
        console.error('Error deleting vocabulary:', error);
        res.status(500).json({ error: 'Failed to delete vocabulary' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = handler;
