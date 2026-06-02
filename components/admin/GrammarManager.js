import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { message, Modal, Select, Input, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import Pagination from '../common/Pagination';
import PaginationTable from '../common/PaginationTable';

const { Dragger } = Upload;

const GrammarManager = () => {
  const [grammarList, setGrammarList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [currentDeleteId, setCurrentDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // 语法表单状态
  const [grammarForm, setGrammarForm] = useState({
    grammarPoint: '',
    level: 'N3',
    japaneseMeaning: '',
    chineseMeaning: '',
    continuation: '',
    attentionPoints: '',
    examples: [''],
    translationExercises: [''],
    referenceAnswers: ['']
  });
  
  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];

  // 加载语法数据
  const fetchGrammarList = async () => {
    setIsLoading(true);
    try {
      const params = {
        ...(searchKeyword && { search: searchKeyword }),
        ...(selectedLevel && { level: selectedLevel }),
        page: currentPage,
        limit: itemsPerPage
      };
      const response = await api.getGrammarList(params);
      // 检查响应是否为数组（直接返回的数据）或包含 data 属性的对象
      if (Array.isArray(response)) {
        setGrammarList(response);
        setTotalItems(response.length);
      } else if (response.data) {
        setGrammarList(response.data || []);
        setTotalItems(response.total || 0);
      } else {
        setGrammarList([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Failed to fetch grammar:', error);
      message.error('加载语法数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时加载语法数据
  useEffect(() => {
    fetchGrammarList();
  }, [searchKeyword, selectedLevel, currentPage, itemsPerPage]);

  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setGrammarForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理示例变化
  const handleExampleChange = (exampleIndex, value) => {
    const newExamples = [...grammarForm.examples];
    newExamples[exampleIndex] = value;
    setGrammarForm(prev => ({
      ...prev,
      examples: newExamples
    }));
  };

  // 处理翻译练习变化
  const handleExerciseChange = (exerciseIndex, value) => {
    const newExercises = [...grammarForm.translationExercises];
    newExercises[exerciseIndex] = value;
    setGrammarForm(prev => ({
      ...prev,
      translationExercises: newExercises
    }));
  };

  // 处理参考答案变化
  const handleAnswerChange = (answerIndex, value) => {
    const newAnswers = [...grammarForm.referenceAnswers];
    newAnswers[answerIndex] = value;
    setGrammarForm(prev => ({
      ...prev,
      referenceAnswers: newAnswers
    }));
  };

  // 添加示例
  const addExample = () => {
    if (grammarForm.examples.length < 5) {
      setGrammarForm(prev => ({
        ...prev,
        examples: [...prev.examples, '']
      }));
    }
  };

  // 删除示例
  const removeExample = (exampleIndex) => {
    if (grammarForm.examples.length > 1) {
      const newExamples = grammarForm.examples.filter((_, index) => index !== exampleIndex);
      setGrammarForm(prev => ({
        ...prev,
        examples: newExamples
      }));
    }
  };

  // 添加翻译练习
  const addExercise = () => {
    if (grammarForm.translationExercises.length < 5) {
      setGrammarForm(prev => ({
        ...prev,
        translationExercises: [...prev.translationExercises, ''],
        referenceAnswers: [...prev.referenceAnswers, '']
      }));
    }
  };

  // 删除翻译练习
  const removeExercise = (exerciseIndex) => {
    if (grammarForm.translationExercises.length > 1) {
      const newExercises = grammarForm.translationExercises.filter((_, index) => index !== exerciseIndex);
      const newAnswers = grammarForm.referenceAnswers.filter((_, index) => index !== exerciseIndex);
      setGrammarForm(prev => ({
        ...prev,
        translationExercises: newExercises,
        referenceAnswers: newAnswers
      }));
    }
  };

  // 处理添加语法
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!grammarForm.grammarPoint || grammarForm.grammarPoint.trim() === '') {
      message.error('请输入语法点');
      return;
    }
    if (!grammarForm.level) {
      message.error('请选择级别');
      return;
    }
    if (!grammarForm.japaneseMeaning || grammarForm.japaneseMeaning.trim() === '') {
      message.error('请输入日文释义');
      return;
    }
    if (!grammarForm.chineseMeaning || grammarForm.chineseMeaning.trim() === '') {
      message.error('请输入中文释义');
      return;
    }
    if (!grammarForm.continuation || grammarForm.continuation.trim() === '') {
      message.error('请输入接续方式');
      return;
    }
    if (grammarForm.examples.length === 0 || !grammarForm.examples[0] || grammarForm.examples[0].trim() === '') {
      message.error('请至少输入一个例句');
      return;
    }
    if (grammarForm.translationExercises.length === 0 || !grammarForm.translationExercises[0] || grammarForm.translationExercises[0].trim() === '') {
      message.error('请至少输入一个翻译练习');
      return;
    }
    if (grammarForm.referenceAnswers.length === 0 || !grammarForm.referenceAnswers[0] || grammarForm.referenceAnswers[0].trim() === '') {
      message.error('请至少输入一个参考答案');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await api.createGrammar(grammarForm);
      message.success('语法添加成功');
      setShowModal(false);
      resetForm();
      fetchGrammarList();
    } catch (error) {
      console.error('Failed to add grammar:', error);
      message.error('语法添加失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理编辑语法
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!grammarForm.grammarPoint || grammarForm.grammarPoint.trim() === '') {
      message.error('请输入语法点');
      return;
    }
    if (!grammarForm.level) {
      message.error('请选择级别');
      return;
    }
    if (!grammarForm.japaneseMeaning || grammarForm.japaneseMeaning.trim() === '') {
      message.error('请输入日文释义');
      return;
    }
    if (!grammarForm.chineseMeaning || grammarForm.chineseMeaning.trim() === '') {
      message.error('请输入中文释义');
      return;
    }
    if (!grammarForm.continuation || grammarForm.continuation.trim() === '') {
      message.error('请输入接续方式');
      return;
    }
    if (grammarForm.examples.length === 0 || !grammarForm.examples[0] || grammarForm.examples[0].trim() === '') {
      message.error('请至少输入一个例句');
      return;
    }
    if (grammarForm.translationExercises.length === 0 || !grammarForm.translationExercises[0] || grammarForm.translationExercises[0].trim() === '') {
      message.error('请至少输入一个翻译练习');
      return;
    }
    if (grammarForm.referenceAnswers.length === 0 || !grammarForm.referenceAnswers[0] || grammarForm.referenceAnswers[0].trim() === '') {
      message.error('请至少输入一个参考答案');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await api.updateGrammar(currentEditId, grammarForm);
      message.success('语法更新成功');
      setShowModal(false);
      resetForm();
      fetchGrammarList();
    } catch (error) {
      console.error('Failed to update grammar:', error);
      message.error('语法更新失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理编辑
  const handleEdit = (grammar) => {
    setCurrentEditId(grammar.id);
    setIsEditMode(true);
    setGrammarForm({
      grammarPoint: grammar.grammarPoint || '',
      level: grammar.level || 'N3',
      japaneseMeaning: grammar.japaneseMeaning || '',
      chineseMeaning: grammar.chineseMeaning || '',
      continuation: grammar.continuation || '',
      attentionPoints: grammar.attentionPoints || '',
      examples: grammar.examples || [''],
      translationExercises: grammar.translationExercises || [''],
      referenceAnswers: grammar.referenceAnswers || ['']
    });
    setShowModal(true);
  };

  // 处理删除
  const handleDelete = (id) => {
    setCurrentDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await api.deleteGrammar(currentDeleteId);
      message.success('语法删除成功');
      setShowDeleteConfirm(false);
      fetchGrammarList();
    } catch (error) {
      console.error('Failed to delete grammar:', error);
      message.error('语法删除失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setGrammarForm({
      grammarPoint: '',
      level: 'N3',
      japaneseMeaning: '',
      chineseMeaning: '',
      continuation: '',
      attentionPoints: '',
      examples: [''],
      translationExercises: [''],
      referenceAnswers: ['']
    });
    setCurrentEditId(null);
  };

  // 批量导入
  const handleBatchImport = async (file) => {
    setIsLoading(true);
    message.info('开始处理文件...');
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          message.info('解析文件中...');
          const content = event.target.result;
          let data;

          // 解析文件内容
          if (file.name.endsWith('.json')) {
            data = JSON.parse(content);
          } else {
            message.error('不支持的文件格式');
            setIsLoading(false);
            return;
          }

          // 验证数据格式
          if (!Array.isArray(data)) {
            message.error('文件内容格式错误');
            setIsLoading(false);
            return;
          }

          // 过滤无效数据
          message.info(`验证数据格式，共 ${data.length} 条数据...`);
          const filteredData = data.filter(item => {
            return item.grammarPoint && item.level && item.japaneseMeaning && item.chineseMeaning && item.continuation;
          });

          if (filteredData.length === 0) {
            message.error('文件中没有有效的语法数据');
            setIsLoading(false);
            return;
          }

          // 与数据库中已有的语法进行去重
          try {
            message.info('与数据库中已有的语法进行去重...');
            const existingGrammar = await api.getGrammarList({ limit: 10000 });
            const existingKeys = new Set();
            
            if (Array.isArray(existingGrammar)) {
              existingGrammar.forEach(grammar => {
                if (grammar.grammarPoint && grammar.level) {
                  const key = `${grammar.grammarPoint}-${grammar.level}`;
                  existingKeys.add(key);
                }
              });
            } else if (existingGrammar.data) {
              existingGrammar.data.forEach(grammar => {
                if (grammar.grammarPoint && grammar.level) {
                  const key = `${grammar.grammarPoint}-${grammar.level}`;
                  existingKeys.add(key);
                }
              });
            }

            // 过滤掉与数据库中重复的语法
            const uniqueData = filteredData.filter(item => {
              const key = `${item.grammarPoint}-${item.level}`;
              return !existingKeys.has(key);
            });

            if (uniqueData.length === 0) {
              message.info('所有数据都已存在，没有新数据可导入');
              setIsLoading(false);
              return;
            } 

            // 发送批量导入请求
            message.info(`正在导入 ${uniqueData.length} 条新数据...`);
            await api.importGrammar({ batch: uniqueData });

            if (uniqueData.length < filteredData.length) {
              message.success(`已过滤掉 ${filteredData.length - uniqueData.length} 条重复数据，成功导入 ${uniqueData.length} 条新数据`);
            } else {
              message.success(`成功导入 ${uniqueData.length} 条新数据`);
            }
          } catch (error) {
            console.error('去重失败:', error);
            // 如果去重失败，仍然尝试导入数据
            message.info(`直接导入 ${filteredData.length} 条数据...`);
            await api.importGrammar({ batch: filteredData });
            message.success(`成功导入 ${filteredData.length} 条数据`);
          }

          message.info('刷新语法列表...');
          await fetchGrammarList();
        } catch (error) {
          console.error('文件解析失败:', error);
          message.error('文件解析失败');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('批量导入失败:', error);
      message.error('批量导入失败');
      setIsLoading(false);
    }
  };

  // 下载语法模板（JSON 格式）
  const downloadGrammarTemplate = () => {
    const template = [
      {
        "grammarPoint": "~ている",
        "level": "N5",
        "japaneseMeaning": "現在進行中の動作を表す",
        "chineseMeaning": "表示正在进行的动作",
        "continuation": "動詞のて形 + いる",
        "attentionPoints": "状態を表す動詞と一緒に使うこともできる",
        "examples": ["私は日本語を勉強しています。", "彼はテレビを見ています。"],
        "translationExercises": ["我正在学习日语。", "他正在看电视。"],
        "referenceAnswers": ["私は日本語を勉強しています。", "彼はテレビを見ています。"]
      },
      {
        "grammarPoint": "~たい",
        "level": "N5",
        "japaneseMeaning": "希望や欲求を表す",
        "chineseMeaning": "表示希望或欲望",
        "continuation": "動詞の辞書形 + たい",
        "attentionPoints": "第一人称でしか使えない",
        "examples": ["私は日本に行きたいです。", "彼女は寿司を食べたいです。"],
        "translationExercises": ["我想去日本。", "她想吃寿司。"],
        "referenceAnswers": ["私は日本に行きたいです。", "彼女は寿司を食べたいです。"]
      }
    ];

    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `grammar_template_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    message.success('模板下载成功');
  };

  // 批量下载
  const handleBatchDownload = async () => {
    setIsLoading(true);
    try {
      // 获取用户选择的下载选项
      const downloadOption = document.querySelector('input[name="grammar-download-option"]:checked')?.value || 'all';

      if (downloadOption === 'paginated') {
        // 分页下载逻辑
        await handlePaginatedDownload();
        return;
      }

      // 构建查询参数
      const params = {
        page: 1,
        limit: 10000 // 限制最大下载量
      };

      // 如果选择的是当前筛选条件的数据，则添加筛选参数
      if (downloadOption === 'filtered') {
        if (searchKeyword) {
          params.search = searchKeyword;
        }
        if (selectedLevel) {
          params.level = selectedLevel;
        }
      } else if (downloadOption === 'all') {
        // 下载所有数据，不添加筛选参数
      }

      // 发送请求获取语法数据
      const response = await api.exportGrammar(params);
      const grammarData = Array.isArray(response) ? response : (response.data || []);

      // 转换为 JSON 字符串
      const content = JSON.stringify(grammarData, null, 2);
      const mimeType = 'application/json';
      const fileName = `grammar_${new Date().toISOString().split('T')[0]}.json`;

      // 创建下载链接
      const blob = new Blob([content], { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      message.success('批量下载成功');
      setShowDownloadModal(false);
    } catch (error) {
      console.error('批量下载失败:', error);
      message.error('批量下载失败');
      setShowDownloadModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 分页下载处理
  const handlePaginatedDownload = async () => {
    try {
      // 获取用户自定义的每页大小和页码
      const pageSize = parseInt(document.getElementById('grammar-page-size')?.value || '1000', 10);
      const pageNumber = parseInt(document.getElementById('grammar-page-number')?.value || '1', 10);

      // 构建查询参数
      const params = {
        page: pageNumber,
        limit: pageSize
      };

      // 添加筛选参数
      if (searchKeyword) {
        params.search = searchKeyword;
      }
      if (selectedLevel) {
        params.level = selectedLevel;
      }

      // 获取指定页码的数据
      message.info(`开始下载第 ${pageNumber} 页，每页 ${pageSize} 条数据`);
      const pageData = await api.exportGrammar(params);
      const grammarData = Array.isArray(pageData) ? pageData : (pageData.data || []);
      const totalItems = pageData.total || 0;
      const totalPages = Math.ceil(totalItems / pageSize);

      // 转换为 JSON 字符串
      const content = JSON.stringify(grammarData, null, 2);
      const mimeType = 'application/json';
      const fileName = `grammar_${new Date().toISOString().split('T')[0]}_page_${pageNumber}_size_${pageSize}.json`;

      // 创建下载链接
      const blob = new Blob([content], { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      message.success(`分页下载成功，共下载 ${grammarData.length} 条数据（第 ${pageNumber}/${totalPages} 页）`);
      setShowDownloadModal(false);
    } catch (error) {
      console.error('分页下载失败:', error);
      message.error('分页下载失败');
      setShowDownloadModal(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* 添加按钮 */}
      <div className="flex items-center justify-end mb-6 gap-4">
        <button 
          onClick={() => {
            resetForm();
            setIsEditMode(false);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加语法
        </button>
        <button 
          onClick={() => {
            setShowImportModal(true);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-dark hover:bg-gray-50 transition-colors"
        >
          批量导入
        </button>
        <button 
          onClick={() => {
            setShowDownloadModal(true);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-dark hover:bg-gray-50 transition-colors"
        >
          批量下载
        </button>

      </div>

      {/* 筛选和搜索 */}
      <div className="mb-6 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">级别</label>
            <Select
              options={levels.map(level => ({ value: level, label: level }))}
              value={selectedLevel}
              onChange={(value) => setSelectedLevel(value)}
              placeholder="全部级别"
              style={{ width: '100%' }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark mb-2">搜索</label>
            <Input 
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索语法点..."
              className="px-4 py-3"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => {
              setSearchKeyword('');
              setSelectedLevel('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            重置
          </button>
          <button 
            onClick={fetchGrammarList}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </div>
      </div>

      {/* 语法列表 */}
      <PaginationTable
        data={grammarList}
        columns={[
          {
            title: 'ID',
            key: 'id',
            cellClassName: 'text-dark'
          },
          {
            title: '语法点',
            key: 'grammarPoint',
            cellClassName: 'text-dark'
          },
          {
            title: '级别',
            key: 'level',
            cellClassName: 'text-dark'
          },
          {
            title: '操作',
            render: (row) => (
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleEdit(row)}
                  className="text-primary hover:text-blue-700"
                >
                  编辑
                </button>
                <button 
                  onClick={() => handleDelete(row.id)}
                  className="text-red-600 hover:text-red-700"
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
        onLimitChange={setItemsPerPage}
        emptyMessage="暂无语法数据"
        emptyIcon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />

      {/* 添加/编辑语法模态框 */}
      <Modal
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditMode ? '编辑语法' : '添加语法'}
        width={900}
        onOk={isEditMode ? handleSubmitEdit : handleSubmitAdd}
        okText="保存"
        cancelText="取消"
      >
        <form onSubmit={isEditMode ? handleSubmitEdit : handleSubmitAdd} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark mb-2">语法点 <span className="text-red-500">*</span></label>
            <Input 
              type="text" 
              name="grammarPoint" 
              value={grammarForm.grammarPoint} 
              onChange={handleFormChange}
              placeholder="请输入语法点"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark mb-2">级别 <span className="text-red-500">*</span></label>
            <Select
              options={levels.map(level => ({ value: level, label: level }))}
              value={grammarForm.level}
              onChange={(value) => setGrammarForm(prev => ({ ...prev, level: value }))}
              style={{ width: '100%' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">日文释义 <span className="text-red-500">*</span></label>
              <Input.TextArea 
                value={grammarForm.japaneseMeaning}
                onChange={(e) => setGrammarForm(prev => ({ ...prev, japaneseMeaning: e.target.value }))}
                placeholder="请输入日文释义"
                rows={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">中文释义 <span className="text-red-500">*</span></label>
              <Input.TextArea 
                value={grammarForm.chineseMeaning}
                onChange={(e) => setGrammarForm(prev => ({ ...prev, chineseMeaning: e.target.value }))}
                placeholder="请输入中文释义"
                rows={6}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-dark mb-2">接续方式 <span className="text-red-500">*</span></label>
            <Input 
                type="text" 
                value={grammarForm.continuation}
                onChange={(e) => setGrammarForm(prev => ({ ...prev, continuation: e.target.value }))}
                placeholder="请输入接续方式"
              />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-dark mb-2">注意事项</label>
            <Input.TextArea 
                value={grammarForm.attentionPoints}
                onChange={(e) => setGrammarForm(prev => ({ ...prev, attentionPoints: e.target.value }))}
                placeholder="请输入注意事项"
                rows={6}
              />
          </div>

          {/* 例句 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-dark mb-3">例句（最多 5 句） <span className="text-red-500">*</span></label>
            {grammarForm.examples.map((example, exampleIndex) => (
              <div key={exampleIndex} className="flex gap-2 mb-3">
                <Input 
                  type="text" 
                  value={example}
                  onChange={(e) => handleExampleChange(exampleIndex, e.target.value)}
                  className="flex-1 px-4 py-3"
                  placeholder={`例句 ${exampleIndex + 1}`}
                />
                {grammarForm.examples.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeExample(exampleIndex)}
                    className="text-red-600 hover:text-red-700 p-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {grammarForm.examples.length < 5 && (
              <button 
                type="button" 
                onClick={addExample}
                className="text-primary hover:text-primary/80 text-sm px-4 py-2 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加例句
              </button>
            )}
          </div>

          {/* 翻译练习 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-dark mb-3">翻译练习（最多 5 组） <span className="text-red-500">*</span></label>
            {grammarForm.translationExercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="mb-4">
                <div className="flex gap-2 mb-3">
                  <Input 
                    type="text" 
                    value={exercise}
                    onChange={(e) => handleExerciseChange(exerciseIndex, e.target.value)}
                    className="flex-1 px-4 py-3"
                    placeholder={`翻译练习 ${exerciseIndex + 1}`}
                  />
                  {grammarForm.translationExercises.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeExercise(exerciseIndex)}
                      className="text-red-600 hover:text-red-700 p-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div>
                  <Input 
                    type="text" 
                    value={grammarForm.referenceAnswers[exerciseIndex]}
                    onChange={(e) => handleAnswerChange(exerciseIndex, e.target.value)}
                    className="flex-1 px-4 py-3"
                    placeholder={`参考答案 ${exerciseIndex + 1}`}
                  />
                </div>
              </div>
            ))}
            {grammarForm.translationExercises.length < 5 && (
              <button 
                type="button" 
                onClick={addExercise}
                className="text-primary hover:text-primary/80 text-sm px-4 py-2 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加翻译练习
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        title="确认删除"
        onOk={confirmDelete}
        okText={isLoading ? '删除中...' : '删除'}
        cancelText="取消"
        okButtonProps={{ danger: true, loading: isLoading }}
      >
        <p className="text-gray-700">确定要删除这个语法吗？此操作不可撤销。</p>
      </Modal>

      {/* 批量导入模态框 */}
      <Modal
        open={showImportModal}
        onCancel={() => setShowImportModal(false)}
        title="批量导入语法"
        footer={null}
        width={600}
      >
        <div className="mb-6">
          <h4 className="text-lg font-medium text-dark mb-4">下载模板</h4>
          <button 
            onClick={downloadGrammarTemplate}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            下载 JSON 模板
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-medium text-dark mb-4">上传文件</h4>
          <Dragger
            name="file"
            multiple={false}
            accept=".json"
            beforeUpload={(file) => {
              handleBatchImport(file);
              return false; // 阻止自动上传
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个 JSON 文件上传
            </p>
          </Dragger>
        </div>
      </Modal>

      {/* 批量下载模态框 */}
      <Modal
        open={showDownloadModal}
        onCancel={() => setShowDownloadModal(false)}
        title="批量下载语法"
        onOk={handleBatchDownload}
        okText="下载"
        okButtonProps={{ loading: isLoading }}
        width={600}
      >
        <div className="mb-6">
          <h4 className="text-lg font-medium text-dark mb-4">下载选项</h4>
          <p className="text-gray-600 mb-4">请选择下载方式：</p>
          <div className="space-y-4">
            <div className="flex items-center">
              <input 
                type="radio" 
                id="grammar-download-all" 
                name="grammar-download-option" 
                value="all" 
                defaultChecked
                onChange={(e) => {
                  const paginatedOptions = document.getElementById('grammar-paginated-options');
                  if (paginatedOptions) {
                    paginatedOptions.style.display = e.target.value === 'paginated' ? 'block' : 'none';
                  }
                }}
              />
              <label htmlFor="grammar-download-all" className="ml-2 text-gray-700">
                下载所有数据（最多 10,000 条）
              </label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="grammar-download-filtered" 
                name="grammar-download-option" 
                value="filtered"
                onChange={(e) => {
                  const paginatedOptions = document.getElementById('grammar-paginated-options');
                  if (paginatedOptions) {
                    paginatedOptions.style.display = e.target.value === 'paginated' ? 'block' : 'none';
                  }
                }}
              />
              <label htmlFor="grammar-download-filtered" className="ml-2 text-gray-700">
                下载当前筛选条件的数据
              </label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="grammar-download-paginated" 
                name="grammar-download-option" 
                value="paginated"
                onChange={(e) => {
                  const paginatedOptions = document.getElementById('grammar-paginated-options');
                  if (paginatedOptions) {
                    paginatedOptions.style.display = e.target.value === 'paginated' ? 'block' : 'none';
                  }
                }}
              />
              <label htmlFor="grammar-download-paginated" className="ml-2 text-gray-700">
                分页下载（适合大量数据）
              </label>
            </div>
            <div className="ml-8 space-y-4" id="grammar-paginated-options" style={{ display: 'none' }}>
              <div>
                <label htmlFor="grammar-page-size" className="block text-sm font-medium text-gray-700 mb-1">
                  每页大小
                </label>
                <input 
                  type="number" 
                  id="grammar-page-size" 
                  min="1" 
                  max="5000" 
                  defaultValue="1000" 
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="grammar-page-number" className="block text-sm font-medium text-gray-700 mb-1">
                  下载页码
                </label>
                <input 
                  type="number" 
                  id="grammar-page-number" 
                  min="1" 
                  defaultValue="1" 
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                提示：如果数据量较大，建议使用分页下载方式，避免浏览器卡顿。
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GrammarManager;
