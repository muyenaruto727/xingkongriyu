import { useState, useEffect } from 'react';
import { logError } from '../../utils.js';
import PaginationTable from '../common/PaginationTable';
import api from '../../lib/api';

const UserManager = ({ showToast }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // 加载用户数据
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const result = await api.getUserList({
        page: currentPage,
        limit: itemsPerPage
      });
      setUsers(result.data || []);
      setTotalItems(result.total || 0);
    } catch (error) {
      logError(error, 'Fetch Users');
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时加载用户数据
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-end mb-6">
        <button 
          onClick={fetchUsers}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          刷新
        </button>
      </div>
      
      <PaginationTable
        data={users}
        columns={[
          {
            title: 'ID',
            key: 'id',
            cellClassName: 'text-dark'
          },
          {
            title: '用户名',
            key: 'username',
            cellClassName: 'text-dark'
          },
          {
            title: '邮箱',
            key: 'email',
            cellClassName: 'text-dark'
          },
          {
            title: '角色',
            render: (row) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {row.role === 'admin' ? '管理员' : '普通用户'}
              </span>
            ),
            cellClassName: 'text-sm'
          },
          {
            title: '注册时间',
            render: (row) => new Date(row.created_at).toLocaleString(),
            cellClassName: 'text-muted'
          }
        ]}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={(newLimit) => {
          setItemsPerPage(newLimit);
          setCurrentPage(1);
        }}
        emptyMessage="暂无用户"
        emptyIcon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </div>
  );
};

export default UserManager;
