const { buildPgPoolOptions, loadEnvFiles } = require('../lib/dbConfig');

loadEnvFiles();
const poolOptions = buildPgPoolOptions(process.env);

function toSequelizeConfig(options) {
  if (options.connectionString) {
    return {
      url: options.connectionString,
      dialect: 'postgres',
      dialectOptions: options.ssl ? { ssl: options.ssl } : {},
    };
  }

  return {
    database: options.database,
    username: options.user,
    password: options.password,
    host: options.host,
    port: options.port,
    dialect: 'postgres',
    dialectOptions: options.ssl ? { ssl: options.ssl } : {},
  };
}

module.exports = {
  development: toSequelizeConfig(poolOptions),
  production: toSequelizeConfig(poolOptions),
};
