import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const DailyQuoteManager = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const result = await api.getDailyQuoteList();
      setQuotes(result.data || result);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const showModal = (quote = null) => {
    if (quote) {
      form.setFieldsValue({
        sentence: quote.sentence,
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
    try {
      const values = await form.validateFields();
      
      if (editingId) {
        await api.updateDailyQuote(editingId, values);
        message.success('修改成功');
      } else {
        await api.createDailyQuote(values);
        message.success('添加成功');
      }
      
      setIsModalVisible(false);
      fetchQuotes();
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteDailyQuote(id);
      message.success('删除成功');
      fetchQuotes();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const columns = [
    {
      title: '句子',
      dataIndex: 'sentence',
      key: 'sentence',
      ellipsis: true,
      width: '60%'
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      ellipsis: true,
      width: '20%'
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex gap-1" style={{ width: '100%' }}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ padding: 0 }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: 0 }}
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">每日一句管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          添加句子
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={quotes}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        title={editingId ? '编辑句子' : '添加句子'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="sentence"
            label="句子"
            rules={[{ required: true, message: '请输入句子' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入日语句子" />
          </Form.Item>
          <Form.Item
            name="source"
            label="来源"
          >
            <Input placeholder="如：日本のことわざ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DailyQuoteManager;
