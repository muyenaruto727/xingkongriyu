function normalizeApiResponse(result) {
  if (!result || typeof result !== 'object' || !Object.prototype.hasOwnProperty.call(result, 'success')) {
    return {
      success: true,
      message: '操作成功',
      data: result,
    };
  }

  if (result.pagination !== undefined) {
    return buildSuccessResponse(result.data, result.message || '', {
      pagination: result.pagination,
    });
  }

  return {
    success: Boolean(result.success),
    message: result.message || '',
    data: result.data,
  };
}

function unwrapApiResponse(result) {
  const normalized = normalizeApiResponse(result);
  return normalized.success ? normalized.data : normalized;
}

function buildSuccessResponse(data, message = '操作成功', meta = {}) {
  let responseData = data;
  const pagination = meta.pagination || (data && typeof data === 'object' ? data.pagination : undefined);

  if (pagination && typeof pagination === 'object') {
    responseData = {
      data: data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'data') ? data.data : data,
      total: Number(pagination.total || 0),
    };
  }

  const response = {
    success: true,
    message,
    data: responseData,
  };

  return response;
}

module.exports = {
  buildSuccessResponse,
  normalizeApiResponse,
  unwrapApiResponse,
};
