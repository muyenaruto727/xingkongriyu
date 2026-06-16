import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Input, Select, Upload, Modal, message } from 'antd';
import QuestionList from './QuestionManager/QuestionList';
import QuestionForm from './QuestionManager/QuestionForm';
import Pagination from '../common/Pagination';
import Filter from './QuestionManager/Filter';

const { Dragger } = Upload;

const QuestionManager = ({ defaultType = '', defaultLevel = '' }) => {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [currentDeleteId, setCurrentDeleteId] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 批量导入/导出状态
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [importFileList, setImportFileList] = useState([]);
  const [downloadFormat, setDownloadFormat] = useState('json');
  const [downloadOption, setDownloadOption] = useState('all');
  const [downloadPageSize, setDownloadPageSize] = useState(1000);
  const [downloadPageNumber, setDownloadPageNumber] = useState(1);
  
  // 分页状态
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  
  // 筛选状态
  const [filterLevel, setFilterLevel] = useState(defaultLevel);
  const [filterType, setFilterType] = useState(defaultType);
  const [filterId, setFilterId] = useState('');
  
  // 题目表单
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'vocabulary',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    level: 'N3',
    is_real_exam: true,
    category: '',
    passage: '',
    audio_url: '',
    grammarPassage: '',
    questions: [
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: ''
      }
    ],
    grammarQuestions: [
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: ''
      }
    ]
  });

  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];
  const questionTypes = [
    { id: 'vocabulary', name: '文字・語彙', nameJp: 'もじ・ごい' },
    { id: 'grammar', name: '文法', nameJp: 'ぶんぽう' },
    { id: 'reading', name: '読解', nameJp: 'どっかい' },
    { id: 'listening', name: '聴解', nameJp: 'ちょうかい' }
  ];

  // 类别选项配置
  const getCategoryOptions = (type, level) => {
    const options = {
      vocabulary: [
        { value: 'kanji_reading', label: '汉字读法' },
        { value: 'kanji_writing', label: '汉字书写', disabled: level === 'N1' },
        { value: 'word_formation', label: '词语构成', disabled: ['N1', 'N3', 'N4', 'N5'].includes(level) },
        { value: 'context', label: '前后关系' },
        { value: 'synonym', label: '近义替换' },
        { value: 'usage', label: '用法', disabled: level === 'N5' }
      ],
      grammar: [
        { value: 'sentence_grammar_1', label: '句子语法1' },
        { value: 'sentence_grammar_2', label: '句子语法2' },
        { value: 'text_grammar', label: '文章语法' }
      ],
      reading: [
        { value: 'short_content', label: '内容理解（短篇）' },
        { value: 'medium_content', label: '内容理解（中篇）' },
        { value: 'long_content', label: '内容理解（长篇）', disabled: ['N2', 'N4', 'N5'].includes(level) },
        { value: 'comprehensive', label: '综合理解', disabled: ['N3', 'N4', 'N5'].includes(level) },
        { value: 'argument_long', label: '论点理解（长篇）', disabled: ['N3', 'N4', 'N5'].includes(level) },
        { value: 'information_search', label: '信息检索' }
      ],
      listening: [
        { value: 'problem_understanding', label: '问题理解' },
        { value: 'key_understanding', label: '重点理解' },
        { value: 'summary_understanding', label: '概要理解', disabled: ['N4', 'N5'].includes(level) },
        { value: 'language_expression', label: '语言表达', disabled: ['N1', 'N2'].includes(level) },
        { value: 'immediate_response', label: '及时应答' },
        { value: 'comprehensive_understanding', label: '综合理解', disabled: ['N3', 'N4', 'N5'].includes(level) }
      ]
    };
    return options[type] || [];
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, limit, filterLevel, filterType, filterId]);

  const fetchQuestions = async () => {
    try {
      const params = {
        page,
        limit,
        ...(filterLevel && { level: filterLevel }),
        ...(filterType && { type: filterType }),
        ...(filterId && { id: filterId })
      };
      const data = await api.getQuestionList(params);
      setQuestions(data.data);
      setTotal(data.total || 0);
    } catch (error) {
      api.handleError('Failed to fetch questions:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm(prev => ({
      ...prev,
      [name]: value,
      // 题型改变时重置类别
      ...(name === 'question_type' ? { category: '' } : {})
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      let submitData = questionForm;
      if (questionForm.question_type === 'grammar' && questionForm.category === 'text_grammar') {
        submitData = {
          ...questionForm,
          questions: questionForm.grammarQuestions
        };
      }
      await api.createQuestion(submitData);
      setShowModal(false);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      resetForm();
      fetchQuestions();
    } catch (error) {
      api.handleError('Failed to create question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      let submitData = questionForm;
      if (questionForm.question_type === 'grammar' && questionForm.category === 'text_grammar') {
        submitData = {
          ...questionForm,
          questions: questionForm.grammarQuestions
        };
      }
      await api.updateQuestion(currentEditId, submitData);
      setShowModal(false);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      resetForm();
      fetchQuestions();
    } catch (error) {
      api.handleError('Failed to update question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (question) => {
    setCurrentEditId(question.id);
    
    // 对于文法-文章语法题，需要从 questions 列表中查找所有相关的题目组
    let grammarQuestions = [
      {
        question_text: question.question_text || '',
        options: question.options || ['', '', '', ''],
        correct_answer: question.correct_answer || 0,
        explanation: question.explanation || ''
      }
    ];
    
    // 对于读解题，需要从 questions 列表中查找所有相关的题目组
    let readingQuestions = [
      {
        question_text: question.question_text || '',
        options: question.options || ['', '', '', ''],
        correct_answer: question.correct_answer || 0,
        explanation: question.explanation || ''
      }
    ];
    
    // 如果是文法-文章语法题，根据 passage 字段查找所有相关的题目
    if (question.question_type === 'grammar' && question.category === 'text_grammar' && question.passage) {
      const relatedQuestions = questions.filter(q => 
        q.question_type === 'grammar' && 
        q.category === 'text_grammar' && 
        q.passage === question.passage
      );
      
      if (relatedQuestions.length > 0) {
        // 按 id 升序排序，确保题目顺序正确
        const sortedQuestions = relatedQuestions.sort((a, b) => a.id - b.id);
        grammarQuestions = sortedQuestions.map(q => ({
          question_text: q.question_text || '',
          options: q.options || ['', '', '', ''],
          correct_answer: q.correct_answer || 0,
          explanation: q.explanation || ''
        }));
      }
    }
    
    // 如果是读解题，根据 passage 字段查找所有相关的题目
    if (question.question_type === 'reading' && question.passage) {
      const relatedQuestions = questions.filter(q => 
        q.question_type === 'reading' && 
        q.passage === question.passage
      );
      
      if (relatedQuestions.length > 0) {
        // 按 id 升序排序，确保题目顺序正确
        const sortedQuestions = relatedQuestions.sort((a, b) => a.id - b.id);
        readingQuestions = sortedQuestions.map(q => ({
          question_text: q.question_text || '',
          options: q.options || ['', '', '', ''],
          correct_answer: q.correct_answer || 0,
          explanation: q.explanation || ''
        }));
      }
    }
    
    setQuestionForm({
      question_text: question.question_text || '',
      question_type: question.question_type || 'vocabulary',
      options: question.options || ['', '', '', ''],
      correct_answer: question.correct_answer || 0,
      explanation: question.explanation || '',
      level: question.level || 'N3',
      is_real_exam: question.is_real_exam !== undefined ? question.is_real_exam : true,
      category: question.category || '',
      passage: question.passage || '',
      audio_url: question.audio_url || '',
      grammarPassage: question.passage || '',
      grammarQuestions: grammarQuestions,
      questions: readingQuestions
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setCurrentDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await api.deleteQuestion(currentDeleteId);
      setShowDeleteConfirm(false);
      fetchQuestions();
    } catch (error) {
      api.handleError('Failed to delete question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setQuestionForm({
      question_text: '',
      question_type: 'vocabulary',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      level: 'N3',
      is_real_exam: true,
      category: '',
      passage: '',
      audio_url: '',
      questions: [
        {
          question_text: '',
          options: ['', '', '', ''],
          correct_answer: 0,
          explanation: ''
        }
      ],
      grammarQuestions: [
        {
          question_text: '',
          options: ['', '', '', ''],
          correct_answer: 0,
          explanation: ''
        }
      ]
    });
    setCurrentEditId(null);
  };

  // 显示Toast通知
  const showToast = (msg, type = 'info') => {
    message[type](msg);
  };

  // 下载题目模板（JSON格式）
  const downloadQuestionTemplateJSON = () => {
    const templateData = [
      {
        "question_text": "测试题目",
        "question_type": "vocabulary",
        "options": ["选项1", "选项2", "选项3", "选项4"],
        "correct_answer": 0,
        "explanation": "题目解析",
        "level": "N3",
        "is_real_exam": true,
        "category": "context"
      },
      {
        "question_text": "另一个测试题目",
        "question_type": "grammar",
        "options": ["选项A", "选项B", "选项C", "选项D"],
        "correct_answer": 1,
        "explanation": "语法题解析",
        "level": "N2",
        "is_real_exam": true,
        "category": "sentence_grammar_1"
      }
    ];

    const content = JSON.stringify(templateData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `question_template_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    showToast('模板下载成功', 'success');
  };

  // 批量导入
  const handleBatchImport = async (file) => {
    setIsLoading(true);
    showToast('开始处理文件...', 'info');
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          showToast('解析文件中...', 'info');
          const jsonData = JSON.parse(e.target.result);
          if (!Array.isArray(jsonData)) {
            showToast('JSON文件格式错误，应为数组格式', 'error');
            setIsLoading(false);
            return;
          }

          // 验证数据格式
          showToast(`验证数据格式，共 ${jsonData.length} 条数据...`, 'info');
          const filteredData = jsonData.filter(item => {
            return item.question_text && item.question_type && item.options && Array.isArray(item.options) && item.options.length >= 2 && item.correct_answer !== undefined;
          });

          if (filteredData.length === 0) {
            showToast('没有有效的题目数据', 'error');
            setIsLoading(false);
            return;
          }

          // 与数据库中已有的题目进行去重
          try {
            showToast('与数据库中已有的题目进行去重...', 'info');
            const existingQuestions = await api.getQuestionList({ limit: 10000 });
            const existingKeys = new Set();
            
            if (existingQuestions.data) {
              existingQuestions.data.forEach(question => {
                if (question.question_text && question.question_type) {
                  const key = `${question.question_text}-${question.question_type}`;
                  existingKeys.add(key);
                }
              });
            }

            // 过滤掉与数据库中重复的题目
            const uniqueData = filteredData.filter(item => {
              const key = `${item.question_text}-${item.question_type}`;
              return !existingKeys.has(key);
            });

            if (uniqueData.length === 0) {
              showToast('所有数据都已存在，没有新数据可导入', 'info');
              setIsLoading(false);
              return;
            } 

            // 发送批量导入请求
            showToast(`正在导入 ${uniqueData.length} 条新数据...`, 'info');
            await api.importQuestions({ batch: uniqueData });

            if (uniqueData.length < filteredData.length) {
              showToast(`已过滤掉 ${filteredData.length - uniqueData.length} 条重复数据，成功导入 ${uniqueData.length} 条新数据`, 'success');
            } else {
              showToast(`成功导入 ${uniqueData.length} 条新数据`, 'success');
            }
          } catch (error) {
            api.handleError('去重失败:', error);
            // 如果去重失败，仍然尝试导入数据
            showToast(`直接导入 ${filteredData.length} 条数据...`, 'info');
            await api.importQuestions({ batch: filteredData });
            showToast(`成功导入 ${filteredData.length} 条数据`, 'success');
          }

          showToast('刷新题目列表...', 'info');
          await fetchQuestions();
          setShowImportModal(false);
          setImportFileList([]);
        } catch (error) {
          showToast('JSON文件解析失败', 'error');
          api.handleError('解析JSON失败:', error);
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        showToast('文件读取失败', 'error');
        setIsLoading(false);
      };
      reader.readAsText(file);
    } catch (error) {
      api.handleError('批量导入失败:', error);
      showToast('批量导入失败', 'error');
      setIsLoading(false);
    }
  };

  // 批量下载
  const handleBatchDownload = async () => {
    setIsLoading(true);
    try {
      if (downloadOption === 'all') {
        // 下载所有数据
        const allData = await api.exportQuestions({ export: true });
        const questionsData = Array.isArray(allData) ? allData : (allData.data || []);

        // 转换为JSON字符串
        const content = JSON.stringify(questionsData, null, 2);
        const mimeType = 'application/json';
        const fileName = `questions_${new Date().toISOString().split('T')[0]}_all.json`;

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

        showToast('批量下载成功', 'success');
      } else if (downloadOption === 'paginated') {
        // 分页下载
        const pageSize = parseInt(downloadPageSize, 10);
        const pageNumber = parseInt(downloadPageNumber, 10);

        // 构建查询参数
        const params = {
          page: pageNumber,
          limit: pageSize,
          ...(filterLevel && { level: filterLevel }),
          ...(filterType && { type: filterType })
        };

        // 获取指定页码的数据
        showToast(`开始下载第 ${pageNumber} 页，每页 ${pageSize} 条数据`, 'info');
        const pageData = await api.getQuestionList(params);
        const questionsData = pageData.data || [];
        const totalItems = pageData.total || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        // 转换为JSON字符串
        const content = JSON.stringify(questionsData, null, 2);
        const mimeType = 'application/json';
        const fileName = `questions_${new Date().toISOString().split('T')[0]}_page_${pageNumber}_size_${pageSize}.json`;

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

        showToast(`分页下载成功，共下载 ${questionsData.length} 条数据（第 ${pageNumber}/${totalPages} 页）`, 'success');
      }
      setShowDownloadModal(false);
    } catch (error) {
      api.handleError('批量下载失败:', error);
      showToast('批量下载失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* 成功提示 */}
      {showSuccessAlert && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          操作成功！
        </div>
      )}

      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-dark">题库管理</h3>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              resetForm();
              setIsEditMode(false);
              setShowModal(true);
            }}
            className="btn-primary text-sm px-4 py-2"
          >
            添加题目
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
      </div>

      {/* 筛选 */}
      <Filter
        level={filterLevel}
        type={filterType}
        id={filterId}
        onLevelChange={setFilterLevel}
        onTypeChange={setFilterType}
        onIdChange={setFilterId}
        onSearch={fetchQuestions}
        onReset={() => {
          setFilterLevel('');
          setFilterType('');
          setFilterId('');
          setPage(1);
        }}
      />

      {/* 题目列表 */}
      <QuestionList
        questions={questions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 分页 */}
      <Pagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />







      {/* 题目模态框 */}
      <Modal
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditMode ? '编辑题目' : '添加题目'}
        width={900}
        onOk={isEditMode ? handleSubmitEdit : handleSubmitAdd}
        okText={isLoading ? '保存中...' : '保存'}
        cancelText="取消"
        okButtonProps={{ loading: isLoading, disabled: isLoading }}
      >
        <form onSubmit={isEditMode ? handleSubmitEdit : handleSubmitAdd} className="space-y-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark mb-2">题型 <span className="text-red-500">*</span></label>
            <Select 
              name="question_type" 
              value={questionForm.question_type} 
              onChange={(value) => handleFormChange({ target: { name: 'question_type', value } })}
              style={{ width: '100%' }}
              placeholder="请选择题型"
              required
            >
              {questionTypes.map(type => (
                <Select.Option key={type.id} value={type.id}>{type.name} ({type.nameJp})</Select.Option>
              ))}
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark mb-2">级别 <span className="text-red-500">*</span></label>
            <Select 
              name="level" 
              value={questionForm.level} 
              onChange={(value) => handleFormChange({ target: { name: 'level', value } })}
              style={{ width: '100%' }}
              placeholder="请选择级别"
              required
            >
              {levels.map(level => (
                <Select.Option key={level} value={level}>{level}</Select.Option>
              ))}
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark mb-2">是否真题 <span className="text-red-500">*</span></label>
            <Select 
              name="is_real_exam" 
              value={questionForm.is_real_exam} 
              onChange={(value) => setQuestionForm(prev => ({ ...prev, is_real_exam: value }))}
              style={{ width: '100%' }}
              placeholder="请选择"
              required
            >
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark mb-2">类别 <span className="text-red-500">*</span></label>
            <Select 
              name="category" 
              value={questionForm.category} 
              onChange={(value) => handleFormChange({ target: { name: 'category', value } })}
              style={{ width: '100%' }}
              placeholder="请选择类别"
              required
            >
              <Select.Option value="">请选择类别</Select.Option>
              {getCategoryOptions(questionForm.question_type, questionForm.level).map(cat => (
                <Select.Option key={cat.value} value={cat.value} disabled={cat.disabled}>
                  {cat.label} {cat.disabled ? '(当前级别不可用)' : ''}
                </Select.Option>
              ))}
            </Select>
          </div>

          {(questionForm.question_type === 'reading') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark mb-2">阅读文章</label>
              <Input.TextArea 
                name="passage" 
                value={questionForm.passage} 
                onChange={handleFormChange}
                rows={8}
                placeholder="请输入阅读文章"
              />
            </div>
          )}

          {(questionForm.question_type === 'listening') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark mb-2">音频URL</label>
              <Input 
                name="audio_url" 
                value={questionForm.audio_url} 
                onChange={handleFormChange}
                placeholder="请输入音频文件URL"
              />
            </div>
          )}

          {(questionForm.question_type === 'grammar' && questionForm.category === 'text_grammar') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark mb-2">文章</label>
              <Input.TextArea 
                name="grammarPassage" 
                value={questionForm.grammarPassage} 
                onChange={handleFormChange}
                rows={8}
                placeholder="请输入文章"
              />
            </div>
          )}

          {(questionForm.question_type === 'reading') ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark mb-2">题目组</label>
                {questionForm.questions.map((q, qIndex) => (
                  <div key={qIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">题目 {qIndex + 1}</h4>
                      {questionForm.questions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const newQuestions = questionForm.questions.filter((_, index) => index !== qIndex);
                            setQuestionForm(prev => ({
                              ...prev,
                              questions: newQuestions
                            }));
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          删除
                        </button>
                      )}
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-dark mb-2">题目 <span className="text-red-500">*</span></label>
                        <Input.TextArea 
                          value={q.question_text} 
                          onChange={(e) => {
                            const newQuestions = [...questionForm.questions];
                            newQuestions[qIndex].question_text = e.target.value;
                            setQuestionForm(prev => ({
                              ...prev,
                              questions: newQuestions
                            }));
                          }}
                          rows={4}
                          placeholder="请输入题目"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-dark mb-2">选项 <span className="text-red-500">*</span></label>
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-500 w-8">{oIndex + 1}.</span>
                            <Input 
                              value={option} 
                              onChange={(e) => {
                                const newQuestions = [...questionForm.questions];
                                newQuestions[qIndex].options[oIndex] = e.target.value;
                                setQuestionForm(prev => ({
                                  ...prev,
                                  questions: newQuestions
                                }));
                              }}
                              style={{ flex: 1 }}
                              placeholder={`选项 ${oIndex + 1}`}
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-dark mb-2">正确答案 <span className="text-red-500">*</span></label>
                        <Select 
                          value={q.correct_answer} 
                          onChange={(value) => {
                            const newQuestions = [...questionForm.questions];
                            newQuestions[qIndex].correct_answer = value;
                            setQuestionForm(prev => ({
                              ...prev,
                              questions: newQuestions
                            }));
                          }}
                          style={{ width: '100%' }}
                          placeholder="请选择正确答案"
                          required
                        >
                          {q.options.map((option, oIndex) => (
                            <Select.Option key={oIndex} value={oIndex}>
                              {oIndex + 1}. {option || `选项 ${oIndex + 1}`}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-dark mb-2">解析</label>
                        <Input.TextArea 
                          value={q.explanation} 
                          onChange={(e) => {
                            const newQuestions = [...questionForm.questions];
                            newQuestions[qIndex].explanation = e.target.value;
                            setQuestionForm(prev => ({
                              ...prev,
                              questions: newQuestions
                            }));
                          }}
                          rows={4}
                          placeholder="请输入题目解析"
                        />
                      </div>
                  </div>
                ))}

                {questionForm.questions.length < 5 && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setQuestionForm(prev => ({
                        ...prev,
                        questions: [...prev.questions, {
                          question_text: '',
                          options: ['', '', '', ''],
                          correct_answer: 0,
                          explanation: ''
                        }]
                      }));
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    添加题目组
                  </button>
                )}
              </div>
            </>
          ) : (questionForm.question_type === 'grammar' && questionForm.category === 'text_grammar') ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark mb-2">题目组</label>
                {questionForm.grammarQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">题目 {qIndex + 1}</h4>
                      {questionForm.grammarQuestions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const newQuestions = questionForm.grammarQuestions.filter((_, index) => index !== qIndex);
                            setQuestionForm(prev => ({
                              ...prev,
                              grammarQuestions: newQuestions
                            }));
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          删除
                        </button>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-dark mb-2">选项 <span className="text-red-500">*</span></label>
                      {q.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500 w-8">{oIndex + 1}.</span>
                          <Input 
                            value={option} 
                            onChange={(e) => {
                              const newQuestions = [...questionForm.grammarQuestions];
                              newQuestions[qIndex].options[oIndex] = e.target.value;
                              setQuestionForm(prev => ({
                                ...prev,
                                grammarQuestions: newQuestions
                              }));
                            }}
                            style={{ flex: 1 }}
                            placeholder={`选项 ${oIndex + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-dark mb-2">正确答案 <span className="text-red-500">*</span></label>
                      <Select 
                        value={q.correct_answer} 
                        onChange={(value) => {
                          const newQuestions = [...questionForm.grammarQuestions];
                          newQuestions[qIndex].correct_answer = value;
                          setQuestionForm(prev => ({
                            ...prev,
                            grammarQuestions: newQuestions
                          }));
                        }}
                        style={{ width: '100%' }}
                        placeholder="请选择正确答案"
                        required
                      >
                        {q.options.map((option, oIndex) => (
                          <Select.Option key={oIndex} value={oIndex}>
                            {oIndex + 1}. {option || `选项 ${oIndex + 1}`}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-dark mb-2">解析</label>
                      <Input.TextArea 
                        value={q.explanation} 
                        onChange={(e) => {
                          const newQuestions = [...questionForm.grammarQuestions];
                          newQuestions[qIndex].explanation = e.target.value;
                          setQuestionForm(prev => ({
                            ...prev,
                            grammarQuestions: newQuestions
                          }));
                        }}
                        rows={4}
                        placeholder="请输入题目解析"
                      />
                    </div>
                  </div>
                ))}

                {questionForm.grammarQuestions.length < 10 && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setQuestionForm(prev => ({
                        ...prev,
                        grammarQuestions: [...prev.grammarQuestions, {
                          question_text: '',
                          options: ['', '', '', ''],
                          correct_answer: 0,
                          explanation: ''
                        }]
                      }));
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    添加题目组
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {questionForm.question_type !== 'listening' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-dark mb-2">题目 <span className="text-red-500">*</span></label>
                  <Input.TextArea 
                    name="question_text" 
                    value={questionForm.question_text} 
                    onChange={handleFormChange}
                    rows={5}
                    placeholder="请输入题目"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-dark mb-2">选项 <span className="text-red-500">*</span></label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                    <Input 
                      value={option} 
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      style={{ flex: 1 }}
                      placeholder={`选项 ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-dark mb-2">正确答案 <span className="text-red-500">*</span></label>
                <Select 
                  name="correct_answer" 
                  value={questionForm.correct_answer} 
                  onChange={(value) => handleFormChange({ target: { name: 'correct_answer', value } })}
                  style={{ width: '100%' }}
                  placeholder="请选择正确答案"
                  required
                >
                  {questionForm.options.map((option, index) => (
                    <Select.Option key={index} value={index}>
                      {index + 1}. {option || `选项 ${index + 1}`}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-dark mb-2">解析</label>
                <Input.TextArea 
                    name="explanation" 
                    value={questionForm.explanation} 
                    onChange={handleFormChange}
                    rows={5}
                    placeholder="请输入题目解析"
                  />
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        title="确认删除"
        onOk={confirmDelete}
        okButtonProps={{ danger: true, loading: isLoading, disabled: isLoading }}
        cancelText="取消"
      >
        <p className="text-gray-700">确定要删除这道题目吗？此操作不可撤销。</p>
      </Modal>

      {/* 批量导入模态框 */}
      <Modal
        open={showImportModal}
        onCancel={() => {
          setShowImportModal(false);
          setImportFileList([]);
        }}
        title="批量导入题目"
        footer={null}
        width={600}
      >
        <div className="mb-6">
          <h4 className="text-sm font-medium text-dark mb-3">下载模板</h4>
          <button 
            onClick={downloadQuestionTemplateJSON}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            下载 JSON 模板
          </button>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium text-dark mb-3">上传文件</h4>
          <Dragger
            name="file"
            multiple={false}
            accept=".json"
            fileList={importFileList}
            onChange={({ file, fileList }) => {
              setImportFileList(fileList);
              if (file.originFileObj) {
                handleBatchImport(file.originFileObj);
              }
            }}
          >
            <p className="ant-upload-drag-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
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
        title="批量下载题目"
        onOk={handleBatchDownload}
        okText="下载"
        okButtonProps={{ loading: isLoading, disabled: isLoading }}
        width={500}
      >
        <div className="mb-6">
          <label className="block text-sm font-medium text-dark mb-2">下载选项</label>
          <Select 
            value={downloadOption}
            onChange={setDownloadOption}
            style={{ width: '100%' }}
          >
            <Select.Option value="all">下载全部数据</Select.Option>
            <Select.Option value="paginated">分页下载</Select.Option>
          </Select>
        </div>
        
        {downloadOption === 'paginated' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">每页下载条数</label>
              <Input 
                type="number" 
                min="1" 
                max="5000" 
                value={downloadPageSize}
                onChange={(e) => setDownloadPageSize(e.target.value)}
                placeholder="请输入每页下载条数"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">下载页码</label>
              <Input 
                type="number" 
                min="1" 
                value={downloadPageNumber}
                onChange={(e) => setDownloadPageNumber(e.target.value)}
                placeholder="请输入下载页码"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuestionManager;
