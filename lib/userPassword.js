const { hashPassword } = require('./auth');

async function hashUserPassword(password) {
  if (!password) return undefined;
  return hashPassword(password);
}

module.exports = {
  hashUserPassword,
};
