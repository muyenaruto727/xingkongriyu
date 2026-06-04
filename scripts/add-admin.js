const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'xingkongriyu',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_EMAIL = 'admin@example.com';

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function addAdminUser() {
  let client;
  try {
    client = await pool.connect();
    console.log('正在创建管理员用户...');
    
    // 检查用户是否已存在
    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [ADMIN_USERNAME]
    );

    if (existingUser.rows.length > 0) {
      console.log(`用户 ${ADMIN_USERNAME} 已存在，跳过创建`);
      process.exit(0);
    }

    // 加密密码
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);

    // 插入管理员用户
    const result = await client.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [ADMIN_USERNAME, ADMIN_EMAIL, hashedPassword, 'admin']
    );

    const user = result.rows[0];
    console.log('管理员用户创建成功:');
    console.log(`  ID: ${user.id}`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  邮箱: ${user.email}`);
    console.log(`  角色: ${user.role}`);
    console.log(`  密码: ${ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('创建管理员用户失败:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

addAdminUser();
