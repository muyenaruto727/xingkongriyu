/**
 * migrate-vocabulary-values.js
 * 将 vocabulary 表中的 category / pitch_accent / level / tag 统一迁移为 value
 * 运行: node db/updates/migrate-vocabulary-values.js
 */

const { createDbPool } = require('../../lib/dbConfig');
const { normalizeVocabularyRecord } = require('../../lib/vocabularyOptions');

const pool = createDbPool({ max: 5 });

function sameValue(left, right) {
  return String(left ?? '') === String(right ?? '');
}

function needsMigration(row) {
  const normalized = normalizeVocabularyRecord(row);
  return !(
    sameValue(row.category, normalized.category)
    && sameValue(row.pitch_accent, normalized.pitch_accent)
    && sameValue(row.level, normalized.level)
    && sameValue(row.tag, normalized.tag)
  );
}

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('=== 开始迁移 vocabulary 枚举字段 ===\n');

    await client.query('BEGIN');

    const result = await client.query(`
      SELECT id, japanese, pronunciation, chinese, level, category, pitch_accent, tag, examples, textbook, lesson
      FROM public.vocabulary
      ORDER BY id
    `);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of result.rows) {
      if (!needsMigration(row)) {
        skippedCount++;
        continue;
      }

      const normalized = normalizeVocabularyRecord(row);

      await client.query(
        `
          UPDATE public.vocabulary
          SET category = $1,
              pitch_accent = $2,
              level = $3,
              tag = $4,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `,
        [
          normalized.category,
          normalized.pitch_accent,
          normalized.level,
          normalized.tag,
          row.id,
        ]
      );

      updatedCount++;
      console.log(`✓ 迁移词条 ID ${row.id}: ${row.japanese}`);
    }

    await client.query('COMMIT');

    console.log('\n=== 迁移完成 ===');
    console.log(`更新 ${updatedCount} 条，跳过 ${skippedCount} 条`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('迁移失败:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
