import { useEffect, useState } from 'react';
import { Button, Select, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import PaginationTable from '../common/PaginationTable';
import api from '../../lib/api';
import { INVITATION_DURATIONS } from '../../lib/invitationCodes';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function getDurationLabel(days) {
  const option = INVITATION_DURATIONS.find((item) => item.days === Number(days));
  return option ? option.label : `${days}日`;
}

const InvitationCodeManager = () => {
  const [codes, setCodes] = useState([]);
  const [durationDays, setDurationDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const result = await api.getInvitationCodeList({
        page: currentPage,
        limit: itemsPerPage,
      });
      setCodes(result.data || []);
      setTotalItems(result.total || 0);
    } catch {
      // API errors are shown by lib/api.js.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [currentPage, itemsPerPage]);

  const handleCreate = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const created = await api.createInvitationCode({ duration_days: durationDays });
      message.success(`邀请码已生成：${created.code}`);
      setCurrentPage(1);
      fetchCodes();
    } catch {
      // API errors are shown by lib/api.js.
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: '邀请码',
      key: 'code',
      cellClassName: 'text-dark font-mono whitespace-nowrap',
    },
    {
      title: '类型',
      render: (row) => getDurationLabel(row.duration_days),
      cellClassName: 'text-muted whitespace-nowrap',
    },
    {
      title: '是否使用',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.is_used ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
        }`}>
          {row.is_used ? '已使用' : '未使用'}
        </span>
      ),
      cellClassName: 'whitespace-nowrap',
    },
    {
      title: '使用用户',
      render: (row) => row.used_by_username || '-',
      cellClassName: 'text-muted whitespace-nowrap',
    },
    {
      title: '使用时间',
      render: (row) => formatDate(row.used_at),
      cellClassName: 'text-muted whitespace-nowrap',
    },
    {
      title: '生成时间',
      render: (row) => formatDate(row.created_at),
      cellClassName: 'text-muted whitespace-nowrap',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-dark">邀请码管理</h3>
        <div className="flex items-center gap-3">
          <Select
            value={durationDays}
            onChange={setDurationDays}
            style={{ width: 120 }}
            options={INVITATION_DURATIONS.map((item) => ({
              value: item.days,
              label: item.label,
            }))}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={submitting}
            disabled={submitting}
            onClick={handleCreate}
          >
            生成邀请码
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchCodes}
            disabled={loading}
          >
            刷新
          </Button>
        </div>
      </div>

      <PaginationTable
        data={codes}
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
        emptyMessage="暂无邀请码"
      />
    </div>
  );
};

export default InvitationCodeManager;
