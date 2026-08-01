/**
 * add-question-tag.js
 * 为 questions 表新增单选标签字段 tag
 * 运行: node db/updates/add-question-tag.js
 */

const { createDbPool } = require('../../lib/dbConfig');

const pool = createDbPool({ max: 5 });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('=== 开始为 questions 表新增 tag 字段 ===\n');

    await client.query(`
      ALTER TABLE public.questions
      ADD COLUMN IF NOT EXISTS tag VARCHAR(50) DEFAULT '';
    `);

    console.log('✓ questions.tag 字段检查/创建完成');
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
