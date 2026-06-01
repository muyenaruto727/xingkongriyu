const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');

// 各级别的题目配置
const examConfig = {
  N1: {
    vocabulary: [
      { category: 'kanji_reading', count: 6 },
      { category: 'kanji_writing', count: 0 },
      { category: 'word_formation', count: 0 },
      { category: 'word_relation', count: 7 },
      { category: 'synonym_replacement', count: 6 },
      { category: 'usage', count: 5 }
    ],
    grammar: [
      { category: 'sentence_grammar1', count: 10 },
      { category: 'sentence_grammar2', count: 5 },
      { category: 'text_grammar', count: 1 } // 1篇文章，包含若干小题
    ],
    reading: [
      { category: 'short_content', count: 4 }, // 4篇，每篇包含若干小题
      { category: 'medium_content', count: 4 }, // 4篇，每篇包含若干小题
      { category: 'long_content', count: 1 }, // 1篇，包含若干小题
      { category: 'comprehensive', count: 1 }, // 1篇，包含若干小题
      { category: 'argument', count: 1 }, // 1篇，包含若干小题
      { category: 'information_retrieval', count: 1 } // 1篇，包含若干小题
    ],
    listening: [
      { category: 'problem_understanding', count: 5 },
      { category: 'point_understanding', count: 6 },
      { category: 'summary_understanding', count: 5 },
      { category: 'language_expression', count: 0 },
      { category: 'immediate_response', count: 11 },
      { category: 'comprehensive', count: 3 }
    ]
  },
  N2: {
    vocabulary: [
      { category: 'kanji_reading', count: 5 },
      { category: 'kanji_writing', count: 5 },
      { category: 'word_formation', count: 3 },
      { category: 'word_relation', count: 7 },
      { category: 'synonym_replacement', count: 5 },
      { category: 'usage', count: 5 }
    ],
    grammar: [
      { category: 'sentence_grammar1', count: 12 },
      { category: 'sentence_grammar2', count: 5 },
      { category: 'text_grammar', count: 1 } // 1篇文章，包含若干小题
    ],
    reading: [
      { category: 'short_content', count: 5 }, // 5篇，每篇包含若干小题
      { category: 'medium_content', count: 4 }, // 4篇，每篇包含若干小题
      { category: 'long_content', count: 0 }, // 0篇
      { category: 'comprehensive', count: 1 }, // 1篇，包含若干小题
      { category: 'argument', count: 1 }, // 1篇，包含若干小题
      { category: 'information_retrieval', count: 1 } // 1篇，包含若干小题
    ],
    listening: [
      { category: 'problem_understanding', count: 5 },
      { category: 'point_understanding', count: 6 },
      { category: 'summary_understanding', count: 5 },
      { category: 'language_expression', count: 0 },
      { category: 'immediate_response', count: 11 },
      { category: 'comprehensive', count: 3 }
    ]
  },
  N3: {
    vocabulary: [
      { category: 'kanji_reading', count: 10 },
      { category: 'kanji_writing', count: 5 },
      { category: 'word_formation', count: 0 },
      { category: 'word_relation', count: 10 },
      { category: 'synonym_replacement', count: 5 },
      { category: 'usage', count: 5 }
    ],
    grammar: [
      { category: 'sentence_grammar1', count: 15 },
      { category: 'sentence_grammar2', count: 5 },
      { category: 'text_grammar', count: 1 } // 1篇文章，包含若干小题
    ],
    reading: [
      { category: 'short_content', count: 4 }, // 4篇，每篇包含若干小题
      { category: 'medium_content', count: 2 }, // 2篇，每篇包含若干小题
      { category: 'long_content', count: 1 }, // 1篇，包含若干小题
      { category: 'comprehensive', count: 0 }, // 0篇
      { category: 'argument', count: 0 }, // 0篇
      { category: 'information_retrieval', count: 1 } // 1篇，包含若干小题
    ],
    listening: [
      { category: 'problem_understanding', count: 6 },
      { category: 'point_understanding', count: 6 },
      { category: 'summary_understanding', count: 3 },
      { category: 'language_expression', count: 4 },
      { category: 'immediate_response', count: 10 },
      { category: 'comprehensive', count: 0 }
    ]
  },
  N4: {
    vocabulary: [
      { category: 'kanji_reading', count: 7 },
      { category: 'kanji_writing', count: 5 },
      { category: 'word_formation', count: 0 },
      { category: 'word_relation', count: 8 },
      { category: 'synonym_replacement', count: 4 },
      { category: 'usage', count: 4 }
    ],
    grammar: [
      { category: 'sentence_grammar1', count: 13 },
      { category: 'sentence_grammar2', count: 4 },
      { category: 'text_grammar', count: 1 } // 1篇文章，包含若干小题
    ],
    reading: [
      { category: 'short_content', count: 3 }, // 3篇，每篇包含若干小题
      { category: 'medium_content', count: 1 }, // 1篇，包含若干小题
      { category: 'long_content', count: 0 }, // 0篇
      { category: 'comprehensive', count: 0 }, // 0篇
      { category: 'argument', count: 0 }, // 0篇
      { category: 'information_retrieval', count: 1 } // 1篇，包含若干小题
    ],
    listening: [
      { category: 'problem_understanding', count: 8 },
      { category: 'point_understanding', count: 7 },
      { category: 'summary_understanding', count: 0 },
      { category: 'language_expression', count: 5 },
      { category: 'immediate_response', count: 8 },
      { category: 'comprehensive', count: 0 }
    ]
  },
  N5: {
    vocabulary: [
      { category: 'kanji_reading', count: 12 },
      { category: 'kanji_writing', count: 8 },
      { category: 'word_formation', count: 0 },
      { category: 'word_relation', count: 10 },
      { category: 'synonym_replacement', count: 5 },
      { category: 'usage', count: 0 }
    ],
    grammar: [
      { category: 'sentence_grammar1', count: 16 },
      { category: 'sentence_grammar2', count: 5 },
      { category: 'text_grammar', count: 1 } // 1篇文章，包含若干小题
    ],
    reading: [
      { category: 'short_content', count: 3 }, // 3篇，每篇包含若干小题
      { category: 'medium_content', count: 1 }, // 1篇，包含若干小题
      { category: 'long_content', count: 0 }, // 0篇
      { category: 'comprehensive', count: 0 }, // 0篇
      { category: 'argument', count: 0 }, // 0篇
      { category: 'information_retrieval', count: 1 } // 1篇，包含若干小题
    ],
    listening: [
      { category: 'problem_understanding', count: 7 },
      { category: 'point_understanding', count: 6 },
      { category: 'summary_understanding', count: 0 },
      { category: 'language_expression', count: 5 },
      { category: 'immediate_response', count: 6 },
      { category: 'comprehensive', count: 0 }
    ]
  }
};

