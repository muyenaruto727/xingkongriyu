const { createDbPool } = require('./dbConfig');

const pool = createDbPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
