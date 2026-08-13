function getPaginationRequestParams({
  currentPage = 1,
  itemsPerPage = 10,
  page,
  limit,
} = {}) {
  return {
    page: page || currentPage,
    limit: limit || itemsPerPage,
  };
}

function getPageSizeChangeState(limit) {
  return {
    page: 1,
    limit,
  };
}

module.exports = {
  getPaginationRequestParams,
  getPageSizeChangeState,
};
