const pool = require('../../../lib/db');
const { ApiError, errorCodes, handleError, successResponse } = require('../../../lib/errorHandler');
const { parseIntegerParam } = require('../../../lib/requestValidation');
const { requireAuth } = require('../../../lib/apiAuth');

function normalizeAnswer(value) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

async function scoreExamQuestions(questions = [], answers = {}) {
  const sourceIds = questions
    .map((question) => parseInt(question.sourceId, 10))
    .filter((id) => !Number.isNaN(id));

  if (questions.length === 0 || sourceIds.length !== questions.length) {
    throw new ApiError(errorCodes.VALIDATION_ERROR, '题目来源缺失，请重新生成试卷');
  }

  const placeholders = sourceIds.map((_, index) => `$${index + 1}`).join(', ');
  const officialResult = await pool.query(
    `SELECT id, correct_answer, explanation
       FROM questions
      WHERE id IN (${placeholders})`,
    sourceIds
  );

  const officialById = new Map(
    officialResult.rows.map((row) => [
      row.id,
      {
        correctAnswer: normalizeAnswer(row.correct_answer),
        explanation: row.explanation || '',
      },
    ])
  );

  let correctCount = 0;
  const storedQuestions = questions.map((question) => {
    const sourceId = parseInt(question.sourceId, 10);
    const official = officialById.get(sourceId);
    if (!official) {
      throw new ApiError(errorCodes.VALIDATION_ERROR, '题目不存在或已删除，请重新生成试卷');
    }

    if (normalizeAnswer(answers[question.id]) === official.correctAnswer) {
      correctCount++;
    }

    return {
      id: question.id,
      sourceId,
      type: question.type,
      typeName: question.typeName,
      question: question.question,
      options: question.options,
      correctAnswer: official.correctAnswer,
      explanation: official.explanation,
      passage: question.passage,
    };
  });

  return {
    correctCount,
    totalCount: questions.length,
    score: Math.round((correctCount / questions.length) * 100),
    storedQuestions,
  };
}

async function handler(req, res) {
  const { method, query } = req;
  const { id, page = 1, limit = 10 } = query;
  const userId = req.user.userId;

  try {
    switch (method) {
      case 'GET':
        const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
        const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 100, defaultValue: 10 });
        if (parsedPage.error || parsedLimit.error) {
          return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
        }
        let sql = 'SELECT * FROM exam_records WHERE user_id = $1';
        const params = [userId];
        let paramIndex = 2;

        sql += ' ORDER BY created_at DESC';
        
        // 添加分页
        const offset = (parsedPage.value - 1) * parsedLimit.value;
        sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parsedLimit.value, offset);

        const result = await pool.query(sql, params);
        
        // 获取总数
        const countSql = 'SELECT COUNT(*) as total FROM exam_records WHERE user_id = $1';
        const countParams = [userId];
        
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
          level, 
          sections, 
          duration, 
          answers,
          questions
        } = req.body;
        const examScore = await scoreExamQuestions(questions, answers);
        
        const insertResult = await pool.query(
          `INSERT INTO exam_records 
           (user_id, level, sections, score, correct_count, total_count, duration, answers, questions) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           RETURNING *`,
          [
            userId,
            level,
            sections,
            examScore.score,
            examScore.correctCount,
            examScore.totalCount,
            duration,
            JSON.stringify(answers || {}),
            JSON.stringify(examScore.storedQuestions),
          ]
        );
        return successResponse(res, insertResult.rows[0], '考试记录添加成功');
        break;

      case 'DELETE':
        if (!id) {
          res.status(400).json({ success: false, error: { code: 'MISSING_ID', message: 'Missing record ID' } });
          return;
        }
        const deleteResult = await pool.query(
          'DELETE FROM exam_records WHERE id = $1 AND user_id = $2 RETURNING id',
          [parseInt(id), userId]
        );
        if (deleteResult.rowCount === 0) {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '考试记录不存在或无权删除' } });
        }
        return successResponse(res, null, '考试记录删除成功');
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${method} Not Allowed` } });
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

export default requireAuth(handler);
