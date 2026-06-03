import { useState, useEffect } from 'react';
import { Input, Select, Modal, message, Button } from 'antd';
import PaginationTable from '../common/PaginationTable';
import { api } from '../../lib/api';
import { handleApiError } from '../../utils.js';

const TextbookManager = () => {
  const [textbooks, setTextbooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTextbook, setCurrentTextbook] = useState(null);
  
  const [textbookForm, setTextbookForm] = useState({
    name: '',
    description: '',
    level: '',
    sort_order: 0,
    lessons: []
  });

  const [newLessonName, setNewLessonName] = useState('');

  const levels = ['初级', '中级', '高级'];

  // 获取教材列表
  const fetchTextbooks = async () => {
    try {
      const data = await api.getTextbookList();
      setTextbooks(data);
    } catch (error) {
      handleApiError(error, message.error);
    }
  };

  useEffect(() => {
    fetchTextbooks();
  }, []);

  // 处理表单字段变更
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTextbookForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 添加课程到表单
  const addLesson = () => {
    if (!newLessonName.trim()) {
      message.error('请输入课程名称');
      return;
    }
    
    const newLesson = {
      id: Date.now(),
      name: newLessonName.trim(),
      sort_order: textbookForm.lessons.length
    };
    
    setTextbookForm(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }));
    setNewLessonName('');
  };

  // 删除表单中的课程
  const removeLesson = (lessonId) => {
    setTextbookForm(prev => ({
      ...prev,
      lessons: prev.lessons.filter(l => l.id !== lessonId).map((l, index) => ({
        ...l,
        sort_order: index
      }))
    }));
  };

  // 重置表单
  const resetForm = () => {
    setTextbookForm({
      name: '',
      description: '',
      level: '',
      sort_order: 0,
      lessons: []
    });
    setIsEditMode(false);
    setCurrentTextbook(null);
    setNewLessonName('');
  };

  // 打开添加教材模态框
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // 打开编辑教材模态框
  const openEditModal = (textbook) => {
    setTextbookForm({
      name: textbook.name,
      description: textbook.description || '',
      level: textbook.level || '',
      sort_order: textbook.sort_order || 0,
      lessons: textbook.lessons || []
    });
    setCurrentTextbook(textbook);
    setIsEditMode(true);
    setShowModal(true);
  };

  // 提交添加/编辑教材
  const handleSubmit = async () => {
    if (!textbookForm.name.trim()) {
      message.error('请输入教材名称');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode) {
        await api.updateTextbook(currentTextbook.id, textbookForm);
        message.success('教材更新成功');
      } else {
        await api.createTextbook(textbookForm);
        message.success('教材创建成功');
      }
      setShowModal(false);
      resetForm();
      fetchTextbooks();
    } catch (error) {
      handleApiError(error, message.error);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除教材
  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个教材吗？此操作会同时删除关联的课程。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.deleteTextbook(id);
          message.success('教材删除成功');
          fetchTextbooks();
        } catch (error) {
          handleApiError(error, message.error);
        }
      }
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '教材名称',
      dataIndex: 'name',
      key: 'name',
      width: '20%'
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: '10%',
      render: (row) => row.level || '-'
    },
    {
      title: '课程数量',
      dataIndex: 'lessons',
      key: 'lessonCount',
      width: '15%',
      render: (row) => row.lessons?.length || 0
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      render: (row) => row.description || '-'
    },
    {
      title: '操作',
      key: 'actions',
      width: '25%',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            删除
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">教材管理</h2>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加教材
        </button>
      </div>

      <PaginationTable
        data={textbooks}
        columns={columns}
        rowKey="id"
        pagination={false}
        emptyMessage="暂无教材"
        emptyIcon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />

      {/* 添加/编辑教材模态框 - 包含课程管理 */}
      <Modal
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditMode ? '编辑教材' : '添加教材'}
        onOk={handleSubmit}
        okText={isLoading ? '处理中...' : '保存'}
        cancelText="取消"
        okButtonProps={{ loading: isLoading }}
        width={700}
      >
        <div className="space-y-6">
          {/* 教材基本信息 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">教材名称 <span className="text-red-500">*</span></label>
              <Input
                type="text"
                name="name"
                value={textbookForm.name}
                onChange={handleFormChange}
                placeholder="请输入教材名称"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">级别</label>
              <Select
                options={levels.map(level => ({ value: level, label: level }))}
                value={textbookForm.level}
                onChange={(value) => setTextbookForm(prev => ({ ...prev, level: value }))}
                placeholder="请选择级别"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">描述</label>
              <Input.TextArea
                name="description"
                value={textbookForm.description}
                onChange={handleFormChange}
                placeholder="请输入教材描述"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">排序序号</label>
              <Input
                type="number"
                name="sort_order"
                value={textbookForm.sort_order}
                onChange={handleFormChange}
                placeholder="排序序号"
                min="0"
              />
            </div>
          </div>

          {/* 课程列表管理 */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-dark">课程列表</h4>
            </div>
            
            {/* 添加课程输入框 */}
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                value={newLessonName}
                onChange={(e) => setNewLessonName(e.target.value)}
                placeholder="课程名称，如：第1课"
                style={{ flex: 1 }}
                onPressEnter={addLesson}
              />
              <Button
                type="primary"
                onClick={addLesson}
              >
                添加课程
              </Button>
            </div>

            {/* 课程列表 */}
            {textbookForm.lessons.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无课程，请添加课程</p>
            ) : (
              <div className="space-y-2">
                {textbookForm.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <span>{lesson.name}</span>
                    </span>
                    <button
                      onClick={() => removeLesson(lesson.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TextbookManager;
