import { useState, useEffect } from 'react';
import { Input, Select, Modal } from 'antd';
import PaginationTable from '../common/PaginationTable';
import { api } from '../../lib/api';
import { handleApiError, logError } from '../../utils.js';

const ReadingManager = ({ showToast }) => {
  const [readingList, setReadingList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchId, setSearchId] = useState('');
  
  // 表单状态
  const [readingForm, setReadingForm] = useState({
    difficulty: '',
    article: '',
    groups: [{
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    }]
  });

  // 难度选项
  const difficultyOptions = [
    { value: '初级1', label: '初级1' },
    { value: '初级2', label: '初级2' },
    { value: '中级1', label: '中级1' },
    { value: '中级2', label: '中级2' },
    { value: '高级1', label: '高级1' },
    { value: '高级2', label: '高级2' }
  ];

  // 组件挂载时加载阅读列表
  useEffect(() => {
    fetchReadingList(true);
  }, []);

  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('groups[')) {
      // 处理嵌套字段，如 groups[0].question
      const match = name.match(/groups\[(\d+)\]\.(\w+)/);
      if (match) {
        const [, index, field] = match;
        const newGroups = [...readingForm.groups];
        newGroups[index] = { ...newGroups[index], [field]: value };
        setReadingForm(prev => ({ ...prev, groups: newGroups }));
      }
    } else {
      // 处理普通字段
      setReadingForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // 处理选项变化
  const handleOptionChange = (groupIndex, optionIndex, value) => {
    const newGroups = [...readingForm.groups];
    newGroups[groupIndex].options = [...newGroups[groupIndex].options];
    newGroups[groupIndex].options[optionIndex] = value;
    setReadingForm(prev => ({ ...prev, groups: newGroups }));
  };

  // 添加选项组
  const addOptionGroup = () => {
    if (readingForm.groups.length < 10) {
      setReadingForm(prev => ({
        ...prev,
        groups: [...prev.groups, {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          explanation: ''
        }]
      }));
    } else {
      showToast('最多只能添加10组选项', 'error');
    }
  };

  // 删除选项组
  const removeOptionGroup = (groupIndex) => {
    if (readingForm.groups.length > 1) {
      setReadingForm(prev => ({
        ...prev,
        groups: prev.groups.filter((_, index) => index !== groupIndex)
      }));
    }
  };

  // 表单验证
  const validateForm = () => {
    if (!readingForm.difficulty) {
      showToast('请选择难度', 'error');
      return false;
    }
    if (!readingForm.article.trim()) {
      showToast('请输入文章内容', 'error');
      return false;
    }
    for (let i = 0; i < readingForm.groups.length; i++) {
      const group = readingForm.groups[i];
      if (!group.question.trim()) {
        showToast(`请填写第${i + 1}组的题目`, 'error');
        return false;
      }
      if (group.options.some(option => !option.trim())) {
        showToast(`请填写第${i + 1}组的所有选项`, 'error');
        return false;
      }
      if (!group.correctAnswer) {
        showToast(`请选择第${i + 1}组的正确答案`, 'error');
        return false;
      }
    }
    return true;
  };

  // 加载阅读列表
  const fetchReadingList = async (useEmptyFilters = false) => {
    setIsLoading(true);
    try {
      // 构建查询参数
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      // 添加搜索参数
      if (!useEmptyFilters && searchId) {
        params.id = searchId;
      }
      
      const data = await api.getReadingList(params);
      
      if (typeof setReadingList === 'function') {
        // 处理不同的数据结构
        if (Array.isArray(data)) {
          setReadingList(data);
          setTotalItems(data.length);
        } else if (data.data) {
          setReadingList(data.data);
          setTotalItems(data.total || 0);
        } else {
          setReadingList([]);
          setTotalItems(0);
        }
      }
    } catch (error) {
      logError(error, 'Fetch Reading');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setReadingForm({
      difficulty: '',
      article: '',
      groups: [{
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
      }]
    });
  };

  // 处理添加阅读
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // 构建发送到 API 的数据
      const readingData = {
        difficulty: readingForm.difficulty,
        article: readingForm.article.trim(),
        groups: readingForm.groups
      };
      
      await api.createReading(readingData);
      
      showToast('阅读添加成功', 'success');
      setShowModal(false);
      // 重置表单
      resetForm();
      // 重新加载阅读列表
      fetchReadingList();
    } catch (error) {
      logError(error, 'Add Reading');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理更新阅读
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // 构建发送到 API 的数据
      const readingData = {
        difficulty: readingForm.difficulty,
        article: readingForm.article.trim(),
        groups: readingForm.groups
      };
      
      await api.updateReading(currentEditId, readingData);
      
      showToast('阅读更新成功', 'success');
      setShowModal(false);
      // 重置表单
      resetForm();
      // 重新加载阅读列表
      fetchReadingList();
    } catch (error) {
      logError(error, 'Update Reading');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开编辑模态框
  const openEditModal = (reading) => {
    setCurrentEditId(reading.id);
    setIsEditMode(true);
    let groups = [{
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    }];
    if (reading.groups) {
      if (Array.isArray(reading.groups)) {
        groups = reading.groups;
      }
    }
    setReadingForm({
      difficulty: reading.difficulty || '',
      article: reading.article || '',
      groups: groups
    });
    setShowModal(true);
  };

  // 打开删除确认模态框
  const openDeleteConfirm = (id) => {
    setCurrentEditId(id);
    setShowDeleteConfirm(true);
  };

  // 处理删除阅读
  const confirmDelete = async () => {
    setIsLoading(true);
    
    try {
      await api.deleteReading(currentEditId);
      
      showToast('阅读删除成功', 'success');
      setShowDeleteConfirm(false);
      setCurrentEditId(null);
      // 清空搜索条件
      setSearchId('');
      // 重新加载阅读列表，使用空过滤器
      fetchReadingList(true);
    } catch (error) {
      logError(error, 'Delete Reading');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="输入问题ID支持搜索"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                setCurrentPage(1);
                fetchReadingList();
              }
            }}
          />
        </div>
        <button 
          onClick={() => {
            setIsEditMode(false);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加阅读
        </button>
      </div>
      
      <PaginationTable
        data={readingList}
        columns={[
          {
            title: 'ID',
            key: 'id',
            render: (row) => row.id || '-',
            cellClassName: 'text-dark'
          },
          {
            title: '难度',
            key: 'difficulty',
            render: (row) => row.difficulty || '-',
            cellClassName: 'text-dark font-medium'
          },
          {
            title: '文章',
            key: 'article',
            render: (row) => row.article ? row.article.substring(0, 50) + '...' : '-',
            cellClassName: 'text-muted'
          },
          {
            title: '题目数量',
            key: 'groups',
            render: (row) => row.groups && Array.isArray(row.groups) ? row.groups.length : 0,
            cellClassName: 'text-dark'
          },
          {
            title: '操作',
            render: (row) => (
              <div className="flex gap-2">
                <button 
                  onClick={() => openEditModal(row)}
                  className="px-2 py-1 bg-blue-100 text-primary rounded text-xs hover:bg-blue-200 transition-colors"
                >
                  编辑
                </button>
                <button 
                  onClick={() => openDeleteConfirm(row.id)}
                  className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors"
                >
                  删除
                </button>
              </div>
            ),
            cellClassName: 'text-dark'
          }
        ]}
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          total: totalItems,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setItemsPerPage(pageSize);
            fetchReadingList();
          }
        }}
        loading={isLoading}
      />

      {/* 添加/编辑模态框 */}
      <Modal
        title={isEditMode ? '编辑阅读' : '添加阅读'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          resetForm();
        }}
        onOk={isEditMode ? handleSubmitEdit : handleSubmitAdd}
        okText="保存"
        cancelText="取消"
      >
        <form onSubmit={isEditMode ? handleSubmitEdit : handleSubmitAdd}>
          {/* 难度 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              难度 <span className="text-red-500">*</span>
            </label>
            <Select
              options={difficultyOptions}
              value={readingForm.difficulty}
              onChange={(value) => setReadingForm(prev => ({ ...prev, difficulty: value }))}
              placeholder="请选择难度"
              style={{ width: '100%' }}
            />
          </div>

          {/* 文章 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文章 <span className="text-red-500">*</span>
            </label>
            <Input.TextArea
              name="article"
              value={readingForm.article}
              onChange={handleFormChange}
              placeholder="请输入文章内容"
              rows={8}
              className="w-full"
            />
          </div>

          {/* 题目组 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              题目组
            </label>
            {readingForm.groups.map((group, groupIndex) => (
              <div key={groupIndex} className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">第 {groupIndex + 1} 组</h4>
                  {readingForm.groups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOptionGroup(groupIndex)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  )}
                </div>

                {/* 题目 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    题目 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name={`groups[${groupIndex}].question`}
                    value={group.question}
                    onChange={handleFormChange}
                    placeholder="请输入题目"
                    className="w-full"
                  />
                </div>

                {/* 选项 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    选项 <span className="text-red-500">*</span>
                  </label>
                  {group.options.map((option, optionIndex) => (
                    <Input
                      key={optionIndex}
                      name={`groups[${groupIndex}].options[${optionIndex}]`}
                      value={option}
                      onChange={(e) => handleOptionChange(groupIndex, optionIndex, e.target.value)}
                      placeholder={`选项 ${String.fromCharCode(65 + optionIndex)}`}
                      className="w-full mb-1"
                    />
                  ))}
                </div>

                {/* 正确答案 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    正确答案 <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={group.options.map((option, index) => ({
                      value: String.fromCharCode(65 + index),
                      label: `${String.fromCharCode(65 + index)}. ${option}`
                    })).filter(option => option.label !== '. ')}
                    value={group.correctAnswer}
                    onChange={(value) => {
                      const newGroups = [...readingForm.groups];
                      newGroups[groupIndex] = { ...newGroups[groupIndex], correctAnswer: value };
                      setReadingForm(prev => ({ ...prev, groups: newGroups }));
                    }}
                    placeholder="请选择正确答案"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* 解析 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    解析
                  </label>
                  <Input.TextArea
                  name={`groups[${groupIndex}].explanation`}
                  value={group.explanation}
                  onChange={handleFormChange}
                  placeholder="请输入解析（选填）"
                  rows={3}
                  className="w-full"
                />
                </div>
              </div>
            ))}

            {/* 添加选项组按钮 */}
            {readingForm.groups.length < 10 && (
              <button
                type="button"
                onClick={addOptionGroup}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:text-primary hover:border-primary transition-colors"
              >
                + 添加题目组
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        title="确认删除"
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onOk={confirmDelete}
        okText="删除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <p>确定要删除这个阅读项目吗？</p>
      </Modal>
    </div>
  );
};

export default ReadingManager;