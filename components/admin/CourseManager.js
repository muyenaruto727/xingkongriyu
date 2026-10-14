import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PaginationTable from '../common/PaginationTable';
import {
  Input,
  Button,
  Table,
  Form,
  Select,
  Cascader,
  message,
  Tree,
  Radio,
  Modal,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../../lib/api';
import { logError } from '../../utils.js';
import {
  getPageSizeChangeState,
  getPaginationRequestParams,
} from '../../lib/adminPagination';
import {
  buildTextbookCascaderOptions,
  buildTextbookCascaderValue,
  extractTextbookCascaderSelection,
  formatTextbookCascaderDisplay,
  splitCommaList,
} from '../../lib/vocabTextbookCascader';

// 动态导入 WangEditor，确保只在客户端加载
const WangEditor = dynamic(() => import('../common/WangEditor'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        borderRadius: '6px',
        color: '#999',
      }}
    >
      编辑器加载中...
    </div>
  ),
});

const CourseManager = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' 或 'chapters'
  const [courseList, setCourseList] = useState([]);
  const [textbooks, setTextbooks] = useState([]);
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
  const [sectionType, setSectionType] = useState('article');
  const sectionTextbookSelection = Form.useWatch('textbookSelection', sectionForm) || [];

  // 课程表单状态
  const [courseForm, setCourseForm] = useState({
    name: '',
    format: '',
    description: '',
    price: 0,
    status: '未上架',
  });

  // 课程形式选项
  const formatOptions = ['文本课程', '视频课程', '1V1辅导'];
  const sectionCascaderOptions = buildTextbookCascaderOptions(textbooks);
  const selectedCourse = courseList.find((course) => course.id === currentEditId);
  const selectedCourseFormat = selectedCourse?.format || '文本课程';
  const isTextCourse = selectedCourseFormat === '文本课程';
  const isVideoCourse = selectedCourseFormat === '视频课程';
  const isOneOnOneCourse = selectedCourseFormat === '1V1辅导';
  const hasRelatedTextbook = Array.isArray(sectionTextbookSelection) && sectionTextbookSelection.length > 0;

  const getSectionTypeOptions = () => {
    const baseOptions = [
      { label: '会话', value: 'conversation' },
      { label: '阅读', value: 'reading' },
      { label: '文章', value: 'article' },
    ];

    if (!hasRelatedTextbook) {
      return baseOptions;
    }

    return [
      { label: '词汇', value: 'vocabulary' },
      { label: '语法', value: 'grammar' },
      ...baseOptions,
    ];
  };

  const normalizeSectionType = (nextType, hasRelation = hasRelatedTextbook) => {
    if (!isTextCourse) return isVideoCourse ? 'video' : 'article';
    if (!hasRelation && ['vocabulary', 'grammar'].includes(nextType)) {
      return 'conversation';
    }
    return nextType || 'conversation';
  };

  // 加载课程列表
  const fetchCourseList = async (useEmptyFilters = false, pagination = {}) => {
    setIsLoading(true);
    try {
      // 构建查询参数
      const params = {
        ...getPaginationRequestParams({
          currentPage,
          itemsPerPage,
          ...pagination,
        }),
      };

      // 添加搜索参数
      if (!useEmptyFilters && searchId) {
        params.id = searchId;
      }

      const data = await api.getCourseList(params);

      if (typeof setCourseList === 'function') {
        // 处理不同的数据结构
        if (data && data.data && Array.isArray(data.data)) {
          // API 返回的数据结构是 { data: [...], total }
          setCourseList(data.data);
          setTotalItems(data.total || 0);
        } else if (Array.isArray(data)) {
          setCourseList(data);
          setTotalItems(data.length);
        } else {
          setCourseList([]);
          setTotalItems(0);
        }
      } else {
      }
    } catch (error) {
      logError(error, 'Fetch Course');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTextbooks = async () => {
    try {
      const data = await api.getTextbookList();
      setTextbooks(Array.isArray(data) ? data : []);
    } catch (error) {
      api.handleError('获取教材列表失败:', error);
    }
  };

  // 初始化时加载课程列表
  useEffect(() => {
    fetchCourseList();
    fetchTextbooks();
  }, [currentPage, itemsPerPage]);

  // 处理表单输入变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 重置表单
  const resetForm = () => {
    setCourseForm({
      name: '',
      format: '',
      description: '',
      price: 0,
      status: '未上架',
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
    if (!Number.isFinite(Number(courseForm.price)) || Number(courseForm.price) < 0) {
      showToast('请输入不小于 0 的课程价格', 'error');
      return false;
    }
    return true;
  };

  // 处理添加课程
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (isLoading) return;

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
        price: Number(courseForm.price),
        status: courseForm.status,
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
    } finally {
      setIsLoading(false);
    }
  };

  // 处理更新课程
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

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
        price: Number(courseForm.price),
        status: courseForm.status,
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
      price: Number(course.price || 0),
      status: course.status || '未上架',
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
    if (isLoading) return;
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
        status: newStatus,
      };

      await api.updateCourse(id, courseData);

      showToast(`课程已${newStatus}`, 'success');
      // 重新加载课程列表
      fetchCourseList();
    } catch (error) {
      logError(error, 'Update Course Status');
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
      const chapterData = Array.isArray(response) ? response : [];
      setChapters(chapterData);
      // 展开所有节点
      const keys = chapterData.map((chapter) => `chapter-${chapter.id}`);
      setExpandedKeys(keys);
    } catch (error) {
      api.handleError('获取章节列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理章节添加
  const handleAddChapter = async (values) => {
    if (isLoading) return;
    if (!currentEditId) {
      message.error('请先选择课程');
      return;
    }
    setIsLoading(true);
    try {
      await api.createChapter({
        ...values,
        courseId: currentEditId,
      });
      message.success('章节添加成功');
      setShowAddModal(false);
      form.resetFields();
      fetchChapters(currentEditId);
    } catch (error) {
      api.handleError('添加章节失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理章节编辑
  const handleEditChapter = async (values) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await api.updateChapter(editingChapter.id, values);
      message.success('章节更新成功');
      setShowEditModal(false);
      form.resetFields();
      setEditingChapter(null);
      fetchChapters(currentEditId);
    } catch (error) {
      api.handleError('更新章节失败:', error);
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
          api.handleError('删除章节失败:', error);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const buildSectionPayload = (values, chapterId) => {
    const { textbooks, lessons } = extractTextbookCascaderSelection(values.textbookSelection || []);
    const nextType = normalizeSectionType(sectionType, textbooks.length > 0 || lessons.length > 0);
    const shouldKeepContent = ['conversation', 'reading', 'article'].includes(nextType);

    return {
      name: values.name,
      chapterId,
      order: values.order,
      contentType: nextType,
      textbook: isTextCourse ? textbooks.join(',') : '',
      lesson: isTextCourse ? lessons.join(',') : '',
      content: isTextCourse && shouldKeepContent ? values.content || null : null,
      videoUrl: isVideoCourse ? values.videoUrl || null : null,
    };
  };

  // 处理小节添加
  const handleAddSection = async (values) => {
    if (isLoading) return;
    if (!selectedChapter) {
      message.error('请先选择章节');
      return;
    }
    setIsLoading(true);
    try {
      const sectionData = buildSectionPayload(values, selectedChapter.id);
      await api.createSection(sectionData);
      message.success('小节添加成功');
      setShowAddSectionModal(false);
      sectionForm.resetFields();
      setSectionType('conversation');
      fetchChapters(currentEditId);
    } catch (error) {
      api.handleError('添加小节失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理小节编辑
  const handleEditSection = async (values) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const sectionData = buildSectionPayload(values);
      await api.updateSection(editingSection.id, sectionData);
      message.success('小节更新成功');
      setShowEditSectionModal(false);
      sectionForm.resetFields();
      setEditingSection(null);
      fetchChapters(currentEditId);
    } catch (error) {
      api.handleError('更新小节失败:', error);
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
          api.handleError('删除小节失败:', error);
        } finally {
          setIsLoading(false);
        }
      },
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
    const defaultType = selectedCourse?.format === '视频课程' ? 'video' : 'conversation';
    setSectionType(defaultType);
    sectionForm.setFieldsValue({ contentType: defaultType });
    setShowAddSectionModal(true);
  };

  // 处理编辑小节
  const openEditSectionModal = (section) => {
    setEditingSection(section);
    const nextType = section.content_type || section.contentType || (section.video_url ? 'video' : 'article');
    const textbookValues = splitCommaList(section.textbook);
    const lessonValues = splitCommaList(section.lesson);
    sectionForm.setFieldsValue({
      ...section,
      videoUrl: section.videoUrl || section.video_url || '',
      contentType: nextType,
      textbookSelection: buildTextbookCascaderValue(textbookValues, lessonValues, textbooks),
    });
    setSectionType(nextType);
    setShowEditSectionModal(true);
  };

  // 树形数据转换
  const treeData = chapters.map((chapter) => ({
    title: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <span>
          {chapter.name} ({chapter.sections?.length || 0}讲)
        </span>
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
    children: chapter.sections
      ?.sort((a, b) => (a.order || 0) - (b.order || 0))
      .filter((section) => section && section.id)
      .map((section) => ({
        title: (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <span>
              {section.order
                ? `${section.order.toString().padStart(2, '0')} | `
                : ''}
              {section.name}
            </span>
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
        key: `section-${chapter.id}-${section.id}`,
      })),
  }));

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      key: 'id',
      width: 80,
      render: (row) => <span className="text-gray-600">{row.id}</span>,
    },
    {
      title: '课程名称',
      key: 'name',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      title: '课程形式',
      key: 'format',
      render: (row) => <span>{row.format}</span>,
    },
    {
      title: '课程定价',
      key: 'price',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${Number(row.price) === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
        >
          {Number(row.price) === 0 ? '免费' : `¥${Number(row.price).toFixed(2)}`}
        </span>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === '上架' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {row.status}
        </span>
      ),
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
          {row.format !== '1V1辅导' && (
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
          )}
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
      cellClassName: 'text-sm',
    },
  ];

  const renderAnnotatedTemplateHelp = () => (
    <div className="mt-2 text-xs text-gray-500 leading-5">
      <div>模板：短词注音用 <span className="font-mono">今日[きょう]</span>，长句或包含数字时用 <span className="font-mono">{'{'}台風７号|たいふうななごう{'}'}</span>，重点文本用 <span className="font-mono">**重点**</span>。</div>
      <div>示例：<span className="font-mono">{'{'}台風７号|たいふうななごう{'}'}は、**沖縄[おきなわ]**の南へ進んでいます。</span></div>
    </div>
  );

  const renderSectionFormFields = (editorKey) => (
    <>
      <Form.Item
        name="name"
        label="小节名称"
        rules={[{ required: true, message: '请输入小节名称' }]}
      >
        <Input placeholder="请输入小节名称" />
      </Form.Item>

      {isTextCourse && (
        <>
          <Form.Item name="textbookSelection" label="关联教材">
            <Cascader
              options={sectionCascaderOptions}
              placeholder="请选择教材和课程（可选）"
              multiple
              changeOnSelect
              displayRender={formatTextbookCascaderDisplay}
              style={{ width: '100%' }}
              onChange={(values = []) => {
                sectionForm.setFieldsValue({ textbookSelection: values });
                const hasSelection = Array.isArray(values) && values.length > 0;
                if (!hasSelection && ['vocabulary', 'grammar'].includes(sectionType)) {
                  setSectionType('conversation');
                  sectionForm.setFieldsValue({ contentType: 'conversation' });
                }
              }}
            />
          </Form.Item>

          <Form.Item label="小节类型" name="contentType">
            <Radio.Group
              value={sectionType}
              optionType="button"
              buttonStyle="solid"
              options={getSectionTypeOptions()}
              onChange={(e) => {
                setSectionType(e.target.value);
                sectionForm.setFieldsValue({ contentType: e.target.value });
              }}
            />
          </Form.Item>
        </>
      )}

      {isVideoCourse && (
        <Form.Item
          name="videoUrl"
          label="视频链接"
          rules={[{ required: true, message: '请输入视频链接' }]}
        >
          <Input placeholder="请输入视频链接" />
        </Form.Item>
      )}

      {isTextCourse && ['conversation', 'reading'].includes(sectionType) && (
        <Form.Item
          name="content"
          label="小节内容"
          rules={[{ required: true, message: '请输入小节内容' }]}
        >
          <Input.TextArea
            rows={8}
            placeholder={'渡辺[わたなべ]：難しいね。\\n木山[きやま]：**そうなんだよ。**'}
          />
        </Form.Item>
      )}
      {isTextCourse && ['conversation', 'reading'].includes(sectionType) && renderAnnotatedTemplateHelp()}

      {isTextCourse && sectionType === 'article' && (
        <Form.Item
          name="content"
          label="小节内容"
          rules={[{ required: true, message: '请输入小节内容' }]}
        >
          <div>
            <WangEditor
              key={editorKey}
              placeholder="请输入文章内容"
              style={{ height: '300px' }}
              value={sectionForm.getFieldValue('content') || ''}
              onChange={(value) =>
                sectionForm.setFieldsValue({ content: value })
              }
            />
          </div>
        </Form.Item>
      )}

      {isTextCourse && ['vocabulary', 'grammar'].includes(sectionType) && (
        <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          该类型不需要填写小节内容，前台会根据关联教材自动展示对应的{sectionType === 'vocabulary' ? '词汇' : '语法'}。
        </div>
      )}

      <Form.Item
        name="order"
        label="排序"
        rules={[{ required: true, message: '请输入排序' }]}
      >
        <Input type="number" placeholder="请输入排序" />
      </Form.Item>
    </>
  );

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
                    setCurrentPage(1);
                    fetchCourseList(false, { page: 1 });
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
            onPageChange={(newPage) => {
              setCurrentPage(newPage);
              fetchCourseList(false, { page: newPage });
            }}
            onLimitChange={(newLimit) => {
              const nextPagination = getPageSizeChangeState(newLimit);
              setItemsPerPage(newLimit);
              setCurrentPage(nextPagination.page);
              fetchCourseList(false, nextPagination);
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
                {Array.isArray(courseList) &&
                  courseList
                    .filter((c) => c.format !== '1V1辅导')
                    .map((course) => (
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
              <h3 className="text-lg font-semibold mb-4">
                {courseList.find((c) => c.id === currentEditId)?.name} 的章节
              </h3>
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
          <Button
            key="cancel"
            disabled={isLoading}
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={(e) => {
              e.preventDefault();
              isEditMode ? handleSubmitEdit(e) : handleSubmitAdd(e);
            }}
            loading={isLoading}
            disabled={isLoading}
            style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
          >
            {isLoading ? '保存中...' : '保存'}
          </Button>,
        ]}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            isEditMode ? handleSubmitEdit(e) : handleSubmitAdd(e);
          }}
          className="space-y-4"
        >
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
              options={formatOptions.map((option) => ({
                value: option,
                label: option,
              }))}
              value={courseForm.format}
              onChange={(value) =>
                setCourseForm((prev) => ({ ...prev, format: value }))
              }
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

          {/* 课程定价 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              课程定价 <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              name="price"
              value={courseForm.price}
              onChange={handleFormChange}
              prefix="¥"
              placeholder="输入 0 表示免费"
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
          <Button
            key="cancel"
            disabled={isLoading}
            onClick={() => setShowDeleteConfirm(false)}
          >
            取消
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={isLoading}
            disabled={isLoading}
            onClick={confirmDelete}
          >
            {isLoading ? '删除中...' : '删除'}
          </Button>,
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
          <Button
            key="cancel"
            disabled={isLoading}
            onClick={() => setShowAddModal(false)}
          >
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            disabled={isLoading}
            onClick={form.submit}
          >
            {isLoading ? '保存中...' : '保存'}
          </Button>,
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
          <Form.Item name="description" label="章节描述">
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
          <Button
            key="cancel"
            disabled={isLoading}
            onClick={() => setShowEditModal(false)}
          >
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            disabled={isLoading}
            onClick={form.submit}
          >
            {isLoading ? '保存中...' : '保存'}
          </Button>,
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
          <Form.Item name="description" label="章节描述">
            <Input.TextArea rows={4} placeholder="请输入章节描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加小节模态框 */}
      <Modal
        title="添加小节"
        open={showAddSectionModal}
        onOk={() => sectionForm.submit()}
        onCancel={() => {
          setShowAddSectionModal(false);
          sectionForm.resetFields();
          setSectionType('conversation');
        }}
        okText={isLoading ? '保存中...' : '保存'}
        cancelText="取消"
        confirmLoading={isLoading}
        okButtonProps={{ loading: isLoading, disabled: isLoading }}
      >
        <Form form={sectionForm} layout="vertical" onFinish={handleAddSection}>
          {renderSectionFormFields(`add-section-${showAddSectionModal}`)}
        </Form>
      </Modal>

      {/* 编辑小节模态框 */}
      <Modal
        title="编辑小节"
        open={showEditSectionModal}
        onOk={() => sectionForm.submit()}
        onCancel={() => {
          setShowEditSectionModal(false);
          sectionForm.resetFields();
          setEditingSection(null);
          setSectionType('conversation');
        }}
        okText={isLoading ? '保存中...' : '保存'}
        cancelText="取消"
        confirmLoading={isLoading}
        okButtonProps={{ loading: isLoading, disabled: isLoading }}
      >
        <Form form={sectionForm} layout="vertical" onFinish={handleEditSection}>
          {renderSectionFormFields(`edit-section-${editingSection?.id || 'new'}`)}
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManager;
