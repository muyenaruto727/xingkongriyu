const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'hanhan',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'japanese_learning',
});

const migrateDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migration...');

    // Add deleted_at column to users table
    try {
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP');
      console.log('Added deleted_at column to users table');
    } catch (error) {
      console.error('Error adding deleted_at to users:', error.message);
    }

    // Add deleted_at column to vocabulary table
    try {
      await client.query('ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP');
      console.log('Added deleted_at column to vocabulary table');
    } catch (error) {
      console.error('Error adding deleted_at to vocabulary:', error.message);
    }

    // Add deleted_at column to grammar table
    try {
      await client.query('ALTER TABLE grammar ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP');
      console.log('Added deleted_at column to grammar table');
    } catch (error) {
      console.error('Error adding deleted_at to grammar:', error.message);
    }

    // Add CHECK constraint for users.role
    try {
      await client.query(`
        ALTER TABLE users 
        DROP CONSTRAINT IF EXISTS chk_role
      `);
      await client.query(`
        ALTER TABLE users 
        ADD CONSTRAINT chk_role CHECK (role IN ('user', 'admin'))
      `);
      console.log('Added CHECK constraint for users.role');
    } catch (error) {
      console.error('Error adding role constraint:', error.message);
    }

    // Add CHECK constraint for vocabulary.level
    try {
      await client.query(`
        ALTER TABLE vocabulary 
        DROP CONSTRAINT IF EXISTS chk_level
      `);
      await client.query(`
        ALTER TABLE vocabulary 
        ADD CONSTRAINT chk_level CHECK (level IN ('N1', 'N2', 'N3', 'N4', 'N5'))
      `);
      console.log('Added CHECK constraint for vocabulary.level');
    } catch (error) {
      console.error('Error adding level constraint to vocabulary:', error.message);
    }

    // Add CHECK constraint for grammar.level
    try {
      await client.query(`
        ALTER TABLE grammar 
        DROP CONSTRAINT IF EXISTS chk_grammar_level
      `);
      await client.query(`
        ALTER TABLE grammar 
        ADD CONSTRAINT chk_grammar_level CHECK (level IN ('N1', 'N2', 'N3', 'N4', 'N5'))
      `);
      console.log('Added CHECK constraint for grammar.level');
    } catch (error) {
      console.error('Error adding level constraint to grammar:', error.message);
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_vocabulary_level ON vocabulary(level)',
      'CREATE INDEX IF NOT EXISTS idx_vocabulary_tag ON vocabulary(tag)',
      'CREATE INDEX IF NOT EXISTS idx_vocabulary_textbook ON vocabulary(textbook)',
      'CREATE INDEX IF NOT EXISTS idx_grammar_level ON grammar(level)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_exam_records_user_id ON exam_records(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_exam_records_level ON exam_records(level)',
    ];

    for (const indexSql of indexes) {
      try {
        await client.query(indexSql);
      } catch (error) {
        console.error('Error creating index:', error.message);
      }
    }
    console.log('Created all indexes');

    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

migrateDatabase();