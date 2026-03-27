const pool = require('../../../lib/db');

async function handler(req, res) {
  const { method, query } = req;
  const { id, level, type, page = 1, limit = 10 } = query;

  try {
    switch (method) {
      case 'GET':
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

        sql += ' ORDER BY created_at DESC';
        
        // 添加分页
        const offset = (parseInt(page) - 1) * parseInt(limit);
        sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);

        const result = await pool.query(sql, params);
        
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
        }
        
        const countResult = await pool.query(countSql, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.status(200).json({
          data: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total
          }
        });
        break;

      case 'POST':
        const { 
          question_text, 
          question_type, 
          options, 
          correct_answer, 
          explanation, 
          level: qLevel, 
          is_real_exam,
          category,
          passage,
          audio_url,
          grammarPassage,
          questions
        } = req.body;
        
        if ((question_type === 'reading' || (question_type === 'grammar' && category === 'text_grammar')) && questions && questions.length > 0) {
          // 处理阅读题和文法题的文章语法类别的多个题目组
          const insertedQuestions = [];
          for (const q of questions) {
            const currentPassage = (question_type === 'grammar' && category === 'text_grammar') ? grammarPassage : passage;
            const insertResult = await pool.query(
              `INSERT INTO questions 
               (question_text, question_type, options, correct_answer, explanation, level, is_real_exam, category, passage, audio_url) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
               RETURNING *`,
              [q.question_text, question_type, q.options, q.correct_answer, q.explanation, qLevel, is_real_exam, category, currentPassage, audio_url]
            );
            insertedQuestions.push(insertResult.rows[0]);
          }
          res.status(201).json({ questions: insertedQuestions });
        } else {
          // 处理其他类型的题目
          const insertResult = await pool.query(
            `INSERT INTO questions 
             (question_text, question_type, options, correct_answer, explanation, level, is_real_exam, category, passage, audio_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [question_text, question_type, options, correct_answer, explanation, qLevel, is_real_exam, category, passage, audio_url]
          );
          res.status(201).json(insertResult.rows[0]);
        }
        break;

      case 'PUT':
        if (!id) {
          res.status(400).json({ error: 'Missing question ID' });
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
        res.status(200).json(updateResult.rows[0]);
        break;

      case 'DELETE':
        if (!id) {
          res.status(400).json({ error: 'Missing question ID' });
          return;
        }
        await pool.query('DELETE FROM questions WHERE id = $1', [parseInt(id)]);
        res.status(200).json({ message: 'Question deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = handler;