const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const root = path.resolve(__dirname, '..');
const apiSource = fs.readFileSync(path.join(root, 'lib/api.js'), 'utf8');
const dailyQuoteSource = fs.readFileSync(path.join(root, 'components/DailyQuote.js'), 'utf8');

function listClientFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (fullPath === path.join(root, 'pages/api')) {
        return [];
      }
      return listClientFiles(fullPath);
    }
    return /\.(jsx?|tsx?)$/.test(entry.name) ? [fullPath] : [];
  });
}

const apiImportPattern = /from ['"][^'"]*lib\/api['"]/;
const rawCaughtErrorLogPattern = /console\.error\([^;\n]*,\s*(?:error|err)\s*\)/;
const apiImportFilesWithRawErrorLogging = [
  ...listClientFiles(path.join(root, 'components')),
  ...listClientFiles(path.join(root, 'pages')),
]
  .filter((file) => {
    const source = fs.readFileSync(file, 'utf8');
    return apiImportPattern.test(source) && rawCaughtErrorLogPattern.test(source);
  })
  .map((file) => path.relative(root, file));
const clientFilesWithConsoleError = [
  ...listClientFiles(path.join(root, 'components')),
  ...listClientFiles(path.join(root, 'pages')),
]
  .filter((file) => fs.readFileSync(file, 'utf8').includes('console.error'))
  .map((file) => path.relative(root, file));

const requestRawBody = apiSource.match(/async function requestRaw[\s\S]+?^}/m)?.[0] || '';

assert(apiSource.includes('class ApiRequestError'), 'API client should use a structured ApiRequestError');
assert(apiSource.includes('function applyRequestInterceptors'), 'API client should centralize request interceptors');
assert(apiSource.includes('function applyResponseInterceptors'), 'API client should centralize response interceptors');
assert(apiSource.includes('function applyErrorInterceptors'), 'API client should centralize error interceptors');
assert(apiSource.includes('handleError:'), 'API client should expose a unified caught-error handler');
assert(apiSource.includes("import { message } from 'antd'"), 'API client should use antd message for unified API error prompts');
assert(apiSource.includes('请求参数有误，请调整后再试'), 'API client should map technical 400 errors to friendly copy');
assert(apiSource.includes('网络连接失败，请检查网络后重试'), 'API client should map network failures to friendly copy');
assert(apiSource.includes("typeof dataError === 'string'"), 'API client should support legacy string error payloads');
assert(!apiSource.includes('function getApiErrorMessage'), 'API error message resolution should stay internal to lib/api.js');
assert(!apiSource.includes('requestSilent'), 'API client should not carry silent legacy request helpers');
assert(!apiSource.includes('showErrorMessage'), 'API client should not expose per-call notification toggles');
assert(!apiSource.includes('isApiErrorNotified'), 'API client should not mark errors for old duplicate-toast paths');
assert(!apiSource.includes('console.error'), 'API client should not log caught errors to the browser console');
assert(!requestRawBody.includes('console.error'), 'requestRaw should not log caught errors directly');
assert(apiSource.includes('status: res.status'), 'HTTP errors should preserve response status');
assert(apiSource.includes('endpoint,'), 'HTTP errors should preserve request endpoint');
assert(!dailyQuoteSource.includes("console.error('获取每日一句失败:', error)"), 'DailyQuote should not surface caught API errors to the Next.js dev overlay');
assert(
  apiImportFilesWithRawErrorLogging.length === 0,
  `API callers should use api.handleError instead of console.error(error): ${apiImportFilesWithRawErrorLogging.join(', ')}`
);
assert(
  clientFilesWithConsoleError.length === 0,
  `Client files should show UI messages instead of console.error: ${clientFilesWithConsoleError.join(', ')}`
);

console.log('api error handling checks passed');
