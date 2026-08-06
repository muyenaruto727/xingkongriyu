/**
 * add-grammar-related-grammars.js
 * 为 grammar 表新增关联语法字段
 * 运行: node db/updates/add-grammar-related-grammars.js
 */

const { createDbPool } = require('../../lib/dbConfig');

const pool = createDbPool({ max: 5 });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('=== 开始为 grammar 表新增 related_grammars 字段 ===\n');

    await client.query(`
      ALTER TABLE public.grammar
      ADD COLUMN IF NOT EXISTS related_grammars JSONB NOT NULL DEFAULT '[]'::jsonb;
    `);

    console.log('✓ grammar.related_grammars 字段检查/创建完成');
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
