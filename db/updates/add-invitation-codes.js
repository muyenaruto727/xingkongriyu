/**
 * add-invitation-codes.js
 * 新增邀请码表及用户账号有效期字段
 * 运行: node db/updates/add-invitation-codes.js
 */

const { createDbPool } = require('../../lib/dbConfig');

const pool = createDbPool({ max: 5 });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('=== 开始新增邀请码及账号有效期结构 ===\n');

    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.invitation_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) NOT NULL UNIQUE,
        duration_days INTEGER NOT NULL CHECK (duration_days IN (7, 30, 90, 365)),
        is_used BOOLEAN DEFAULT FALSE,
        used_by INTEGER,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE public.users
      ADD COLUMN IF NOT EXISTS invitation_code VARCHAR(8),
      ADD COLUMN IF NOT EXISTS invitation_code_id INTEGER,
      ADD COLUMN IF NOT EXISTS account_expires_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_invitation_code_id_fkey'
        ) THEN
          ALTER TABLE public.users
          ADD CONSTRAINT users_invitation_code_id_fkey
          FOREIGN KEY (invitation_code_id)
          REFERENCES public.invitation_codes(id)
          ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'invitation_codes_used_by_fkey'
        ) THEN
          ALTER TABLE public.invitation_codes
          ADD CONSTRAINT invitation_codes_used_by_fkey
          FOREIGN KEY (used_by)
          REFERENCES public.users(id)
          ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_invitation_codes_code ON public.invitation_codes(code);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_invitation_codes_is_used ON public.invitation_codes(is_used);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_account_expires_at ON public.users(account_expires_at);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);');

    await client.query('COMMIT');

    console.log('✓ 邀请码表与用户有效期字段检查/创建完成');
    console.log('\n=== 迁移完成 ===');
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
