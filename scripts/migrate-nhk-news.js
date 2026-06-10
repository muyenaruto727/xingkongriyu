/**
 * migrate-nhk-news.js
 * 创建 NHK Easy News 新闻表
 * 运行: node scripts/migrate-nhk-news.js
 */

const { createDbPool } = require('../lib/dbConfig');

const pool = createDbPool({ max: 5 });

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
