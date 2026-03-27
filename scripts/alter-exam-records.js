const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'hanhan',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'japanese_learning',
});

const alterExamRecordsTable = async () => {
  const client = await pool.connect();
  
  try {
    await client.query(`
      ALTER TABLE exam_records 
      ADD COLUMN IF NOT EXISTS questions JSONB
    `);
    console.log('Successfully added questions column to exam_records table');
  } catch (error) {
    console.error('Error altering exam_records table:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

alterExamRecordsTable();