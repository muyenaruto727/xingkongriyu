import React, { useState, useEffect } from 'react';
import { Input, Button, Table, Modal, Form, Select, message, Tree, Radio } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../lib/api';
import { STATUS } from '../../config/config';

const { Option } = Select;
const { TextArea } = Input;

const ChapterManager = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // 获取课程列表
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await api.getCourseList();
      console.log('Course list response:', response);
      setCourses(Array.isArray(response) ? response : (response.data?.data || []));
    } catch (error) {
      console.error('获取课程列表失败:', error);
      message.error('获取课程列表失败');
      setCourses([]); // 确保 courses 始终是一个数组
    } finally {
      setIsLoading(false);
    }
  };

  // 获取章节列表
  const fetchChapters = async (courseId) => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const response = await api.getChapterList({ courseId });
      console.log('Chapter list response:', response);
      const chapterData = Array.isArray(response) ? response : (response.data || []);
      setChapters(chapterData);
      // 展开所有节点
      const keys = chapterData.map(chapter => chapter.id.toString());
      setExpandedKeys(keys);
    } catch (error) {
      console.error('获取章节列表失败:', error);
      message.error('获取章节列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 选择课程
  const handleCourseChange = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
    fetchChapters(courseId);
  };

  // 处理章节添加
  const handleAddChapter = async (values) => {
    if (!selectedCourse) {
      message.error('请先选择课程');
      return;
    }
    setIsLoading(true);
    try {
      await api.createChapter({
        ...values,
        courseId: selectedCourse.id
      });
      message.success('章节添加成功');
      setShowAddModal(false);
      form.resetFields();
      fetchChapters(selectedCourse.id);
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
      fetchChapters(selectedCourse.id);
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
          fetchChapters(selectedCourse.id);
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
      await api.createSection({
        ...values,
        chapterId: selectedChapter.id
      });
      message.success('小节添加成功');
      setShowAddSectionModal(false);
      sectionForm.resetFields();
      setSectionType('article');
      fetchChapters(selectedCourse.id);
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
      await api.updateSection(editingSection.id, values);
      message.success('小节更新成功');
      setShowEditSectionModal(false);
      sectionForm.resetFields();
      setEditingSection(null);
      fetchChapters(selectedCourse.id);
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
          fetchChapters(selectedCourse.id);
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

  // 初始化
  useEffect(() => {
    fetchCourses();
  }, []);

  // 树形数据转换
  const treeData = chapters.map(chapter => ({
    title: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{chapter.name} ({chapter.sections?.length || 0}讲)</span>
        <div>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => openAddSectionModal(chapter)}
            style={{ marginRight: 8 }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(chapter)}
            style={{ marginRight: 8 }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteChapter(chapter.id)}
          />
        </div>
      </div>
    ),
    key: chapter.id.toString(),
    children: chapter.sections?.sort((a, b) => (a.order || 0) - (b.order || 0)).filter(section => section && section.id).map(section => ({
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{section.order ? `${section.order.toString().padStart(2, '0')} | ` : ''}{section.name}</span>
          <div>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditSectionModal(section)}
              style={{ marginRight: 8 }}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSection(section.id)}
            />
          </div>
        </div>
      ),
      key: section.id.toString()
    }))
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">章节管理</h2>
        <div className="flex space-x-4">
          <Select
            placeholder="选择课程"
            style={{ width: 200 }}
            onChange={handleCourseChange}
            value={selectedCourse?.id}
          >
            {Array.isArray(courses) && courses.map(course => (
              <Option key={course.id} value={course.id}>
                {course.name}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            disabled={!selectedCourse}
          >
            添加章节
          </Button>
        </div>
      </div>

      {selectedCourse && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">{selectedCourse.name} 的章节</h3>
          <Tree
            treeData={treeData}
            expandedKeys={expandedKeys}
            onExpand={handleExpand}
            style={{ marginBottom: 24 }}
          />
        </div>
      )}

      {/* 添加章节模态框 */}
      <Modal
        title="添加章节"
        open={showAddModal}
        onOk={form.submit}
        onCancel={() => setShowAddModal(false)}
        okText="保存"
        cancelText="取消"
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
            <TextArea rows={4} placeholder="请输入章节描述" />
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
            <TextArea rows={4} placeholder="请输入章节描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加小节模态框 */}
      <Modal
        title="添加小节"
        open={showAddSectionModal}
        onOk={sectionForm.submit}
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
              <ReactQuill 
                placeholder="请输入文章内容" 
                style={{ height: '300px' }} 
              />
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
        onOk={sectionForm.submit}
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
              <ReactQuill 
                placeholder="请输入文章内容" 
                style={{ height: '300px' }} 
              />
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

export default ChapterManager;