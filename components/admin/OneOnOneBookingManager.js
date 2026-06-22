import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import PaginationTable from '../common/PaginationTable';
import api from '../../lib/api';

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'new', label: '待联系' },
  { value: 'contacted', label: '已联系' },
  { value: 'closed', label: '已处理' },
];

const STATUS_LABELS = {
  new: '待联系',
  contacted: '已联系',
  closed: '已处理',
};

const STATUS_STYLES = {
  new: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-800',
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

const OneOnOneBookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [status, setStatus] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const result = await api.getOneOnOneBookings({
        page: currentPage,
        limit: itemsPerPage,
        ...(status ? { status } : {}),
      });
      const list = result?.data || [];
      setBookings(list);
      setTotalItems(result?.total || 0);
    } catch {
      // API errors are shown by lib/api.js.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, itemsPerPage, status]);

  const updateStatus = async (id, nextStatus) => {
    if (updatingId) return;

    setUpdatingId(id);
    try {
      await api.updateOneOnOneBooking({ id, status: nextStatus });
      message.success('预约状态已更新');
      fetchBookings();
    } catch {
      // API errors are shown by lib/api.js.
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      title: '称呼',
      key: 'name',
      cellClassName: 'text-dark font-medium whitespace-nowrap',
      render: (row) => row.name || '-',
    },
    {
      title: '联系方式',
      key: 'contact',
      cellClassName: 'text-dark',
      render: (row) => (
        <div>
          <div className="font-medium">{row.contact_value || '-'}</div>
          <div className="text-xs text-gray-400 mt-1">{row.contact_label || row.contact_type || '-'}</div>
        </div>
      ),
    },
    {
      title: '目标/卡点',
      key: 'goal',
      cellClassName: 'text-muted',
      render: (row) => (
        <div className="max-w-xs lg:max-w-md whitespace-pre-wrap leading-relaxed">
          {row.goal || <span className="text-gray-300">-</span>}
        </div>
      ),
    },
    {
      title: '方便联系时间',
      key: 'preferred_time',
      cellClassName: 'text-muted whitespace-nowrap',
      render: (row) => row.preferred_time || '-',
    },
    {
      title: '状态',
      key: 'status',
      render: (row) => {
        const currentStatus = row.status || 'new';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[currentStatus] || STATUS_STYLES.new}`}>
            {STATUS_LABELS[currentStatus] || '待联系'}
          </span>
        );
      },
    },
    {
      title: '提交时间',
      key: 'created_at',
      cellClassName: 'text-muted whitespace-nowrap',
      render: (row) => formatDate(row.created_at),
    },
    {
      title: '操作',
      key: 'actions',
      cellClassName: 'whitespace-nowrap',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status !== 'contacted' && row.status !== 'closed' && (
            <Button
              type="link"
              size="small"
              loading={updatingId === row.id}
              disabled={Boolean(updatingId)}
              onClick={() => updateStatus(row.id, 'contacted')}
              style={{ padding: 0 }}
            >
              标记已联系
            </Button>
          )}
          {row.status !== 'closed' && (
            <Button
              type="link"
              size="small"
              loading={updatingId === row.id}
              disabled={Boolean(updatingId)}
              onClick={() => updateStatus(row.id, 'closed')}
              style={{ padding: 0 }}
            >
              标记已处理
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-dark">1V1预约管理</h3>
          <p className="text-sm text-gray-500 mt-1">查看站内预约信息，并记录联系进度。</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <Button onClick={fetchBookings} loading={loading}>
            刷新
          </Button>
        </div>
      </div>

      <PaginationTable
        data={bookings}
        columns={columns}
        isLoading={loading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={(newLimit) => {
          setItemsPerPage(newLimit);
          setCurrentPage(1);
        }}
        emptyMessage="暂无1V1预约记录"
        emptyIcon="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
      />
    </div>
  );
};

export default OneOnOneBookingManager;
