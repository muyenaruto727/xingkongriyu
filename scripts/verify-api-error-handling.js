const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const root = path.resolve(__dirname, '..');
const apiSource = fs.readFileSync(path.join(root, 'lib/api.js'), 'utf8');

const requestRawBody = apiSource.match(/async function requestRaw[\s\S]+?^}/m)?.[0] || '';

assert(apiSource.includes('class ApiRequestError'), 'API client should use a structured ApiRequestError');
assert(apiSource.includes('function applyRequestInterceptors'), 'API client should centralize request interceptors');
assert(apiSource.includes('function applyResponseInterceptors'), 'API client should centralize response interceptors');
assert(apiSource.includes('function applyErrorInterceptors'), 'API client should centralize error interceptors');
assert(apiSource.includes("import { message } from 'antd'"), 'API client should use antd message for unified API error prompts');
assert(apiSource.includes('请求参数有误，请调整后再试'), 'API client should map technical 400 errors to friendly copy');
assert(apiSource.includes('网络连接失败，请检查网络后重试'), 'API client should map network failures to friendly copy');
assert(apiSource.includes("typeof dataError === 'string'"), 'API client should support legacy string error payloads');
assert(!apiSource.includes('function getApiErrorMessage'), 'API error message resolution should stay internal to lib/api.js');
assert(!apiSource.includes('requestSilent'), 'API client should not carry silent legacy request helpers');
assert(!apiSource.includes('showErrorMessage'), 'API client should not expose per-call notification toggles');
assert(!apiSource.includes('isApiErrorNotified'), 'API client should not mark errors for old duplicate-toast paths');
assert(!requestRawBody.includes('console.error'), 'requestRaw should not log caught errors directly');
assert(apiSource.includes('status: res.status'), 'HTTP errors should preserve response status');
assert(apiSource.includes('endpoint,'), 'HTTP errors should preserve request endpoint');

console.log('api error handling checks passed');
