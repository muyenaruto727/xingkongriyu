const pool = require('../../../lib/db');

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { level, search } = req.query;
        let query = 'SELECT * FROM grammar WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (level && level !== '全部') {
          query += ` AND level = $${paramIndex}`;
          params.push(level);
          paramIndex++;
        }

        if (search) {
          query += ` AND grammar_point ILIKE $${paramIndex}`;
          params.push(`%${search}%`);
          paramIndex++;
        }

        query += ' ORDER BY id DESC';

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
        
        res.status(200).json(grammarList);
      } catch (error) {
        console.error('Error fetching grammar:', error);
        res.status(500).json({ error: 'Failed to fetch grammar' });
      }
      break;

    case 'POST':
      try {
        const { grammarPoint, level, japaneseMeaning, chineseMeaning, continuation, attentionPoints, translationExercises, referenceAnswers, examples } = req.body;
        
        const result = await pool.query(
          `INSERT INTO grammar (grammar_point, level, japanese_meaning, chinese_meaning, continuation, attention_points, translation_exercises, reference_answers, examples)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [grammarPoint, level, japaneseMeaning || '', chineseMeaning || '', continuation || '', attentionPoints || '', translationExercises || [], referenceAnswers || [], examples || []]
        );
        
        const row = result.rows[0];
        res.status(201).json({
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
        });
      } catch (error) {
        console.error('Error creating grammar:', error);
        res.status(500).json({ error: 'Failed to create grammar' });
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
        res.status(200).json({
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
        });
      } catch (error) {
        console.error('Error updating grammar:', error);
        res.status(500).json({ error: 'Failed to update grammar' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        await pool.query('DELETE FROM grammar WHERE id = $1', [id]);
        
        res.status(200).json({ message: 'Grammar deleted successfully' });
      } catch (error) {
        console.error('Error deleting grammar:', error);
        res.status(500).json({ error: 'Failed to delete grammar' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = handler;