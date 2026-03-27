const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: process.env.DB_USER || 'hanhan',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'japanese_learning',
});

const createAdmin = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating admin user...');

    // 定义管理员信息
    const adminUsername = 'admin';
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123'; // 建议创建后修改密码

    // 检查用户是否已存在
    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [adminUsername]
    );

    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists!');
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 创建管理员用户
    const result = await client.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [adminUsername, adminEmail, hashedPassword, 'admin']
    );

    const adminUser = result.rows[0];
    console.log('Admin user created successfully!');
    console.log('====================================');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@example.com');
    console.log('Role: admin');
    console.log('====================================');
    console.log('Please change the password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createAdmin();