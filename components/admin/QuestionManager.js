import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import Toast from '../common/Toast';
import { Input, Select } from 'antd';
import QuestionList from './QuestionManager/QuestionList';
import QuestionForm from './QuestionManager/QuestionForm';
import Pagination from '../common/Pagination';
import Filter from './QuestionManager/Filter';
import Modal from '../common/Modal';

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
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  
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
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm(prev => ({
      ...prev,
      [name]: value
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
      console.error('Failed to create question:', error);
      showToast('创建失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
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
      console.error('Failed to update question:', error);
      showToast('更新失败', 'error');
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
    setIsLoading(true);
    try {
      await api.deleteQuestion(currentDeleteId);
      setShowDeleteConfirm(false);
      fetchQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
      showToast('删除失败', 'error');
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
  const showToast = (message, type = 'info') => {
    setToast({ isOpen: true, message, type });
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
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditMode ? '编辑题目' : '添加题目'}
        confirmText={isLoading ? (isEditMode ? '更新中...' : '保存中...') : '保存'}
        onConfirm={isEditMode ? handleSubmitEdit : handleSubmitAdd}
        size="xl"
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
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除"
        confirmText={isLoading ? '删除中...' : '删除'}
        cancelText="取消"
        onConfirm={confirmDelete}
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700">确定要删除这道题目吗？此操作不可撤销。</p>
        </div>
      </Modal>

      {/* Toast组件 */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default QuestionManager;