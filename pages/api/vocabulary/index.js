const pool = require('../../../lib/db');
const rateLimit = require('../../../lib/rateLimit');
const cache = require('../../../lib/cache');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { withAdminForMethods } = require('../../../lib/apiAuth');
const { parseIntegerParam } = require('../../../lib/requestValidation');
const {
  buildVocabularyFilterCandidates,
  normalizeVocabularyRecord,
} = require('../../../lib/vocabularyOptions');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: '请求过于频繁，请稍后再试。',
});

function hasQueryValue(value) {
  return value !== undefined && value !== null && value !== '' && value !== '全部';
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return [value];
}

async function handler(req, res) {
  const allowed = await rateLimit.applyRateLimit(req, res, limiter);
  if (!allowed) {
    return;
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const {
          level,
          tag,
          search,
          textbooks,
          lessons,
          textbook,
          lesson,
          page = 1,
          limit = 20,
        } = req.query;

        const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
        const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 10000, defaultValue: 20 });
        if (parsedPage.error || parsedLimit.error) {
          return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
        }

        const finalTextbooks = textbooks || textbook;
        const finalLessons = lessons || lesson;

        const cacheKey = cache.generateKey('vocabulary', {
          level,
          tag,
          search,
          textbooks: finalTextbooks,
          lessons: finalLessons,
          page,
          limit,
        });

        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          return successResponse(res, cachedData);
        }

        let query = 'SELECT * FROM vocabulary WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (hasQueryValue(level)) {
          const levelCandidates = buildVocabularyFilterCandidates('level', level);
          if (levelCandidates.length > 0) {
            query += ` AND (${levelCandidates.map((_, index) => `level = $${paramIndex + index}`).join(' OR ')})`;
            params.push(...levelCandidates);
            paramIndex += levelCandidates.length;
          }
        }

        if (hasQueryValue(tag)) {
          const tagCandidates = buildVocabularyFilterCandidates('tag', tag);
          if (tagCandidates.length > 0) {
            query += ` AND (${tagCandidates.map((_, index) => `tag = $${paramIndex + index}`).join(' OR ')})`;
            params.push(...tagCandidates);
            paramIndex += tagCandidates.length;
          }
        }

        if (finalTextbooks && finalTextbooks !== '全部' && finalTextbooks !== '') {
          const textbookList = Array.isArray(finalTextbooks) ? finalTextbooks : [finalTextbooks];
          if (textbookList.length > 0 && textbookList[0] !== '全部') {
            const textbookConditions = textbookList.map(() =>
              `(textbook = $${paramIndex} OR textbook LIKE $${paramIndex}||',%' OR textbook LIKE '%,'||$${paramIndex} OR textbook LIKE '%,'||$${paramIndex}||',%' OR lesson LIKE $${paramIndex}||':%')`
            ).join(' OR ');
            query += ` AND (${textbookConditions})`;
            params.push(...textbookList);
            paramIndex += textbookList.length;
          }
        }

        if (finalLessons && finalLessons !== '全部' && finalLessons !== '') {
          const lessonList = Array.isArray(finalLessons) ? finalLessons : [finalLessons];
          if (lessonList.length > 0 && lessonList[0] !== '全部') {
            const lessonPatterns = [];
            lessonList.forEach((lessonItem) => {
              const parts = String(lessonItem).split(':');
              const stripped = parts.length > 1 ? parts[1] : lessonItem;
              lessonPatterns.push({ original: String(lessonItem), stripped });
            });

            const lessonConditions = lessonPatterns.map(() =>
              `(lesson = $${paramIndex} OR lesson = $${paramIndex + 1} OR lesson LIKE $${paramIndex}||',%' OR lesson LIKE $${paramIndex + 1}||',%' OR lesson LIKE '%,'||$${paramIndex} OR lesson LIKE '%,'||$${paramIndex + 1} OR lesson LIKE '%,'||$${paramIndex}||',%' OR lesson LIKE '%,'||$${paramIndex + 1}||',%' OR lesson LIKE '%:'||$${paramIndex} OR lesson LIKE '%:'||$${paramIndex + 1} OR lesson LIKE '%:'||$${paramIndex}||',%' OR lesson LIKE '%:'||$${paramIndex + 1}||',%')`
            ).join(' OR ');
            query += ` AND (${lessonConditions})`;
            lessonPatterns.forEach((pattern) => {
              params.push(pattern.original, pattern.stripped);
              paramIndex += 2;
            });
          }
        }

        if (search) {
          query += ` AND (japanese ILIKE $${paramIndex} OR pronunciation ILIKE $${paramIndex})`;
          params.push(`%${search}%`);
          paramIndex++;
        }

        const countQuery = `SELECT COUNT(*) FROM vocabulary WHERE ${query.replace('SELECT * FROM vocabulary WHERE ', '')}`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        const offset = (parsedPage.value - 1) * parsedLimit.value;
        query += ' ORDER BY id DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
        params.push(parsedLimit.value, offset);

        const result = await pool.query(query, params);
        const responseData = { data: result.rows, total };

        cache.set(cacheKey, responseData, 5 * 60 * 1000);
        return successResponse(res, responseData);
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'POST':
      try {
        const {
          batch,
          japanese,
          pronunciation,
          chinese,
          level,
          category,
          pitch_accent,
          tag,
          examples,
          textbook,
          lesson,
        } = req.body;

        const isDuplicateVocab = async (item) => {
          const duplicateResult = await pool.query(
            'SELECT id FROM vocabulary WHERE japanese = $1 AND pronunciation = $2 AND level = $3 LIMIT 1',
            [item.japanese, item.pronunciation, item.level]
          );
          return duplicateResult.rows.length > 0;
        };

        if (batch && Array.isArray(batch)) {
          const results = [];

          for (const item of batch) {
            const normalizedItem = normalizeVocabularyRecord(item);
            if (await isDuplicateVocab(normalizedItem)) {
              continue;
            }

            let query;
            let params;

            try {
              query = `INSERT INTO vocabulary (japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples, textbook, lesson)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                       RETURNING *`;
              params = [
                normalizedItem.japanese,
                normalizedItem.pronunciation,
                normalizedItem.chinese,
                normalizedItem.level,
                normalizedItem.category,
                normalizedItem.pitch_accent,
                normalizedItem.tag,
                toArray(normalizedItem.examples),
                Array.isArray(normalizedItem.textbooks) ? normalizedItem.textbooks.join(',') : normalizedItem.textbooks,
                Array.isArray(normalizedItem.lessons) ? normalizedItem.lessons.join(',') : normalizedItem.lessons,
              ];
              const result = await pool.query(query, params);
              results.push(result.rows[0]);
            } catch (error) {
              console.log('Falling back to original schema without textbook and lesson');
              query = `INSERT INTO vocabulary (japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                       RETURNING *`;
              params = [
                normalizedItem.japanese,
                normalizedItem.pronunciation,
                normalizedItem.chinese,
                normalizedItem.level,
                normalizedItem.category,
                normalizedItem.pitch_accent,
                normalizedItem.tag,
                toArray(normalizedItem.examples),
              ];
              const result = await pool.query(query, params);
              results.push(result.rows[0]);
            }
          }

          cache.clear();
          return successResponse(res, results, '批量导入成功');
        }

        const normalizedItem = normalizeVocabularyRecord({
          japanese,
          pronunciation,
          chinese,
          level,
          category,
          pitch_accent,
          tag,
          examples,
          textbook,
          lesson,
        });

        if (await isDuplicateVocab(normalizedItem)) {
          return res.status(409).json({ success: false, error: { code: 'DUPLICATE_RESOURCE', message: '词汇已存在' } });
        }

        let query;
        let params;

        try {
          query = `INSERT INTO vocabulary (japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples, textbook, lesson)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                   RETURNING *`;
          params = [
            normalizedItem.japanese,
            normalizedItem.pronunciation,
            normalizedItem.chinese,
            normalizedItem.level,
            normalizedItem.category,
            normalizedItem.pitch_accent,
            normalizedItem.tag,
            toArray(normalizedItem.examples),
            normalizedItem.textbook,
            normalizedItem.lesson,
          ];
          const result = await pool.query(query, params);
          cache.clear();
          return successResponse(res, result.rows[0], '词汇添加成功');
        } catch (error) {
          console.log('Falling back to original schema without textbook and lesson');
          query = `INSERT INTO vocabulary (japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                   RETURNING *`;
          params = [
            normalizedItem.japanese,
            normalizedItem.pronunciation,
            normalizedItem.chinese,
            normalizedItem.level,
            normalizedItem.category,
            normalizedItem.pitch_accent,
            normalizedItem.tag,
            toArray(normalizedItem.examples),
          ];
          const result = await pool.query(query, params);
          cache.clear();
          return successResponse(res, result.rows[0], '词汇添加成功');
        }
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const normalizedItem = normalizeVocabularyRecord(req.body);

        let query;
        let params;

        try {
          query = `UPDATE vocabulary 
                   SET japanese = $1, pronunciation = $2, chinese = $3, level = $4, 
                       category = $5, pitch_accent = $6, tag = $7, examples = $8, 
                       textbook = $9, lesson = $10, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $11
                   RETURNING *`;
          params = [
            normalizedItem.japanese,
            normalizedItem.pronunciation,
            normalizedItem.chinese,
            normalizedItem.level,
            normalizedItem.category,
            normalizedItem.pitch_accent,
            normalizedItem.tag,
            toArray(normalizedItem.examples),
            normalizedItem.textbook,
            normalizedItem.lesson,
            id,
          ];
          const result = await pool.query(query, params);
          cache.clear();
          return successResponse(res, result.rows[0], '词汇更新成功');
        } catch (error) {
          console.log('Falling back to original schema without textbook and lesson');
          query = `UPDATE vocabulary 
                   SET japanese = $1, pronunciation = $2, chinese = $3, level = $4, 
                       category = $5, pitch_accent = $6, tag = $7, examples = $8, 
                       updated_at = CURRENT_TIMESTAMP
                   WHERE id = $9
                   RETURNING *`;
          params = [
            normalizedItem.japanese,
            normalizedItem.pronunciation,
            normalizedItem.chinese,
            normalizedItem.level,
            normalizedItem.category,
            normalizedItem.pitch_accent,
            normalizedItem.tag,
            toArray(normalizedItem.examples),
            id,
          ];
          const result = await pool.query(query, params);
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
