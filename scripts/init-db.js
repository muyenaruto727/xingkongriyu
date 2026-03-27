const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'hanhan',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres',
});

const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    // Check if database exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'japanese_learning'"
    );
    
    if (dbCheck.rows.length === 0) {
      // Create database
      await client.query('CREATE DATABASE japanese_learning');
      console.log('Database created successfully');
    }
    
    client.release();
    
    // Connect to the new database
    const appPool = new Pool({
      user: process.env.DB_USER || 'hanhan',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: 'japanese_learning',
    });
    
    const appClient = await appPool.connect();
    
    // Create users table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT chk_role CHECK (role IN ('user', 'admin'))
      )
    `);
    console.log('Users table created');
    
    // Create vocabulary table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS vocabulary (
        id SERIAL PRIMARY KEY,
        japanese VARCHAR(255) NOT NULL,
        pronunciation VARCHAR(255),
        chinese VARCHAR(255) NOT NULL,
        level VARCHAR(10) NOT NULL,
        category VARCHAR(100),
        pitch_accent VARCHAR(20),
        tag VARCHAR(100),
        examples TEXT[],
        textbook VARCHAR(255),
        lesson VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT chk_level CHECK (level IN ('N1', 'N2', 'N3', 'N4', 'N5'))
      )
    `);
    console.log('Vocabulary table created');
    
    // Add textbook and lesson columns if they don't exist
    try {
      await appClient.query('ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS textbook VARCHAR(255)');
      await appClient.query('ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS lesson VARCHAR(50)');
      console.log('Added textbook and lesson columns to vocabulary table');
    } catch (error) {
      console.error('Error adding columns:', error);
    }
    
    // Create grammar table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS grammar (
        id SERIAL PRIMARY KEY,
        grammar_point VARCHAR(255) NOT NULL,
        level VARCHAR(10) NOT NULL,
        japanese_meaning TEXT,
        chinese_meaning TEXT,
        continuation VARCHAR(100),
        attention_points TEXT,
        translation_exercises TEXT[],
        reference_answers TEXT[],
        examples TEXT[],
        favorites INTEGER[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT chk_grammar_level CHECK (level IN ('N1', 'N2', 'N3', 'N4', 'N5'))
      )
    `);
    console.log('Grammar table created');
    
    // Create articles table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        level VARCHAR(20) NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Articles table created');
    
    // Create listening table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS listening (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        audio_url VARCHAR(500),
        transcript TEXT,
        level VARCHAR(10) NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Listening table created');
    
    // Create courses table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        level VARCHAR(20) NOT NULL,
        category VARCHAR(100),
        cover_image VARCHAR(500),
        price DECIMAL(10, 2) DEFAULT 0,
        is_premium BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Courses table created');
    
    // Create questions table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL,
        options TEXT[],
        correct_answer INTEGER,
        explanation TEXT,
        level VARCHAR(10) NOT NULL,
        category VARCHAR(100),
        passage TEXT,
        audio_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Questions table created');

    // Add missing columns if they don't exist
    try {
      await appClient.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS passage TEXT');
      await appClient.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS audio_url VARCHAR(500)');
      await appClient.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_real_exam BOOLEAN DEFAULT true');
      console.log('Added missing columns to questions table');
    } catch (error) {
      console.error('Error adding columns to questions table:', error);
    }

    // Create exam_records table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS exam_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        level VARCHAR(10) NOT NULL,
        sections TEXT[],
        score INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        total_count INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        answers JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Exam records table created');

    // Create chapters table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        course_id INTEGER REFERENCES courses(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Chapters table created');

    // Create sections table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        content TEXT,
        video_url VARCHAR(500),
        chapter_id INTEGER REFERENCES chapters(id),
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Sections table created');

    // Create indexes for performance optimization
    await appClient.query('CREATE INDEX IF NOT EXISTS idx_vocabulary_level ON vocabulary(level)');
    await appClient.query('CREATE INDEX IF NOT EXISTS idx_vocabulary_tag ON vocabulary(tag)');
    await appClient.query('CREATE INDEX IF NOT EXISTS idx_vocabulary_textbook ON vocabulary(textbook)');
    await appClient.query('CREATE INDEX IF NOT EXISTS idx_grammar_level ON grammar(level)');
    await appClient.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await appClient.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await appClient.query('CREATE INDEX IF NOT EXISTS idx_exam_records_user_id ON exam_records(user_id)');
    await appClient.query('CREATE INDEX IF NOT EXISTS idx_exam_records_level ON exam_records(level)');
    await appClient.query('CREATE INDEX IF NOT EXISTS idx_chapters_course_id ON chapters(course_id)');
    await appClient.query('CREATE INDEX IF NOT EXISTS idx_sections_chapter_id ON sections(chapter_id)');
    console.log('Indexes created successfully');
    
    appClient.release();
    await appPool.end();
    
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
};

initDatabase();
