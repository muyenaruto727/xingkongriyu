import React from 'react';

const Pagination = ({ page, limit, total, onPageChange, onLimitChange }) => {
  const totalPages = Math.ceil(total / limit);

  const handlePageClick = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center mb-4 md:mb-0 space-x-4">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">每页显示：</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">
            共 {total} 条记录
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageClick(1)}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          首页
        </button>
        <button
          onClick={() => handlePageClick(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          上一页
        </button>
        <div className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium">
          {page} / {totalPages || 1}
        </div>
        <button
          onClick={() => handlePageClick(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          下一页
        </button>
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={page === totalPages || totalPages === 0}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          末页
        </button>
      </div>
    </div>
  );
};

export default Pagination;