const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { withAdminForMethods } = require('../../../lib/apiAuth');
const { parseIntegerParam } = require('../../../lib/requestValidation');

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { level, search, page = 1, limit = 10, export: isExport } = req.query;
        const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
        const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 100, defaultValue: 10 });
        if (!isExport && (parsedPage.error || parsedLimit.error)) {
          return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
        }
        let whereClause = '1=1';
        const params = [];
        let paramIndex = 1;

        if (level && level !== '全部' && level !== '') {
          whereClause += ` AND level = $${paramIndex}`;
          params.push(level);
          paramIndex++;
        }

        if (search) {
          whereClause += ` AND grammar_point ILIKE $${paramIndex}`;
          params.push(`%${search}%`);
          paramIndex++;
        }

        // 构建主查询
        let query = `SELECT * FROM grammar WHERE ${whereClause} ORDER BY id DESC`;
        
        // 如果不是导出，添加分页
        if (!isExport) {
          const offset = (parsedPage.value - 1) * parsedLimit.value;
          query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
          params.push(parsedLimit.value, offset);
        }

        const result = await pool.query(query, params);
        
        const grammarList = result.rows.map(row => ({
          id: row.id,
          grammarPoint: row.grammar_point,
          level: row.level,
          japaneseMeaning: row.japanese_meaning,
          chineseMeaning: row.chinese_meaning,
          continuation: row.continuation,
          attentionPoints: row.attention_points,
          translationExercises: row.translation_exercises || [],
          referenceAnswers: row.reference_answers || [],
          examples: row.examples || []
        }));

        // 如果是导出，直接返回所有数据
        if (isExport) {
          return successResponse(res, grammarList);
        }

        // 否则，返回分页数据
        // 构建countQuery
        const countQuery = `SELECT COUNT(*) FROM grammar WHERE ${whereClause}`;
        // 只使用除了LIMIT和OFFSET之外的参数
        const countParams = params.slice(0, -2);
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);
        
        return successResponse(res, { data: grammarList, total });
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'POST':
      try {
        const { batch, grammarPoint, level, japaneseMeaning, chineseMeaning, continuation, attentionPoints, translationExercises, referenceAnswers, examples } = req.body;
        const isDuplicateGrammar = async (item) => {
          const duplicateResult = await pool.query(
            'SELECT id FROM grammar WHERE grammar_point = $1 AND level = $2 LIMIT 1',
            [item.grammarPoint, item.level]
          );
          return duplicateResult.rows.length > 0;
        };
        
        // 处理批量导入
        if (batch && Array.isArray(batch)) {
          const results = [];
          for (const item of batch) {
            if (await isDuplicateGrammar(item)) {
              continue;
            }
            const result = await pool.query(
              `INSERT INTO grammar (grammar_point, level, japanese_meaning, chinese_meaning, continuation, attention_points, translation_exercises, reference_answers, examples)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               RETURNING *`,
              [item.grammarPoint, item.level, item.japaneseMeaning || '', item.chineseMeaning || '', item.continuation || '', item.attentionPoints || '', item.translationExercises || [], item.referenceAnswers || [], item.examples || []]
            );
            results.push(result.rows[0]);
          }
          return successResponse(res, results, '批量导入成功');
        } else {
          if (await isDuplicateGrammar({ grammarPoint, level })) {
            return res.status(409).json({ success: false, error: { code: 'DUPLICATE_RESOURCE', message: '语法点已存在' } });
          }
          // 处理单个语法添加
          const result = await pool.query(
            `INSERT INTO grammar (grammar_point, level, japanese_meaning, chinese_meaning, continuation, attention_points, translation_exercises, reference_answers, examples)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [grammarPoint, level, japaneseMeaning || '', chineseMeaning || '', continuation || '', attentionPoints || '', translationExercises || [], referenceAnswers || [], examples || []]
          );
          
          const row = result.rows[0];
          const grammarItem = {
            id: row.id,
            grammarPoint: row.grammar_point,
            level: row.level,
            japaneseMeaning: row.japanese_meaning,
            chineseMeaning: row.chinese_meaning,
            continuation: row.continuation,
            attentionPoints: row.attention_points,
            translationExercises: row.translation_exercises || [],
            referenceAnswers: row.reference_answers || [],
            examples: row.examples || []
          };
          return successResponse(res, grammarItem, '语法添加成功');
        }
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const { grammarPoint, level, japaneseMeaning, chineseMeaning, continuation, attentionPoints, translationExercises, referenceAnswers, examples } = req.body;
        
        const result = await pool.query(
          `UPDATE grammar 
           SET grammar_point = $1, level = $2, japanese_meaning = $3, chinese_meaning = $4, 
               continuation = $5, attention_points = $6, translation_exercises = $7, 
               reference_answers = $8, examples = $9, updated_at = CURRENT_TIMESTAMP
           WHERE id = $10
           RETURNING *`,
          [grammarPoint, level, japaneseMeaning || '', chineseMeaning || '', continuation || '', attentionPoints || '', translationExercises || [], referenceAnswers || [], examples || [], id]
        );
        
        const row = result.rows[0];
        const grammarItem = {
          id: row.id,
          grammarPoint: row.grammar_point,
          level: row.level,
          japaneseMeaning: row.japanese_meaning,
          chineseMeaning: row.chinese_meaning,
          continuation: row.continuation,
          attentionPoints: row.attention_points,
          translationExercises: row.translation_exercises || [],
          referenceAnswers: row.reference_answers || [],
          examples: row.examples || []
        };
        return successResponse(res, grammarItem, '语法更新成功');
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        await pool.query('DELETE FROM grammar WHERE id = $1', [id]);
        
        return successResponse(res, null, '语法删除成功');
      } catch (error) {
        handleError(error, req, res);
      }
      break;

    default:
      res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }
}

export default withAdminForMethods(handler);
