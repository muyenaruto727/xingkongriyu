import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PaginationTable from '../common/PaginationTable';
import { Input, Button, Table, Form, Select, message, Tree, Radio, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../../lib/api';
import { handleApiError, logError } from '../../utils.js';

// 动态导入 ReactQuill，确保只在客户端加载
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div>加载中...</div>
});

// 导入样式
if (typeof window !== 'undefined') {
  require('react-quill/dist/quill.snow.css');
}

const CourseManager = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' 或 'chapters'
  const [courseList, setCourseList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchId, setSearchId] = useState('');
  
  // 章节管理相关状态
  const [chapters, setChapters] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [form] = Form.useForm();
  const [sectionForm] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [sectionType, setSectionType] = useState('article'); // article 或 video
  
  // 课程表单状态
  const [courseForm, setCourseForm] = useState({
    name: '',
    format: '',
    description: '',
    isFree: '否',
    status: '未上架'
  });
  
  // 课程形式选项
  const formatOptions = [
    '文本课程',
    '视频课程'
  ];
  
  // 是否免费选项
  const freeOptions = [
    { value: '是', label: '是' },
    { value: '否', label: '否' }
  ];
  
  // 加载课程列表
  const fetchCourseList = async (useEmptyFilters = false) => {
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
      
      const data = await api.getCourseList(params);
      console.log('API Response:', data);
      
      if (typeof setCourseList === 'function') {
        // 处理不同的数据结构
        if (data && data.data && Array.isArray(data.data)) {
          // API 返回的数据结构是 { data: [...], pagination: {...} }
          console.log('Setting courseList from data.data:', data.data);
          setCourseList(data.data);
          setTotalItems(data.pagination?.total || 0);
        } else if (Array.isArray(data)) {
          console.log('Setting courseList from array:', data);
          setCourseList(data);
          setTotalItems(data.length);
        } else {
          console.log('Setting courseList to empty array');
          setCourseList([]);
          setTotalItems(0);
        }
      } else {
        console.log('setCourseList is not a function');
      }
    } catch (error) {
      logError(error, 'Fetch Course');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 初始化时加载课程列表
  useEffect(() => {
    fetchCourseList();
  }, [currentPage, itemsPerPage]);
  
  // 处理表单输入变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 重置表单
  const resetForm = () => {
    setCourseForm({
      name: '',
      format: '',
      description: '',
      isFree: '否',
      status: '未上架'
    });
    setCurrentEditId(null);
    setIsEditMode(false);
  };
  
  // 表单验证
  const validateForm = () => {
    if (!courseForm.name.trim()) {
      showToast('请输入课程名称', 'error');
      return false;
    }
    if (!courseForm.format) {
      showToast('请选择课程形式', 'error');
      return false;
    }
    if (!courseForm.description.trim()) {
      showToast('请输入课程介绍', 'error');
      return false;
    }
    if (!courseForm.isFree) {
      showToast('请选择是否免费', 'error');
      return false;
    }
    return true;
  };
  
  // 处理添加课程
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // 构建发送到 API 的数据
      const courseData = {
        name: courseForm.name.trim(),
        format: courseForm.format,
        description: courseForm.description.trim(),
        isFree: courseForm.isFree,
        status: courseForm.status
      };
      
      await api.createCourse(courseData);
      
      showToast('课程添加成功', 'success');
      setShowModal(false);
      // 重置表单
      resetForm();
      // 重新加载课程列表
      fetchCourseList();
    } catch (error) {
      logError(error, 'Add Course');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理更新课程
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // 构建发送到 API 的数据
      const courseData = {
        name: courseForm.name.trim(),
        format: courseForm.format,
        description: courseForm.description.trim(),
        isFree: courseForm.isFree,
        status: courseForm.status
      };
      
      await api.updateCourse(currentEditId, courseData);
      
      showToast('课程更新成功', 'success');
      setShowModal(false);
      // 重置表单
      resetForm();
      // 重新加载课程列表
      fetchCourseList();
    } catch (error) {
      logError(error, 'Update Course');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 打开添加课程模态框
  const openAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setShowModal(true);
  };
  
  // 打开编辑课程模态框
  const openEditModal = (course) => {
    setCurrentEditId(course.id);
    setIsEditMode(true);
    setCourseForm({
      name: course.name || '',
      format: course.format || '',
      description: course.description || '',
      isFree: course.is_free || '否',
      status: course.status || '未上架'
    });
    setShowModal(true);
  };
  
  // 打开删除确认模态框
  const openDeleteConfirm = (id) => {
    setCurrentEditId(id);
    setShowDeleteConfirm(true);
  };
  
  // 处理删除课程
  const confirmDelete = async () => {
    setIsLoading(true);
    
    try {
      await api.deleteCourse(currentEditId);
      
      showToast('课程删除成功', 'success');
      setShowDeleteConfirm(false);
      setCurrentEditId(null);
      // 清空搜索条件
      setSearchId('');
      // 重新加载课程列表，使用空过滤器
      fetchCourseList(true);
    } catch (error) {
      logError(error, 'Delete Course');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理课程状态变更
  const handleStatusChange = async (id, newStatus) => {
    setIsLoading(true);
    
    try {
      // 构建发送到 API 的数据
      const courseData = {
        status: newStatus
      };
      
      await api.updateCourse(id, courseData);
      
      showToast(`课程已${newStatus}`, 'success');
      // 重新加载课程列表
      fetchCourseList();
    } catch (error) {
      logError(error, 'Update Course Status');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 章节管理相关函数
  // 获取章节列表
  const fetchChapters = async (courseId) => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const response = await api.getChapterList({ courseId });
      console.log('Chapter list response:', response);
      const chapterData = Array.isArray(response) ? response : [];
      setChapters(chapterData);
      // 展开所有节点
      const keys = chapterData.map(chapter => `chapter-${chapter.id}`);
      setExpandedKeys(keys);
    } catch (error) {
      console.error('获取章节列表失败:', error);
      message.error('获取章节列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理章节添加
  const handleAddChapter = async (values) => {
    if (!currentEditId) {
      message.error('请先选择课程');
      return;
    }
    setIsLoading(true);
    try {
      await api.createChapter({
        ...values,
        courseId: currentEditId
      });
      message.success('章节添加成功');
      setShowAddModal(false);
      form.resetFields();
      fetchChapters(currentEditId);
    } catch (error) {
      console.error('添加章节失败:', error);
      message.error('添加章节失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理章节编辑
  const handleEditChapter = async (values) => {
    setIsLoading(true);
    try {
      await api.updateChapter(editingChapter.id, values);
      message.success('章节更新成功');
      setShowEditModal(false);
      form.resetFields();
      setEditingChapter(null);
      fetchChapters(currentEditId);
    } catch (error) {
      console.error('更新章节失败:', error);
      message.error('更新章节失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理章节删除
  const handleDeleteChapter = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个章节吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        setIsLoading(true);
        try {
          await api.deleteChapter(id);
          message.success('章节删除成功');
          fetchChapters(currentEditId);
        } catch (error) {
          console.error('删除章节失败:', error);
          message.error('删除章节失败');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // 处理小节添加
  const handleAddSection = async (values) => {
    if (!selectedChapter) {
      message.error('请先选择章节');
      return;
    }
    setIsLoading(true);
    try {
      // 确保 content 和 videoUrl 字段存在，避免传递 undefined
      const sectionData = {
        ...values,
        chapterId: selectedChapter.id,
        content: values.content || null,
        videoUrl: values.videoUrl || null
      };
      await api.createSection(sectionData);
      message.success('小节添加成功');
      setShowAddSectionModal(false);
      sectionForm.resetFields();
      setSectionType('article');
      fetchChapters(currentEditId);
    } catch (error) {
      console.error('添加小节失败:', error);
      message.error('添加小节失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理小节编辑
  const handleEditSection = async (values) => {
    setIsLoading(true);
    try {
      // 确保 content 和 videoUrl 字段存在，避免传递 undefined
      const sectionData = {
        ...values,
        content: values.content || null,
        videoUrl: values.videoUrl || null
      };
      await api.updateSection(editingSection.id, sectionData);
      message.success('小节更新成功');
      setShowEditSectionModal(false);
      sectionForm.resetFields();
      setEditingSection(null);
      fetchChapters(currentEditId);
    } catch (error) {
      console.error('更新小节失败:', error);
      message.error('更新小节失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理小节删除
  const handleDeleteSection = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个小节吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        setIsLoading(true);
        try {
          await api.deleteSection(id);
          message.success('小节删除成功');
          fetchChapters(currentEditId);
        } catch (error) {
          console.error('删除小节失败:', error);
          message.error('删除小节失败');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // 处理章节展开/折叠
  const handleExpand = (keys) => {
    setExpandedKeys(keys);
  };

  // 处理编辑章节
  const handleEdit = (chapter) => {
    setEditingChapter(chapter);
    form.setFieldsValue(chapter);
    setShowEditModal(true);
  };

  // 处理添加章节
  const handleAdd = () => {
    form.resetFields();
    setShowAddModal(true);
  };

  // 处理添加小节
  const openAddSectionModal = (chapter) => {
    setSelectedChapter(chapter);
    sectionForm.resetFields();
    setSectionType('article');
    setShowAddSectionModal(true);
  };

  // 处理编辑小节
  const openEditSectionModal = (section) => {
    setEditingSection(section);
    sectionForm.setFieldsValue(section);
    setSectionType(section.video_url ? 'video' : 'article');
    setShowEditSectionModal(true);
  };

  // 树形数据转换
  const treeData = chapters.map(chapter => ({
    title: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <span>{chapter.name} ({chapter.sections?.length || 0}讲)</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => openAddSectionModal(chapter)}
            style={{ color: '#3B82F6' }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(chapter)}
            style={{ color: '#64748B' }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteChapter(chapter.id)}
            style={{ color: '#EF4444' }}
          />
        </div>
      </div>
    ),
    key: `chapter-${chapter.id}`,
    children: chapter.sections?.sort((a, b) => (a.order || 0) - (b.order || 0)).filter(section => section && section.id).map(section => ({
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>{section.order ? `${section.order.toString().padStart(2, '0')} | ` : ''}{section.name}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditSectionModal(section)}
              style={{ color: '#64748B' }}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSection(section.id)}
              style={{ color: '#EF4444' }}
            />
          </div>
        </div>
      ),
      key: `section-${chapter.id}-${section.id}`
    }))
  }));
  
  // 表格列配置
  const columns = [
    {
      title: 'ID',
      key: 'id',
      width: 80,
      render: (row) => <span className="text-gray-600">{row.id}</span>
    },
    {
      title: '课程名称',
      key: 'name',
      render: (row) => <span className="font-medium">{row.name}</span>
    },
    {
      title: '课程形式',
      key: 'format',
      render: (row) => <span>{row.format}</span>
    },
    {
      title: '是否免费',
      key: 'isFree',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isFree === '是' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.isFree}
        </span>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === '上架' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.status}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (row) => (
        <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(row)}
              className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 transition-colors"
            >
              编辑
            </button>
            <button
              onClick={() => {
                setCurrentEditId(row.id);
                setActiveTab('chapters');
                fetchChapters(row.id);
              }}
              className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs hover:bg-purple-200 transition-colors"
            >
              章节管理
            </button>
            {row.status === '未上架' ? (
              <>
                <button
                  onClick={() => handleStatusChange(row.id, '上架')}
                  className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 transition-colors"
                >
                  上架
                </button>
                <button
                  onClick={() => openDeleteConfirm(row.id)}
                  className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors"
                >
                  删除
                </button>
              </>
            ) : (
              <button
                onClick={() => handleStatusChange(row.id, '未上架')}
                className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-xs hover:bg-yellow-200 transition-colors"
              >
                下架
              </button>
            )}
          </div>
      ),
      cellClassName: 'text-sm'
    }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* 标签页切换 */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'courses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            课程管理
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'chapters' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            章节管理
          </button>
        </div>
      </div>

      {/* 课程管理标签页 */}
      {activeTab === 'courses' && (
        <div>
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="输入课程ID支持搜索"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    fetchCourseList();
                  }
                }}
                className="w-full"
              />
            </div>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              添加新课程
            </button>
          </div>
          
          {/* 课程列表 */}
          <PaginationTable
            data={courseList}
            columns={columns}
            isLoading={isLoading}
            totalItems={totalItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onLimitChange={(newLimit) => {
              setItemsPerPage(newLimit);
              setCurrentPage(1);
              fetchCourseList();
            }}
          />
        </div>
      )}

      {/* 章节管理标签页 */}
      {activeTab === 'chapters' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">章节管理</h2>
            <div className="flex space-x-4">
              <Select
                placeholder="选择课程"
                style={{ width: 200 }}
                onChange={(courseId) => {
                  setCurrentEditId(courseId);
                  fetchChapters(courseId);
                }}
                value={currentEditId}
              >
                {Array.isArray(courseList) && courseList.map(course => (
                  <Select.Option key={course.id} value={course.id}>
                    {course.name}
                  </Select.Option>
                ))}
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                disabled={!currentEditId}
                style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
              >
                添加章节
              </Button>
            </div>
          </div>

          {currentEditId && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">{courseList.find(c => c.id === currentEditId)?.name} 的章节</h3>
              <Tree
                treeData={treeData}
                expandedKeys={expandedKeys}
                onExpand={handleExpand}
                style={{ marginBottom: 24 }}
              />
            </div>
          )}
        </div>
      )}
      
      {/* 添加/编辑课程模态框 */}
      <Modal
        title={isEditMode ? '编辑课程' : '添加新课程'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          resetForm();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setShowModal(false);
            resetForm();
          }}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={(e) => {
            e.preventDefault();
            isEditMode ? handleSubmitEdit(e) : handleSubmitAdd(e);
          }} style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}>
            保存
          </Button>
        ]}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          isEditMode ? handleSubmitEdit(e) : handleSubmitAdd(e);
        }} className="space-y-4">
          {/* 课程名称 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              课程名称 <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={courseForm.name}
              onChange={handleFormChange}
              placeholder="请输入课程名称"
              className="w-full"
            />
          </div>
          
          {/* 课程形式 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              课程形式 <span className="text-red-500">*</span>
            </label>
            <Select
              options={formatOptions.map(option => ({ value: option, label: option }))}
              value={courseForm.format}
              onChange={(value) => setCourseForm(prev => ({ ...prev, format: value }))}
              placeholder="请选择课程形式"
              style={{ width: '100%' }}
            />
          </div>
          
          {/* 课程介绍 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              课程介绍 <span className="text-red-500">*</span>
            </label>
            <Input.TextArea
              name="description"
              value={courseForm.description}
              onChange={handleFormChange}
              placeholder="请输入课程介绍"
              rows={5}
              style={{ width: '100%' }}
            />
          </div>
          
          {/* 是否免费 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              是否免费 <span className="text-red-500">*</span>
            </label>
            <Select
              options={freeOptions}
              value={courseForm.isFree}
              onChange={(value) => setCourseForm(prev => ({ ...prev, isFree: value }))}
              placeholder="请选择是否免费"
              style={{ width: '100%' }}
            />
          </div>
        </form>
      </Modal>
      
      {/* 删除确认模态框 */}
      <Modal
        title="删除课程"
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowDeleteConfirm(false)}>
            取消
          </Button>,
          <Button key="delete" type="primary" danger onClick={confirmDelete}>
            删除
          </Button>
        ]}
      >
        <p className="text-center">确定要删除该课程吗？此操作不可恢复。</p>
      </Modal>

      {/* 添加章节模态框 */}
      <Modal
        title="添加章节"
        open={showAddModal}
        onOk={form.submit}
        onCancel={() => setShowAddModal(false)}
        okText="保存"
        cancelText="取消"
        footer={[
          <Button key="cancel" onClick={() => setShowAddModal(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={form.submit}>
            保存
          </Button>
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleAddChapter}>
          <Form.Item
            name="name"
            label="章节名称"
            rules={[{ required: true, message: '请输入章节名称' }]}
          >
            <Input placeholder="请输入章节名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="章节描述"
          >
            <Input.TextArea rows={4} placeholder="请输入章节描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑章节模态框 */}
      <Modal
        title="编辑章节"
        open={showEditModal}
        onOk={form.submit}
        onCancel={() => setShowEditModal(false)}
        okText="保存"
        cancelText="取消"
        footer={[
          <Button key="cancel" onClick={() => setShowEditModal(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={form.submit}>
            保存
          </Button>
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleEditChapter}>
          <Form.Item
            name="name"
            label="章节名称"
            rules={[{ required: true, message: '请输入章节名称' }]}
          >
            <Input placeholder="请输入章节名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="章节描述"
          >
            <Input.TextArea rows={4} placeholder="请输入章节描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加小节模态框 */}
      <Modal
        title="添加小节"
        open={showAddSectionModal}
        onOk={() => sectionForm.submit()}
        onCancel={() => setShowAddSectionModal(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={sectionForm} layout="vertical" onFinish={handleAddSection}>
          <Form.Item
            name="name"
            label="小节名称"
            rules={[{ required: true, message: '请输入小节名称' }]}
          >
            <Input placeholder="请输入小节名称" />
          </Form.Item>
          <Form.Item
            label="小节类型"
          >
            <Radio.Group
              value={sectionType}
              onChange={(e) => setSectionType(e.target.value)}
            >
              <Radio value="article">文章</Radio>
              <Radio value="video">视频</Radio>
            </Radio.Group>
          </Form.Item>
          {sectionType === 'article' && (
            <Form.Item
              name="content"
              label="文章内容"
              rules={[{ required: true, message: '请输入文章内容' }]}
            >
              <div>
                <ReactQuill 
                  placeholder="请输入文章内容" 
                  style={{ height: '300px' }} 
                  value={sectionForm.getFieldValue('content') || ''}
                  onChange={(value) => sectionForm.setFieldsValue({ content: value })}
                />
              </div>
            </Form.Item>
          )}
          {sectionType === 'video' && (
            <Form.Item
              name="videoUrl"
              label="视频链接"
              rules={[{ required: true, message: '请输入视频链接' }]}
            >
              <Input placeholder="请输入视频链接" />
            </Form.Item>
          )}
          <Form.Item
            name="order"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <Input type="number" placeholder="请输入排序" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑小节模态框 */}
      <Modal
        title="编辑小节"
        open={showEditSectionModal}
        onOk={() => sectionForm.submit()}
        onCancel={() => setShowEditSectionModal(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={sectionForm} layout="vertical" onFinish={handleEditSection}>
          <Form.Item
            name="name"
            label="小节名称"
            rules={[{ required: true, message: '请输入小节名称' }]}
          >
            <Input placeholder="请输入小节名称" />
          </Form.Item>
          <Form.Item
            label="小节类型"
          >
            <Radio.Group
              value={sectionType}
              onChange={(e) => setSectionType(e.target.value)}
            >
              <Radio value="article">文章</Radio>
              <Radio value="video">视频</Radio>
            </Radio.Group>
          </Form.Item>
          {sectionType === 'article' && (
            <Form.Item
              name="content"
              label="文章内容"
              rules={[{ required: true, message: '请输入文章内容' }]}
            >
              <div>
                <ReactQuill 
                  placeholder="请输入文章内容" 
                  style={{ height: '300px' }} 
                  value={sectionForm.getFieldValue('content') || ''}
                  onChange={(value) => sectionForm.setFieldsValue({ content: value })}
                />
              </div>
            </Form.Item>
          )}
          {sectionType === 'video' && (
            <Form.Item
              name="videoUrl"
              label="视频链接"
              rules={[{ required: true, message: '请输入视频链接' }]}
            >
              <Input placeholder="请输入视频链接" />
            </Form.Item>
          )}
          <Form.Item
            name="order"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <Input type="number" placeholder="请输入排序" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManager;