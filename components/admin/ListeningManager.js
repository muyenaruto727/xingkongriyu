import { useState, useEffect } from 'react';
import { Input, Select, Modal } from 'antd';
import PaginationTable from '../common/PaginationTable';
import { api } from '../../lib/api';
import { handleApiError, logError } from '../../utils.js';

const ListeningManager = ({ showToast }) => {
  const [listeningList, setListeningList] = useState([]);
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
  const [listeningForm, setListeningForm] = useState({
    difficulty: '',
    audioUrl: '',
    exerciseType: '答题',
    explanation: '',
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

  // 练习类型选项
  const exerciseTypeOptions = [
    { value: '精听', label: '精听' },
    { value: '答题', label: '答题' }
  ];

  // 组件挂载时加载听力列表
  useEffect(() => {
    fetchListeningList(true);
  }, []);

  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('groups[')) {
      // 处理嵌套字段，如 groups[0].question
      const match = name.match(/groups\[(\d+)\]\.(\w+)/);
      if (match) {
        const [, index, field] = match;
        const newGroups = [...listeningForm.groups];
        newGroups[index] = { ...newGroups[index], [field]: value };
        setListeningForm(prev => ({ ...prev, groups: newGroups }));
      }
    } else {
      // 处理普通字段
      setListeningForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // 处理选项变化
  const handleOptionChange = (groupIndex, optionIndex, value) => {
    const newGroups = [...listeningForm.groups];
    newGroups[groupIndex].options = [...newGroups[groupIndex].options];
    newGroups[groupIndex].options[optionIndex] = value;
    setListeningForm(prev => ({ ...prev, groups: newGroups }));
  };

  // 添加选项组
  const addOptionGroup = () => {
    if (listeningForm.groups.length < 10) {
      setListeningForm(prev => ({
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
    if (listeningForm.groups.length > 1) {
      setListeningForm(prev => ({
        ...prev,
        groups: prev.groups.filter((_, index) => index !== groupIndex)
      }));
    }
  };

  // 表单验证
  const validateForm = () => {
    if (!listeningForm.difficulty) {
      showToast('请选择难度', 'error');
      return false;
    }
    if (!listeningForm.audioUrl.trim()) {
      showToast('请输入听力材料URL', 'error');
      return false;
    }
    if (!listeningForm.exerciseType) {
      showToast('请选择练习类型', 'error');
      return false;
    }
    if (listeningForm.exerciseType === '答题') {
      for (let i = 0; i < listeningForm.groups.length; i++) {
        const group = listeningForm.groups[i];
        if (group.options.some(option => !option.trim())) {
          showToast(`请填写第${i + 1}组的所有选项`, 'error');
          return false;
        }
        if (!group.correctAnswer) {
          showToast(`请选择第${i + 1}组的正确答案`, 'error');
          return false;
        }
        if (!group.explanation.trim()) {
          showToast(`请输入第${i + 1}组的参考解析`, 'error');
          return false;
        }
      }
    } else {
      if (!listeningForm.explanation.trim()) {
        showToast('请输入参考解析', 'error');
        return false;
      }
    }
    return true;
  };

  // 加载听力列表
  const fetchListeningList = async (useEmptyFilters = false) => {
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
      
      const data = await api.getListeningList(params);
      
      if (typeof setListeningList === 'function') {
        // 处理不同的数据结构
        if (Array.isArray(data)) {
          setListeningList(data);
          setTotalItems(data.length);
        } else if (data.data) {
          setListeningList(data.data);
          setTotalItems(data.total || 0);
        } else {
          setListeningList([]);
          setTotalItems(0);
        }
      }
    } catch (error) {
      logError(error, 'Fetch Listening');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setListeningForm({
      difficulty: '',
      audioUrl: '',
      exerciseType: '答题',
      explanation: '',
      groups: [{
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
      }]
    });
    setCurrentEditId(null);
    setIsEditMode(false);
  };

  // 处理添加听力
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // 构建发送到 API 的数据
      const listeningData = {
        difficulty: listeningForm.difficulty,
        audioUrl: listeningForm.audioUrl.trim(),
        exerciseType: listeningForm.exerciseType,
        groups: listeningForm.groups,
        explanation: listeningForm.explanation.trim()
      };
      
      await api.createListening(listeningData);
      
      showToast('听力添加成功', 'success');
      setShowModal(false);
      // 重置表单
      resetForm();
      // 重新加载听力列表
      fetchListeningList(true);
    } catch (error) {
      logError(error, 'Add Listening');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理编辑听力
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // 构建发送到 API 的数据
      const listeningData = {
        difficulty: listeningForm.difficulty,
        audioUrl: listeningForm.audioUrl.trim(),
        exerciseType: listeningForm.exerciseType,
        groups: listeningForm.groups,
        explanation: listeningForm.explanation.trim()
      };
      
      await api.updateListening(currentEditId, listeningData);
      
      showToast('听力更新成功', 'success');
      setShowModal(false);
      // 重置表单
      resetForm();
      // 重新加载听力列表
      fetchListeningList();
    } catch (error) {
      logError(error, 'Update Listening');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开编辑模态框
  const openEditModal = (listening) => {
    setCurrentEditId(listening.id);
    setIsEditMode(true);
    let groups = [{
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    }];
    if (listening.groups) {
      if (Array.isArray(listening.groups)) {
        groups = listening.groups;
      }
    }
    setListeningForm({
      difficulty: listening.difficulty || '',
      audioUrl: listening.audio_url || '',
      exerciseType: listening.exercise_type || '答题',
      explanation: listening.explanation || '',
      groups: groups
    });
    setShowModal(true);
  };

  // 打开删除确认模态框
  const openDeleteConfirm = (id) => {
    setCurrentEditId(id);
    setShowDeleteConfirm(true);
  };

  // 处理删除听力
  const confirmDelete = async () => {
    setIsLoading(true);
    
    try {
      await api.deleteListening(currentEditId);
      
      showToast('听力删除成功', 'success');
      setShowDeleteConfirm(false);
      setCurrentEditId(null);
      // 清空搜索条件
      setSearchId('');
      // 重新加载听力列表，使用空过滤器
      fetchListeningList(true);
    } catch (error) {
      logError(error, 'Delete Listening');
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
                fetchListeningList();
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
          添加听力
        </button>
      </div>
      
      <PaginationTable
        data={listeningList}
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
            title: '听力材料URL',
            key: 'audio_url',
            render: (row) => row.audio_url || '-',
            cellClassName: 'text-muted'
          },
          {
            title: '练习类型',
            key: 'exercise_type',
            render: (row) => row.exercise_type || '-',
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
            cellClassName: 'text-sm'
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
          fetchListeningList();
        }}
        emptyMessage="暂无听力"
        emptyIcon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
      
      {/* 听力模态框 */}
      <Modal
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditMode ? '编辑听力' : '添加听力'}
        width={900}
        onOk={isEditMode ? handleSubmitEdit : handleSubmitAdd}
        okText="保存"
        cancelText="取消"
      >
        <form onSubmit={isEditMode ? handleSubmitEdit : handleSubmitAdd} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">难度 <span className="text-red-500">*</span></label>
              <Select
                options={difficultyOptions}
                value={listeningForm.difficulty}
                onChange={(value) => setListeningForm(prev => ({ ...prev, difficulty: value }))}
                placeholder="请选择难度"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">听力材料URL <span className="text-red-500">*</span></label>
              <Input 
                type="text" 
                name="audioUrl" 
                value={listeningForm.audioUrl} 
                onChange={handleFormChange} 
                placeholder="请输入听力材料URL"
                style={{ width: '100%' }}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">练习类型 <span className="text-red-500">*</span></label>
              <Select
                options={exerciseTypeOptions}
                value={listeningForm.exerciseType}
                onChange={(value) => setListeningForm(prev => ({ ...prev, exerciseType: value }))}
                placeholder="请选择练习类型"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          {listeningForm.exerciseType === '答题' && (
            <div className="space-y-6">
              {listeningForm.groups.map((group, groupIndex) => (
                <div key={groupIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">第{groupIndex + 1}组</span>
                    {listeningForm.groups.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeOptionGroup(groupIndex)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">题目</label>
                      <Input 
                        type="text" 
                        name={`groups[${groupIndex}].question`} 
                        value={group.question} 
                        onChange={handleFormChange} 
                        placeholder="请输入题目"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">选项 <span className="text-red-500">*</span></label>
                      <div className="space-y-2">
                        {group.options.map((option, optionIndex) => (
                          <Input 
                            key={optionIndex}
                            type="text" 
                            value={option} 
                            onChange={(e) => handleOptionChange(groupIndex, optionIndex, e.target.value)} 
                            placeholder={`选项${String.fromCharCode(65 + optionIndex)}`}
                            required 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">正确答案 <span className="text-red-500">*</span></label>
                      <Select
                        options={group.options.map((option, index) => ({
                          value: String.fromCharCode(65 + index),
                          label: `${String.fromCharCode(65 + index)}. ${option}`
                        })).filter(option => option.label.includes('.'))}
                        value={group.correctAnswer}
                        onChange={(value) => {
                          const newGroups = [...listeningForm.groups];
                          newGroups[groupIndex] = { ...newGroups[groupIndex], correctAnswer: value };
                          setListeningForm(prev => ({ ...prev, groups: newGroups }));
                        }}
                        placeholder="请选择正确答案"
                        style={{ width: '100%' }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">参考解析 <span className="text-red-500">*</span></label>
                      <Input 
                        type="text" 
                        name={`groups[${groupIndex}].explanation`} 
                        value={group.explanation} 
                        onChange={handleFormChange} 
                        placeholder="请输入参考解析"
                        required 
                      />
                    </div>
                  </div>
                </div>
              ))}
              {listeningForm.groups.length < 10 && (
                <button 
                  type="button"
                  onClick={addOptionGroup}
                  className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-center text-gray-600 hover:bg-gray-50"
                >
                  添加选项组
                </button>
              )}
            </div>
          )}
          
          {listeningForm.exerciseType !== '答题' && (
            <div>
              <label className="block text-sm font-medium text-dark mb-2">参考解析 <span className="text-red-500">*</span></label>
              <Input 
                type="text" 
                name="explanation" 
                value={listeningForm.explanation} 
                onChange={handleFormChange} 
                placeholder="请输入参考解析"
                required 
              />
            </div>
          )}
        </form>
      </Modal>
      
      {/* 删除确认模态框 */}
      <Modal
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        title="确认删除"
        onOk={confirmDelete}
        okText="删除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <p className="text-center">确定要删除这个听力项目吗？</p>
      </Modal>
    </div>
  );
};

export default ListeningManager;