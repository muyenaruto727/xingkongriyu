import React, { useState, useEffect } from 'react';
import { handleApiError, logError } from '../../utils.js';
import PaginationTable from '../common/PaginationTable';

const FeedbackManager = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchType, setSearchType] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, [currentPage, itemsPerPage, searchType, searchStatus]);

  const fetchFeedback = async () => {
    setIsFeedbackLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      if (searchType) params.append('type', searchType);
      if (searchStatus) params.append('status', searchStatus);
      
      const response = await fetch(`/api/feedbacks?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFeedbackList(data.data || []);
        setTotalItems(data.pagination?.total || 0);
      } else {
        const error = new Error('Failed to fetch feedback');
        error.response = { status: response.status, data: await response.json() };
        handleApiError(error, () => {});
      }
    } catch (error) {
      logError(error, 'Fetch Feedback');
      handleApiError(error, () => {});
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (id, status) => {
    try {
      const response = await fetch('/api/feedbacks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });
      
      if (response.ok) {
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const handleReset = () => {
    setSearchType('');
    setSearchStatus('');
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">


      {/* 搜索和筛选 */}
      <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">反馈类型</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">全部类型</option>
              <option value="题目有误">题目有误</option>
              <option value="答案有误">答案有误</option>
              <option value="解析有误">解析有误</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">全部状态</option>
              <option value="待处理">待处理</option>
              <option value="已处理">已处理</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button 
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            重置
          </button>
          <button 
            onClick={fetchFeedback}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </div>
      </div>
      
      <PaginationTable
        data={feedbackList}
        columns={[
          {
            title: 'ID',
            render: (row, index) => index + 1,
            cellClassName: 'text-dark'
          },
          {
            title: '用户',
            render: (row) => row.username || '未知用户',
            cellClassName: 'text-dark'
          },
          {
            title: '问题ID',
            render: (row) => row.question_id || '-',
            cellClassName: 'text-dark'
          },
          {
            title: '题目',
            render: (row) => (
              <div className="max-w-xs truncate">
                {row.question_text || '未知题目'}
              </div>
            ),
            cellClassName: 'text-dark'
          },
          {
            title: '反馈类型',
            render: (row) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.feedback_type === '题目有误' ? 'bg-red-100 text-red-800'
                : row.feedback_type === '答案有误' ? 'bg-orange-100 text-orange-800'
                : row.feedback_type === '解析有误' ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
              }`}>
                {row.feedback_type}
              </span>
            )
          },
          {
            title: '状态',
            render: (row) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === '待处理' ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
              }`}>
                {row.status || '待处理'}
              </span>
            )
          },
          {
            title: '描述',
            render: (row) => row.description || '无描述',
            cellClassName: 'text-muted max-w-md'
          },
          {
            title: '提交时间',
            render: (row) => new Date(row.created_at).toLocaleString(),
            cellClassName: 'text-muted'
          },
          {
            title: '操作',
            render: (row) => (
              row.status !== '已处理' && (
                <button 
                  onClick={() => handleUpdateFeedbackStatus(row.id, '已处理')}
                  className="px-3 py-1 text-green-600 rounded text-xs hover:text-green-700 transition-colors"
                >
                  标记为已处理
                </button>
              )
            )
          }
        ]}
        isLoading={isFeedbackLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={(newLimit) => {
          setItemsPerPage(newLimit);
          setCurrentPage(1);
        }}
        emptyMessage="暂无反馈记录"
        emptyIcon="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
      />
    </div>
  );
};

export default FeedbackManager;