const pool = require('../../../lib/db');
const rateLimit = require('../../../lib/rateLimit');
const cache = require('../../../lib/cache');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { withAdminForMethods } = require('../../../lib/apiAuth');
const { parseIntegerParam } = require('../../../lib/requestValidation');

// 应用速率限制
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 100, // 每分钟最多100个请求
  message: '请求过于频繁，请稍后再试。'
});

async function handler(req, res) {
  const allowed = await rateLimit.applyRateLimit(req, res, limiter);
  if (!allowed) {
    return;
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // 支持单数和复数形式的参数名
const { level, tag, search, textbooks, lessons, textbook, lesson, page = 1, limit = 20 } = req.query;
const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 10000, defaultValue: 20 });
if (parsedPage.error || parsedLimit.error) {
  return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
}
const finalTextbooks = textbooks || textbook;
const finalLessons = lessons || lesson;
        
        // 生成缓存键
        const cacheKey = cache.generateKey('vocabulary', {
          level,
          tag,
          search,
          textbooks: finalTextbooks,
          lessons: finalLessons,
          page,
          limit
        });
        
        // 尝试从缓存获取数据
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          return successResponse(res, cachedData);
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

        // 处理教材筛选（支持单选和多选）
        if (finalTextbooks && finalTextbooks !== '全部' && finalTextbooks !== '') {
          const textbookList = Array.isArray(finalTextbooks) ? finalTextbooks : [finalTextbooks];
          if (textbookList.length > 0 && textbookList[0] !== '全部') {
            // 使用OR条件匹配逗号分隔的教材
            // 同时通过 lesson 字段以 "教材名:课程名" 格式存储的情况来匹配教材名
            const textbookConditions = textbookList.map(() =>
              `(textbook = $${paramIndex} OR textbook LIKE $${paramIndex}||',%' OR textbook LIKE '%,'||$${paramIndex} OR textbook LIKE '%,'||$${paramIndex}||',%' OR lesson LIKE $${paramIndex}||':%')`
            ).join(' OR ');
            query += ` AND (${textbookConditions})`;
            params.push(...textbookList);
            paramIndex += textbookList.length;
          }
        }

        // 处理课程筛选（支持单选和多选）
        if (finalLessons && finalLessons !== '全部' && finalLessons !== '') {
          const lessonList = Array.isArray(finalLessons) ? finalLessons : [finalLessons];
          if (lessonList.length > 0 && lessonList[0] !== '全部') {
            // 课程可能以 "教材名:课程名" 或纯 "课程名" 形式传入
            // 数据库中可能存储完整格式 "综合日语1:第5课" 或纯课程名 "第5课"
            const lessonPatterns = [];
            lessonList.forEach(lessonItem => {
              const parts = String(lessonItem).split(':');
              const stripped = parts.length > 1 ? parts[1] : lessonItem;
              lessonPatterns.push({ original: String(lessonItem), stripped });
            });
            const lessonConditions = lessonPatterns.map(() =>
              // 匹配: 精确匹配 original 或 stripped, 或以 original/stripped 开头后跟逗号,
              // 或前面有逗号后跟 original/stripped, 或前后都有逗号,
              // 或 lesson 以 "教材名:课程名" 格式存储，匹配后缀部分（如 lesson LIKE '%:第5课'）
              `(lesson = $${paramIndex} OR lesson = $${paramIndex + 1} OR lesson LIKE $${paramIndex}||',%' OR lesson LIKE $${paramIndex + 1}||',%' OR lesson LIKE '%,'||$${paramIndex} OR lesson LIKE '%,'||$${paramIndex + 1} OR lesson LIKE '%,'||$${paramIndex}||',%' OR lesson LIKE '%,'||$${paramIndex + 1}||',%' OR lesson LIKE '%:'||$${paramIndex} OR lesson LIKE '%:'||$${paramIndex + 1} OR lesson LIKE '%:'||$${paramIndex}||',%' OR lesson LIKE '%:'||$${paramIndex + 1}||',%')`
            ).join(' OR ');
            query += ` AND (${lessonConditions})`;
            lessonPatterns.forEach(p => {
              params.push(p.original, p.stripped);
              paramIndex += 2;
            });
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
        const offset = (parsedPage.value - 1) * parsedLimit.value;
        query += ' ORDER BY id DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
        params.push(parsedLimit.value, offset);

        const result = await pool.query(query, params);
        const responseData = { data: result.rows, total };
        
        // 存入缓存，缓存时间为5分钟
        cache.set(cacheKey, responseData, 5 * 60 * 1000);
        
        return successResponse(res, responseData);
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'POST':
      try {
        const { batch, japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples, textbook, lesson } = req.body;
        const isDuplicateVocab = async (item) => {
          const duplicateResult = await pool.query(
            'SELECT id FROM vocabulary WHERE japanese = $1 AND pronunciation = $2 AND level = $3 LIMIT 1',
            [item.japanese, item.pronunciation, item.level]
          );
          return duplicateResult.rows.length > 0;
        };
        
        // 处理批量导入
        if (batch && Array.isArray(batch)) {
          const results = [];
          for (const item of batch) {
            if (await isDuplicateVocab(item)) {
              continue;
            }
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
          return successResponse(res, results, '批量导入成功');
        } else {
          if (await isDuplicateVocab({ japanese, pronunciation, level })) {
            return res.status(409).json({ success: false, error: { code: 'DUPLICATE_RESOURCE', message: '词汇已存在' } });
          }
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
            return successResponse(res, result.rows[0], '词汇添加成功');
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
            return successResponse(res, result.rows[0], '词汇添加成功');
          }
        }
      } catch (error) {
        handleError(error, req, res);
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
            return successResponse(res, result.rows[0], '词汇更新成功');
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
            return successResponse(res, result.rows[0], '词汇更新成功');
        }
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        await pool.query('DELETE FROM vocabulary WHERE id = $1', [id]);
        
        // 清除缓存
        cache.clear();
        
        return successResponse(res, null, '词汇删除成功');
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    default:
      res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }
}

export default withAdminForMethods(handler);
