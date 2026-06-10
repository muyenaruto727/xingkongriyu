const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const LOCAL_ENV_FILES = ['.env.local', '.env'];
const PRODUCTION_CONFIRMATION = 'I_UNDERSTAND_THIS_WILL_DELETE_DATA';

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const separatorIndex = trimmed.indexOf('=');
  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
  return key ? { key, value } : null;
}

function loadEnvFiles(rootDir = path.join(__dirname, '..')) {
  for (const file of LOCAL_ENV_FILES) {
    const envPath = path.join(rootDir, file);
    if (!fs.existsSync(envPath)) {
      continue;
    }

    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const parsed = parseEnvLine(line);
      if (parsed && process.env[parsed.key] === undefined) {
        process.env[parsed.key] = parsed.value;
      }
    }
  }
}

function shouldUseSsl(env) {
  if (env.POSTGRES_SSL === 'true') {
    return true;
  }
  if (env.POSTGRES_SSL === 'false') {
    return false;
  }
  return env.NODE_ENV === 'production';
}

function buildPgPoolOptions(env = process.env, overrides = {}) {
  const ssl = shouldUseSsl(env) ? { rejectUnauthorized: false } : false;
  const baseOptions = {
    ssl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ...overrides,
  };

  if (env.POSTGRES_URL) {
    return {
      ...baseOptions,
      connectionString: env.POSTGRES_URL,
    };
  }

  const legacyKeys = ['DB_USER', 'DB_HOST', 'DB_NAME'];
  const hasAnyLegacyConfig = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'].some((key) => env[key]);
  const hasRequiredLegacyConfig = legacyKeys.every((key) => env[key]);

  if (hasAnyLegacyConfig && hasRequiredLegacyConfig) {
    return {
      ...baseOptions,
      user: env.DB_USER,
      host: env.DB_HOST,
      database: env.DB_NAME,
      password: env.DB_PASSWORD || '',
      port: Number.parseInt(env.DB_PORT || '5432', 10),
    };
  }

  throw new Error('POSTGRES_URL environment variable is not set. For local scripts, provide DB_USER, DB_HOST, and DB_NAME explicitly.');
}

function createDbPool(overrides = {}, env = process.env) {
  loadEnvFiles();
  return new Pool(buildPgPoolOptions(env, overrides));
}

function assertSafeForDestructiveOperation(env = process.env) {
  if (env.NODE_ENV === 'production' && env.CONFIRM_PRODUCTION_DB_INIT !== PRODUCTION_CONFIRMATION) {
    throw new Error(`Refusing to run destructive database operation in production. Set CONFIRM_PRODUCTION_DB_INIT=${PRODUCTION_CONFIRMATION} to continue.`);
  }
}

module.exports = {
  buildPgPoolOptions,
  createDbPool,
  loadEnvFiles,
  assertSafeForDestructiveOperation,
  PRODUCTION_CONFIRMATION,
};
