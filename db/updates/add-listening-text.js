/**
 * add-listening-text.js
 * 为 listening 表新增听力文本字段
 * 运行: node db/updates/add-listening-text.js
 */

const { createDbPool } = require('../../lib/dbConfig');

const pool = createDbPool({ max: 5 });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('=== 开始为 listening 表新增 listening_text 字段 ===\n');

    await client.query(`
      ALTER TABLE public.listening
      ADD COLUMN IF NOT EXISTS listening_text TEXT DEFAULT '';
    `);

    console.log('✓ listening.listening_text 字段检查/创建完成');
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
