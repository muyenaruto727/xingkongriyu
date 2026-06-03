import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ARTICLE_LEVELS, ARTICLE_CATEGORIES } from '../../config/config';
import { handleApiError, logError } from '../../utils.js';
import { Modal, Input, Select } from 'antd';
import Pagination from '../common/Pagination';

const ArticleManager = ({ showToast }) => {
  const [articleList, setArticleList] = useState([]);
  const [showAddArticleDrawer, setShowAddArticleDrawer] = useState(false);
  const [showEditArticleModal, setShowEditArticleModal] = useState(false);
  const [showDeleteArticleConfirm, setShowDeleteArticleConfirm] = useState(false);
  const [currentEditArticleId, setCurrentEditArticleId] = useState(null);
  const [currentDeleteArticleId, setCurrentDeleteArticleId] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    level: '',
    category: ''
  });
  const [articlePage, setArticlePage] = useState(1);
  const [articlesPerPage, setArticlesPerPage] = useState(10);

  useEffect(() => {
    fetchArticleList();
  }, []);

  const fetchArticleList = async () => {
    try {
      const articleData = await api.getArticleList();
      setArticleList(articleData.data);
    } catch (error) {
      logError(error, 'Fetch Article List');
      handleApiError(error, showToast);
    }
  };

  const handleArticleFormChange = (e) => {
    const { name, value } = e.target;
    setArticleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAddArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title || articleForm.title.trim() === '') {
      showToast('请填写标题', 'warning');
      return;
    }
    if (!articleForm.content || articleForm.content.trim() === '') {
      showToast('请填写内容', 'warning');
      return;
    }
    if (!articleForm.level) {
      showToast('请选择级别', 'warning');
      return;
    }
    if (!articleForm.category) {
      showToast('请选择教材分类', 'warning');
      return;
    }

    try {
      const newArticle = await api.createArticle(articleForm);
      const updatedArticles = [...articleList, newArticle];
      setArticleList(updatedArticles);
      setArticleForm({ title: '', content: '', level: '', category: '' });
      setShowAddArticleDrawer(false);
      showToast('文章添加成功', 'success');
    } catch (error) {
      console.error('Failed to create article:', error);
      showToast('创建失败', 'error');
    }
  };

  const handleEditArticle = (article) => {
    setCurrentEditArticleId(article.id);
    setArticleForm({
      title: article.title,
      content: article.content,
      level: article.level,
      category: article.category
    });
    setShowEditArticleModal(true);
  };

  const handleSubmitEditArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title || articleForm.title.trim() === '') {
      showToast('请填写标题', 'warning');
      return;
    }
    if (!articleForm.content || articleForm.content.trim() === '') {
      showToast('请填写内容', 'warning');
      return;
    }
    if (!articleForm.level) {
      showToast('请选择级别', 'warning');
      return;
    }
    if (!articleForm.category) {
      showToast('请选择教材分类', 'warning');
      return;
    }

    try {
      const updated = await api.updateArticle(currentEditArticleId, articleForm);
      const updatedArticles = articleList.map(item => 
        item.id === currentEditArticleId ? { ...item, ...updated } : item
      );
      setArticleList(updatedArticles);
      setArticleForm({ title: '', content: '', level: '', category: '' });
      setShowEditArticleModal(false);
      showToast('文章更新成功', 'success');
    } catch (error) {
      console.error('Failed to update article:', error);
      showToast('更新失败', 'error');
    }
  };

  const handleDeleteArticle = (articleId) => {
    setCurrentDeleteArticleId(articleId);
    setShowDeleteArticleConfirm(true);
  };

  const confirmDeleteArticle = async () => {
    try {
      await api.deleteArticle(currentDeleteArticleId);
      const updatedArticles = articleList.filter(article => article.id !== currentDeleteArticleId);
      setArticleList(updatedArticles);
      setShowDeleteArticleConfirm(false);
      showToast('文章删除成功', 'success');
    } catch (error) {
      console.error('Failed to delete article:', error);
      showToast('删除失败', 'error');
    }
  };

  const handleArticlesPerPageChange = (e) => {
    setArticlesPerPage(parseInt(e.target.value));
    setArticlePage(1);
  };

  const handleArticlePageChange = (page) => {
    setArticlePage(page);
  };

  // 计算分页数据
  const indexOfLastArticle = articlePage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articleList.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articleList.length / articlesPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-end mb-6">
        <button 
          className="btn-primary text-sm px-4 py-2" 
          onClick={() => setShowAddArticleDrawer(true)}
        >
          添加文章
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">级别</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">教材分类</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentArticles.map((article, index) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-dark">{index + 1 + (articlePage - 1) * articlesPerPage}</td>
                <td className="px-6 py-4 text-sm text-dark truncate" style={{ maxWidth: '200px' }} title={article.title}>{article.title}</td>
                <td className="px-6 py-4 text-sm text-muted">{article.level}</td>
                <td className="px-6 py-4 text-sm text-muted">{article.category}</td>
                <td className="px-6 py-4 text-sm text-muted">{article.created_at ? new Date(article.created_at).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-primary hover:text-blue-700 mr-3" onClick={() => handleEditArticle(article)}>编辑</button>
                  <button className="text-red-600 hover:text-red-700" onClick={() => handleDeleteArticle(article.id)}>删除</button>
                </td>
              </tr>
            ))}
            {currentArticles.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-muted">暂无文章数据</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* 分页 */}
      <Pagination 
        page={articlePage}
        limit={articlesPerPage}
        total={articleList.length}
        onPageChange={handleArticlePageChange}
        onLimitChange={handleArticlesPerPageChange}
      />

      {/* 添加文章弹窗 */}
      <Modal
        open={showAddArticleDrawer}
        onCancel={() => setShowAddArticleDrawer(false)}
        title="添加文章"
        onOk={handleSubmitAddArticle}
        okText="保存"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">标题 <span className="text-red-500">*</span></label>
            <Input 
              type="text" 
              name="title" 
              value={articleForm.title} 
              onChange={handleArticleFormChange} 
              placeholder="请输入标题"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">内容 <span className="text-red-500">*</span></label>
            <Input.TextArea 
              name="content" 
              value={articleForm.content} 
              onChange={handleArticleFormChange} 
              placeholder="请输入内容"
              rows={5}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">级别 <span className="text-red-500">*</span></label>
            <Select
              options={ARTICLE_LEVELS.map(level => ({ value: level, label: level }))}
              value={articleForm.level}
              onChange={(value) => setArticleForm(prev => ({ ...prev, level: value }))}
              placeholder="请选择级别"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">教材分类 <span className="text-red-500">*</span></label>
            <Select
              options={ARTICLE_CATEGORIES.map(category => ({ value: category, label: category }))}
              value={articleForm.category}
              onChange={(value) => setArticleForm(prev => ({ ...prev, category: value }))}
              placeholder="请选择教材分类"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>

      {/* 编辑文章弹窗 */}
      <Modal
        open={showEditArticleModal}
        onCancel={() => setShowEditArticleModal(false)}
        title="编辑文章"
        onOk={handleSubmitEditArticle}
        okText="保存"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">标题 <span className="text-red-500">*</span></label>
            <Input 
              type="text" 
              name="title" 
              value={articleForm.title} 
              onChange={handleArticleFormChange} 
              placeholder="请输入标题"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">内容 <span className="text-red-500">*</span></label>
            <Input.TextArea 
              name="content" 
              value={articleForm.content} 
              onChange={handleArticleFormChange} 
              placeholder="请输入内容"
              rows={5}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">级别 <span className="text-red-500">*</span></label>
            <Select
              options={ARTICLE_LEVELS.map(level => ({ value: level, label: level }))}
              value={articleForm.level}
              onChange={(value) => setArticleForm(prev => ({ ...prev, level: value }))}
              placeholder="请选择级别"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">教材分类 <span className="text-red-500">*</span></label>
            <Select
              options={ARTICLE_CATEGORIES.map(category => ({ value: category, label: category }))}
              value={articleForm.category}
              onChange={(value) => setArticleForm(prev => ({ ...prev, category: value }))}
              placeholder="请选择教材分类"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>

      {/* 删除文章确认弹窗 */}
      <Modal
        open={showDeleteArticleConfirm}
        onCancel={() => setShowDeleteArticleConfirm(false)}
        title="确认删除"
        onOk={confirmDeleteArticle}
        okText="确认删除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <p className="text-gray-600">您确定要删除这篇文章吗？此操作不可撤销。</p>
      </Modal>


    </div>
  );
};

export default ArticleManager;