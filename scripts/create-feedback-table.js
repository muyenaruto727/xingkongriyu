const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'hanhan',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'japanese_learning',
});

const createFeedbackTable = async () => {
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        question_id INTEGER,
        exam_record_id INTEGER REFERENCES exam_records(id),
        feedback_type VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Successfully created feedbacks table');
  } catch (error) {
    console.error('Error creating feedbacks table:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createFeedbackTable();