import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import Toast from '../../components/common/Toast';
import Modal from '../../components/common/Modal';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN');
};

const ExamIndex = () => {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(30);
  const [examRecords, setExamRecords] = useState([]);
  const [showRecordDetail, setShowRecordDetail] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

  const levels = [
    { id: 'N1', name: 'N1', desc: '能理解广泛场合的日语' },
    { id: 'N2', name: 'N2', desc: '能理解日常场合的日语' },
    { id: 'N3', name: 'N3', desc: '能理解日常日语' },
    { id: 'N4', name: 'N4', desc: '能理解基础日语' },
    { id: 'N5', name: 'N5', desc: '能理解基本日语' }
  ];

  // 各级别的题目数量和时间配置
  const levelConfig = {
    N1: {
      vocabulary: { count: 25, time: 30 },
      grammar: { count: 22, time: 30 },
      reading: { count: 25, time: 70 },
      listening: { count: 25, time: 55 }
    },
    N2: {
      vocabulary: { count: 25, time: 30 },
      grammar: { count: 22, time: 30 },
      reading: { count: 21, time: 60 },
      listening: { count: 27, time: 55 }
    },
    N3: {
      vocabulary: { count: 30, time: 30 },
      grammar: { count: 19, time: 30 },
      reading: { count: 21, time: 60 },
      listening: { count: 27, time: 55 }
    },
    N4: {
      vocabulary: { count: 30, time: 30 },
      grammar: { count: 17, time: 30 },
      reading: { count: 21, time: 60 },
      listening: { count: 30, time: 55 }
    },
    N5: {
      vocabulary: { count: 30, time: 30 },
      grammar: { count: 17, time: 30 },
      reading: { count: 21, time: 60 },
      listening: { count: 30, time: 55 }
    }
  };

  const sections = [
    { 
      id: 'vocabulary', 
      name: '文字・語彙', 
      nameJp: 'もじ・ごい',
      desc: '汉字读音、词汇用法'
    },
    { 
      id: 'grammar', 
      name: '文法', 
      nameJp: 'ぶんぽう',
      desc: '语法知识、句型运用'
    },
    { 
      id: 'reading', 
      name: '読解', 
      nameJp: 'どっかい',
      desc: '阅读理解'
    },
    { 
      id: 'listening', 
      name: '聴解', 
      nameJp: 'ちょうかい',
      desc: '听力理解'
    }
  ];

  useEffect(() => {
    const fetchExamRecords = async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        return;
      }

      try {
        const response = await fetch(`/api/exam-records?user_id=${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setExamRecords(data.data?.data || []);
        }
      } catch (error) {
        console.error('Error fetching exam records:', error);
      }
    };

    fetchExamRecords();
  }, []);

  const calculateTimeLimit = (levelId, selectedSections) => {
    if (!levelId) return 0;
    
    const config = levelConfig[levelId];
    
    // 如果全选或者一个都没有选，则显示4个模块的总和
    if (selectedSections.length === 0 || selectedSections.length === sections.length) {
      return Object.values(config).reduce((sum, section) => sum + section.time, 0);
    }
    
    // 否则，将选中模块的时间相加
    return selectedSections.reduce((sum, sectionId) => {
      if (config[sectionId]) {
        return sum + config[sectionId].time;
      }
      return sum;
    }, 0);
  };

  const handleLevelSelect = (levelId) => {
    setSelectedLevel(levelId);
    setSelectedSections([]);
    
    // 计算时间限制
    const totalTime = calculateTimeLimit(levelId, []);
    setTimeLimit(totalTime);
  };

  const handleSectionToggle = (sectionId) => {
    setSelectedSections(prev => {
      let newSections;
      if (prev.includes(sectionId)) {
        newSections = prev.filter(id => id !== sectionId);
      } else {
        newSections = [...prev, sectionId];
      }
      
      // 重新计算时间限制
      const totalTime = calculateTimeLimit(selectedLevel, newSections);
      setTimeLimit(totalTime);
      
      return newSections;
    });
  };

  const handleSelectAllSections = () => {
    let newSections;
    if (selectedSections.length === sections.length) {
      newSections = [];
    } else {
      newSections = sections.map(s => s.id);
    }
    
    // 重新计算时间限制
    const totalTime = calculateTimeLimit(selectedLevel, newSections);
    setTimeLimit(totalTime);
    
    setSelectedSections(newSections);
  };

  // 显示Toast通知
  const showToast = (message, type = 'info') => {
    setToast({ isOpen: true, message, type });
  };

  const handleStartExam = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      showToast('请先登录', 'error');
      router.push('/login');
      return;
    }

    if (!selectedLevel) {
      showToast('请选择考试级别', 'warning');
      return;
    }

    const examSections = selectedSections.length > 0 ? selectedSections : sections.map(s => s.id);
    
    // 计算总题目数
    let totalQuestions = 0;
    examSections.forEach(sectionId => {
      if (levelConfig[selectedLevel][sectionId]) {
        totalQuestions += levelConfig[selectedLevel][sectionId].count;
      }
    });

    const examConfig = {
      level: selectedLevel,
      sections: examSections,
      timeLimit: parseInt(timeLimit),
      totalQuestions: totalQuestions
    };

    localStorage.setItem('currentExam', JSON.stringify(examConfig));
    router.push('/exam/test');
  };

  // 已在文件顶部定义了formatDate函数

  const handleViewRecordDetail = (record) => {
    setCurrentRecord(record);
    setShowRecordDetail(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>真题考试 - 星空日语</title>
      </Head>
      
      <Navigation />
      
      <main className="flex-grow">
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container max-w-4xl">
          
          {/* 选择考试级别 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">选择考试级别</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {levels.map(level => (
                <button
                  key={level.id}
                  onClick={() => handleLevelSelect(level.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedLevel === level.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className={`text-2xl font-bold mb-1 ${
                    selectedLevel === level.id ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {level.name}
                  </div>
                  <div className="text-xs text-gray-500">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 选择考试部分 */}
          {selectedLevel && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">选择考试部分（可多选）</h2>
                  <p className="text-sm text-gray-500">不选择则进行完整考试</p>
                </div>
                <button
                  onClick={handleSelectAllSections}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  {selectedSections.length === sections.length ? '取消全选' : '全选'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionToggle(section.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedSections.includes(section.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{section.name}</div>
                        <div className="text-sm text-gray-500">{section.nameJp}</div>
                        <div className="text-xs text-gray-400 mt-1">{section.desc}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {selectedLevel && levelConfig[selectedLevel][section.id] ? levelConfig[selectedLevel][section.id].count : 0}题
                          </span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {selectedLevel && levelConfig[selectedLevel][section.id] ? levelConfig[selectedLevel][section.id].time : 0}分钟
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedSections.includes(section.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedSections.includes(section.id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 考试设置 */}
          {selectedLevel && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">考试设置</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  时间限制（分钟）
                </label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  min="1"
                  max="300"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* 开始考试按钮 */}
          {selectedLevel && (
            <div className="text-center">
              <button
                onClick={handleStartExam}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                开始考试
              </button>
            </div>
          )}

          {/* 考试记录 */}
          {examRecords.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  考试记录
                </h2>
                <button
                  onClick={() => {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    if (!currentUser) {
                      return;
                    }
                    const fetchExamRecords = async () => {
                      try {
                        const response = await fetch(`/api/exam-records?user_id=${currentUser.id}`);
                        if (response.ok) {
                          const data = await response.json();
                          setExamRecords(data.data?.data || []);
                        }
                      } catch (error) {
                        console.error('Error fetching exam records:', error);
                      }
                    };
                    fetchExamRecords();
                  }}
                  className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  刷新
                </button>
              </div>
              
              <div className="space-y-3">
                {examRecords.slice(0, 5).map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        record.score >= 80 ? 'bg-green-100 text-green-600' :
                        record.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {record.score}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{record.level}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-3">
                          <span>✓ {record.correct_count}/{record.total_count}</span>
                          <span>⏱ {formatTime(record.duration)}</span>
                          <span className="text-gray-400">{formatDate(record.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleViewRecordDetail(record)} className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1">
                      查看详情
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </section>
      </main>
      
      <Footer />

      {/* 考试记录详情模态框 */}
      <Modal
        isOpen={showRecordDetail}
        onClose={() => setShowRecordDetail(false)}
        title={`${currentRecord?.level} 完整考试`}
        size="xl"
      >
        {currentRecord && (
          <>
            {/* 考试基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{currentRecord.score}</div>
                <div className="text-sm text-gray-600">得分</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{currentRecord.correct_count}</div>
                <div className="text-sm text-gray-600">正确</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{currentRecord.total_count - currentRecord.correct_count}</div>
                <div className="text-sm text-gray-600">错误</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{formatTime(currentRecord.duration)}</div>
                <div className="text-sm text-gray-600">用时</div>
              </div>
            </div>

            {/* 正确率进度条 */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">正确率</span>
                <span className="text-sm font-medium text-gray-700">{Math.round((currentRecord.correct_count / currentRecord.total_count) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${(currentRecord.correct_count / currentRecord.total_count) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 答题记录详情 */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                答题记录详情
              </h4>
              <div className="space-y-6">
                {currentRecord.questions && currentRecord.questions.map((question, index) => {
                  const userAnswer = currentRecord.answers[question.id];
                  const isCorrect = userAnswer === parseInt(question.correctAnswer);
                  return (
                    <div key={index} className={`border rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {isCorrect ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <h5 className="font-medium text-gray-800">第 {index + 1} 题</h5>
                        <span className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {question.typeName || question.type}
                        </span>
                      </div>
                      
                      {/* 文章内容（如果有） */}
                      {question.passage && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-line">{question.passage}</p>
                        </div>
                      )}
                      
                      {/* 题目内容 */}
                      <div className="mb-3">
                        <p className="text-gray-700">{question.question}</p>
                      </div>
                      
                      {/* 选项 */}
                      {question.options && question.options.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`p-2 rounded ${userAnswer === optIndex ? 'bg-blue-100' : ''}`}>
                              <span className="mr-2 font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* 答案对比 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                          <div className="text-sm font-medium text-gray-700 mb-1">你的答案：</div>
                          <div className="text-gray-800">
                            {userAnswer !== undefined && question.options ? 
                              `${String.fromCharCode(65 + userAnswer)}. ${question.options[userAnswer]}` : 
                              '未作答'
                            }
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-100">
                          <div className="text-sm font-medium text-gray-700 mb-1">正确答案：</div>
                          <div className="text-gray-800">
                            {question.options ? 
                              `${String.fromCharCode(65 + parseInt(question.correctAnswer))}. ${question.options[parseInt(question.correctAnswer)]}` : 
                              '无'
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* 解析 */}
                      {question.explanation && (
                        <div className="mt-3 p-3 rounded-lg bg-blue-50">
                          <div className="text-sm font-medium text-gray-700 mb-1">解析：</div>
                          <div className="text-gray-800">{question.explanation}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
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

export default ExamIndex;