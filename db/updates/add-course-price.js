const pool = require('../../lib/db');

async function migrate() {
  await pool.query('ALTER TABLE courses ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) NOT NULL DEFAULT 0');
  await pool.query("UPDATE courses SET price = 0 WHERE price IS NULL");
  await pool.query('ALTER TABLE courses DROP COLUMN IF EXISTS is_free');
  console.log('课程价格字段迁移完成');
  await pool.end();
}

migrate().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exitCode = 1;
});
