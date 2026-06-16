import { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Popconfirm, Button as AntButton } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PaginationTable from '../common/PaginationTable';
import api from '../../lib/api';

const DailyQuoteManager = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const result = await api.getDailyQuoteList({ page: currentPage, limit: itemsPerPage });
      if (result) {
        setQuotes(result.data || []);
        setTotalItems(result.total || 0);
      }
    } catch {
      // API errors are shown by lib/api.js.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [currentPage, itemsPerPage]);

  const showModal = (quote = null) => {
    if (quote) {
      form.setFieldsValue({
        sentence: quote.sentence,
        meaning: quote.meaning || '',
        source: quote.source || ''
      });
      setEditingId(quote.id);
    } else {
      form.resetFields();
      setEditingId(null);
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (submitting) return;

    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.updateDailyQuote(editingId, values);
        message.success('修改成功');
      } else {
        await api.createDailyQuote(values);
        message.success('添加成功');
      }

      setIsModalVisible(false);
      fetchQuotes();
    } catch {
      // API errors are shown by lib/api.js.
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.deleteDailyQuote(id);
      message.success('删除成功');
      fetchQuotes();
    } catch {
      // API errors are shown by lib/api.js.
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: '句子',
      key: 'sentence',
      cellClassName: 'text-dark',
      render: (row) => (
        <div className="max-w-xs lg:max-w-md truncate" title={row.sentence}>
          {row.sentence}
        </div>
      )
    },
    {
      title: '中文释义',
      key: 'meaning',
      cellClassName: 'text-muted',
      render: (row) => (
        <div className="max-w-xs truncate" title={row.meaning || ''}>
          {row.meaning || <span className="text-gray-300">-</span>}
        </div>
      )
    },
    {
      title: '来源',
      key: 'source',
      cellClassName: 'text-muted',
      render: (row) => (
        <span>{row.source || <span className="text-gray-300">-</span>}</span>
      )
    },
    {
      title: '操作',
      key: 'actions',
      cellClassName: 'text-sm',
      render: (row) => (
        <div className="flex items-center gap-1">
          <AntButton
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(row)}
            style={{ padding: 0 }}
          >
            编辑
          </AntButton>
          <Popconfirm
            title="确定删除这条记录吗？"
            onConfirm={() => handleDelete(row.id)}
            okText="确定"
            cancelText="取消"
          >
            <AntButton
              type="link"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: 0 }}
            >
              删除
            </AntButton>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-dark">每日一句管理</h3>
        <AntButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          添加句子
        </AntButton>
      </div>

      <PaginationTable
        data={quotes}
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
        emptyMessage="暂无每日一句"
        emptyIcon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />

      <Modal
        title={editingId ? '编辑句子' : '添加句子'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText={submitting ? '保存中...' : '确定'}
        okButtonProps={{ loading: submitting, disabled: submitting }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="sentence"
            label="日语句子"
            rules={[{ required: true, message: '请输入日语句子' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入日语句子" />
          </Form.Item>
          <Form.Item
            name="meaning"
            label="中文释义"
            rules={[{ required: true, message: '请输入中文释义' }]}
          >
            <Input.TextArea rows={2} placeholder="请输入中文翻译/释义" />
          </Form.Item>
          <Form.Item
            name="source"
            label="来源（选填）"
          >
            <Input placeholder="如：日本のことわざ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DailyQuoteManager;
