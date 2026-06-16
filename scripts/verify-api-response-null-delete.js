const { buildSuccessResponse } = require('../lib/apiResponse');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const deleteResponse = buildSuccessResponse(null, '语法删除成功');
assert(deleteResponse.success === true, 'delete response should be successful');
assert(deleteResponse.message === '语法删除成功', 'delete response should preserve message');
assert(deleteResponse.data === null, 'delete response should preserve null data');

const paginationResponse = buildSuccessResponse({ data: [1, 2], pagination: { total: 2 } });
assert(paginationResponse.data.total === 2, 'pagination response should preserve total');
assert(Array.isArray(paginationResponse.data.data), 'pagination response should preserve data array');

console.log('api response null delete checks passed');
