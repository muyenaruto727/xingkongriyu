const pool = require('../lib/db');
const bcrypt = require('bcryptjs');

const newPassword = 'admin123';

async function resetAdminPassword() {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username, email, role',
      [hashedPassword, 'admin']
    );

    if (result.rows.length > 0) {
      console.log('✅ 管理员密码重置成功！');
      console.log(`用户名: ${result.rows[0].username}`);
      console.log(`邮箱: ${result.rows[0].email}`);
      console.log(`新密码: ${newPassword}`);
    } else {
      console.log('❌ 未找到管理员账户');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ 重置密码失败:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();