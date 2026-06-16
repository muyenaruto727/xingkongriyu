const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { withAdminForMethods } = require('../../../lib/apiAuth');
const { parseIntegerParam } = require('../../../lib/requestValidation');

async function handler(req, res) {
  const { method, query } = req;
  const { id, level, type, is_real_exam, page = 1, limit = 10 } = query;

  try {
    switch (method) {
      case 'GET':
        const { export: isExport } = query;
        const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
        const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 100, defaultValue: 10 });
        if (!isExport && (parsedPage.error || parsedLimit.error)) {
          return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
        }
        let sql = 'SELECT * FROM questions WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (level) {
          sql += ` AND level = $${paramIndex}`;
          params.push(level);
          paramIndex++;
        }

        if (type) {
          sql += ` AND question_type = $${paramIndex}`;
          params.push(type);
          paramIndex++;
        }

        if (is_real_exam !== undefined) {
          sql += ` AND is_real_exam = $${paramIndex}`;
          params.push(is_real_exam === 'true' || is_real_exam === true);
          paramIndex++;
        }

        sql += ' ORDER BY created_at DESC';
        
        // 如果是导出，获取所有数据
        if (!isExport) {
          // 添加分页
          const offset = (parsedPage.value - 1) * parsedLimit.value;
          sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
          params.push(parsedLimit.value, offset);
        }

        const result = await pool.query(sql, params);
        
        // 如果是导出，直接返回所有数据
        if (isExport) {
          return successResponse(res, result.rows);
        }

        // 获取总数
        let countSql = 'SELECT COUNT(*) as total FROM questions WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;
        
        if (level) {
          countSql += ` AND level = $${countParamIndex}`;
          countParams.push(level);
          countParamIndex++;
        }
        
        if (type) {
          countSql += ` AND question_type = $${countParamIndex}`;
          countParams.push(type);
          countParamIndex++;
        }

        if (is_real_exam !== undefined) {
          countSql += ` AND is_real_exam = $${countParamIndex}`;
          countParams.push(is_real_exam === 'true' || is_real_exam === true);
        }
        
        const countResult = await pool.query(countSql, countParams);
        const total = parseInt(countResult.rows[0].total);

        const responseData = {
          data: result.rows,
          pagination: {
            page: parsedPage.value,
            limit: parsedLimit.value,
            total
          }
        };
        return successResponse(res, responseData);
        break;

      case 'POST':
        const { 
          batch, 
          question_text, 
          question_type, 
          options, 
          correct_answer, 
          explanation, 
          level: qLevel, 
          is_real_exam: reqIsRealExam,
          category,
          passage,
          audio_url,
          grammarPassage,
          questions
        } = req.body;
        const isDuplicateQuestion = async (item) => {
          const duplicateResult = await pool.query(
            'SELECT id FROM questions WHERE question_text = $1 AND question_type = $2 AND level = $3 LIMIT 1',
            [item.question_text, item.question_type, item.level]
          );
          return duplicateResult.rows.length > 0;
        };
        
        // 处理批量导入
        if (batch && Array.isArray(batch)) {
          const results = [];
          for (const item of batch) {
            if (await isDuplicateQuestion(item)) {
              continue;
            }
            const insertResult = await pool.query(
              `INSERT INTO questions 
               (question_text, question_type, options, correct_answer, explanation, level, is_real_exam, category, passage, audio_url) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
               RETURNING *`,
              [item.question_text, item.question_type, item.options, item.correct_answer, item.explanation, item.level, item.is_real_exam, item.category || '', item.passage || '', item.audio_url || '']
            );
            results.push(insertResult.rows[0]);
          }
          return successResponse(res, results, '批量导入成功');
        } else if ((question_type === 'reading' || (question_type === 'grammar' && category === 'text_grammar')) && questions && questions.length > 0) {
          // 处理阅读题和文法题的文章语法类别的多个题目组
          const insertedQuestions = [];
          for (const q of questions) {
            const currentPassage = (question_type === 'grammar' && category === 'text_grammar') ? grammarPassage : passage;
            if (await isDuplicateQuestion({ question_text: q.question_text, question_type, level: qLevel })) {
              continue;
            }
            const insertResult = await pool.query(
              `INSERT INTO questions 
               (question_text, question_type, options, correct_answer, explanation, level, is_real_exam, category, passage, audio_url) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
               RETURNING *`,
              [q.question_text, question_type, q.options, q.correct_answer, q.explanation, qLevel, reqIsRealExam, category, currentPassage, audio_url]
            );
            insertedQuestions.push(insertResult.rows[0]);
          }
          return successResponse(res, { questions: insertedQuestions }, '题目组添加成功');
        } else {
          if (await isDuplicateQuestion({ question_text, question_type, level: qLevel })) {
            return res.status(409).json({ success: false, error: { code: 'DUPLICATE_RESOURCE', message: '题目已存在' } });
          }
          // 处理其他类型的题目
          const insertResult = await pool.query(
            `INSERT INTO questions 
             (question_text, question_type, options, correct_answer, explanation, level, is_real_exam, category, passage, audio_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [question_text, question_type, options, correct_answer, explanation, qLevel, reqIsRealExam, category, passage, audio_url]
          );
          return successResponse(res, insertResult.rows[0], '题目添加成功');
        }
        break;

      case 'PUT':
        if (!id) {
          res.status(400).json({ success: false, error: { code: 'MISSING_ID', message: 'Missing question ID' } });
          return;
        }
        
        const { 
          question_text: updateText, 
          question_type: updateType, 
          options: updateOptions, 
          correct_answer: updateAnswer, 
          explanation: updateExplanation, 
          level: updateLevel, 
          is_real_exam: updateIsRealExam,
          category: updateCategory,
          passage: updatePassage,
          audio_url: updateAudioUrl,
          grammarPassage: updateGrammarPassage
        } = req.body;
        
        const currentPassage = (updateType === 'grammar' && updateCategory === 'text_grammar') ? updateGrammarPassage : updatePassage;
        const updateResult = await pool.query(
          `UPDATE questions 
           SET question_text = $1, question_type = $2, options = $3, correct_answer = $4, 
               explanation = $5, level = $6, is_real_exam = $7, category = $8, passage = $9, audio_url = $10, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $11 
           RETURNING *`,
          [updateText, updateType, updateOptions, updateAnswer, updateExplanation, updateLevel, updateIsRealExam, updateCategory, currentPassage, updateAudioUrl, parseInt(id)]
        );
        return successResponse(res, updateResult.rows[0], '题目更新成功');
        break;

      case 'DELETE':
        if (!id) {
          res.status(400).json({ success: false, error: { code: 'MISSING_ID', message: 'Missing question ID' } });
          return;
        }
        await pool.query('DELETE FROM questions WHERE id = $1', [parseInt(id)]);
        return successResponse(res, null, '题目删除成功');
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
