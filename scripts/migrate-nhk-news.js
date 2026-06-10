/**
 * migrate-nhk-news.js
 * 创建 NHK Easy News 新闻表
 * 运行: node scripts/migrate-nhk-news.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 手动解析 .env 文件
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...vals] = trimmed.split('=');
        if (key && vals.length > 0 && !process.env[key]) {
          process.env[key] = vals.join('=').replace(/^["']|["']$/g, '');
        }
      }
    });
  }
} catch (e) {
  // 忽略 .env 解析错误
}

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'xingkongriyu',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('=== 创建 NHK News 新闻表 ===\n');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.nhk_news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        link VARCHAR(500) NOT NULL UNIQUE,
        pub_date TIMESTAMP,
        description TEXT,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ nhk_news 表创建成功');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_nhk_news_pub_date
      ON public.nhk_news(pub_date DESC);
    `);
    console.log('✓ 索引创建成功');

    console.log('\n=== 迁移完成 ===');
  } catch (error) {
    console.error('迁移失败:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
