const { buildPgPoolOptions, loadEnvFiles } = require('../lib/dbConfig');

loadEnvFiles();
const database = buildPgPoolOptions(process.env);

module.exports = {
  database,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  },
  api: {
    version: 'v1',
  },
};