// 辅助函数：随机从数组中抽取指定数量的元素
function getRandomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 辅助函数：获取指定类型和级别的题目
async function getQuestionsByType(questionType, category, level, count) {
  let sql = 'SELECT * FROM questions WHERE question_type = $1 AND level = $2 AND is_real_exam = true';
  const params = [questionType, level];
  let paramIndex = 3;
  
  if (category) {
    sql += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }
  
  // 对于需要按文章分组的题目类型
  if (questionType === 'reading' || (questionType === 'grammar' && category === 'text_grammar')) {
    // 获取所有唯一的passage
    let passageSql = `
      SELECT DISTINCT passage 
      FROM questions 
      WHERE question_type = $1 AND level = $2 AND is_real_exam = true
    `;
    
    if (category) {
      passageSql += ` AND category = $${paramIndex - 1}`;
    }
    
    const passageResult = await pool.query(passageSql, params);
    const passages = passageResult.rows.map(row => row.passage).filter(p => p);
    
    // 随机选择指定数量的文章
    const selectedPassages = getRandomElements(passages, count);
    
    // 获取这些文章的所有题目
    if (selectedPassages.length > 0) {
      const passagePlaceholders = selectedPassages.map((_, index) => `$${params.length + 1 + index}`).join(', ');
      const passageParams = [...params, ...selectedPassages];
      
      let questionSql = `
        SELECT * FROM questions 
        WHERE question_type = $1 AND level = $2 AND is_real_exam = true
      `;
      
      if (category) {
        questionSql += ` AND category = $${paramIndex - 1}`;
      }
      
      questionSql += ` AND passage IN (${passagePlaceholders})`;
      
      const questionResult = await pool.query(questionSql, passageParams);
      return questionResult.rows;
    }
  } else {
    // 对于普通题目，直接随机抽取
    sql += ` ORDER BY RANDOM() LIMIT $${paramIndex}`;
    params.push(parseInt(count));
    
    const result = await pool.query(sql, params);
    return result.rows;
  }
  
  return [];
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} Not Allowed` } });
    return;
  }
  
  const { level, sections } = req.body;
  
  if (!level || !sections || sections.length === 0) {
    res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'Missing required parameters' } });
    return;
  }
  
  try {
    const levelConfig = examConfig[level];
    if (!levelConfig) {
      res.status(400).json({ success: false, error: { code: 'INVALID_LEVEL', message: 'Invalid level' } });
      return;
    }
    
    const questions = [];
    let questionId = 1;
    
    for (const section of sections) {
      const sectionConfig = levelConfig[section];
      if (!sectionConfig) continue;
      
      for (const item of sectionConfig) {
        const { category, count } = item;
        if (count <= 0) continue;
        
        const sectionQuestions = await getQuestionsByType(section, category, level, count);
        
        // 转换题目格式
        for (const q of sectionQuestions) {
          questions.push({
            id: questionId++,
            type: section,
            typeName: {
              vocabulary: '文字・語彙',
              grammar: '文法',
              reading: '読解',
              listening: '聴解'
            }[section],
            category: q.category || category,
            question: q.question_text,
            options: q.options,
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
            passage: q.passage,
            audioUrl: q.audio_url
          });
        }
      }
    }
    
    return successResponse(res, { questions }, '生成试卷成功');
  } catch (error) {
    handleError(error, req, res);
  }
}

module.exports = handler;