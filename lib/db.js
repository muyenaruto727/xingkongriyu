const { Pool } = require('pg');

// 直接从环境变量读取完整的连接字符串
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },   // 必须启用 SSL
  // 连接池配置（适当增加超时时间）
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,       // 从 2000ms 增加到 10000ms，防止超时
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;