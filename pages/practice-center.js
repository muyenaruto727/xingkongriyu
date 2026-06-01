import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';

const PracticeCenter = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [practiceType, setPracticeType] = useState('vocabulary'); // 'vocabulary' or 'grammar'
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const startPractice = (type) => {
    setPracticeType(type);
    setShowLevelModal(true);
  };

  const handleLevelSelect = async (level) => {
    setSelectedLevel(level);
    setShowLevelModal(false);
    setLoading(true);

    try {
      // 从API获取题目
      const response = await fetch(`/api/questions?level=${level}&type=${practiceType === 'vocabulary' ? 'vocabulary' : 'grammar'}&is_real_exam=false&limit=100`);
      if (response.ok) {
        const data = await response.json();
        const allQuestions = Array.isArray(data.data?.data) ? data.data.data : [];
        
        // 随机抽取10题，确保不重复
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);
        
        setQuestions(selected);
        setCurrentQuestionIndex(0);
        setUserAnswer(null);
        setShowResult(false);
        setCorrectCount(0);
        setIncorrectCount(0);
        setShowPracticeModal(true);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (userAnswer === null) return;

    setSubmitting(true);

    // 使用setTimeout确保状态更新和重新渲染的过程尽可能流畅
    setTimeout(() => {
      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = userAnswer === parseInt(currentQuestion.correct_answer);

      if (isCorrect) {
        setCorrectCount(prev => prev + 1);
      } else {
        setIncorrectCount(prev => prev + 1);
      }

      setShowResult(true);
      setSubmitting(false);
    }, 100);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer(null);
      setShowResult(false);
    } else {
      // 练习结束
      setShowPracticeModal(false);
      // 可以显示成绩或其他信息
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>练习中心 - 星空日语</title>
        <meta name="description" content="练习中心，提供词汇练习、语法练习、听力练习、阅读练习和真题考试" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Navigation />
      
      <main className="flex-grow">
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card
                title="词汇练习"
                description="通过练习巩固所学词汇，提高记忆效果，强化词汇应用能力。"
                buttonText="开始练习"
                onClick={() => startPractice('vocabulary')}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                iconBg="bg-yellow-100"
                iconText="text-yellow-600"
                buttonBg="bg-yellow-500 hover:bg-yellow-600"
              />
              <Card
                title="语法练习"
                description="通过练习巩固语法知识，提高应用能力，掌握语法规则的实际运用。"
                buttonText="开始练习"
                onClick={() => startPractice('grammar')}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                iconBg="bg-blue-100"
                iconText="text-blue-600"
                buttonBg="bg-blue-500 hover:bg-blue-600"
              />

              <Card
                title="听力练习"
                description="提高日语听力能力，适应不同场景的对话，培养听力理解能力。"
                buttonText="开始练习"
                buttonUrl="#"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                }
                iconBg="bg-purple-100"
                iconText="text-purple-600"
                buttonBg="bg-purple-500 hover:bg-purple-600"
              />
              <Card
                title="阅读练习"
                description="通过阅读练习提高阅读理解能力，熟悉日语表达习惯和思维方式。"
                buttonText="开始练习"
                buttonUrl="#"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                iconBg="bg-indigo-100"
                iconText="text-indigo-600"
                buttonBg="bg-indigo-500 hover:bg-indigo-600"
              />
              <Card
                title="真题考试"
                description="模拟真实考试环境，测试日语水平，熟悉考试题型和流程。"
                buttonText="开始考试"
                buttonUrl="/exam"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                iconBg="bg-blue-100"
                iconText="text-blue-600"
                buttonBg="bg-blue-500 hover:bg-blue-600"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* 级别选择弹窗 */}
      <Modal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        title="选择级别"
        size="md"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {levels.map((level) => (
            <button
              key={level}
              className="p-4 border-2 rounded-lg transition-colors duration-300 hover:border-primary hover:bg-blue-50"
              onClick={() => handleLevelSelect(level)}
            >
              <div className="text-xl font-bold text-center">{level}</div>
            </button>
          ))}
        </div>
      </Modal>

      {/* 练习弹窗 */}
      <Modal
        isOpen={showPracticeModal}
        onClose={() => setShowPracticeModal(false)}
        title={`${practiceType === 'vocabulary' ? '词汇' : '语法'}练习 - ${selectedLevel}`}
        size="xl"
        showCancel={false}
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : questions.length > 0 ? (
          <div>
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>第 {currentQuestionIndex + 1}/{questions.length} 题</span>
                <span>
                  <span className="text-green-500 mr-2">✓ {correctCount}</span>
                  <span className="text-red-500">✗ {incorrectCount}</span>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>



            {/* 题目内容 */}
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-800">{questions[currentQuestionIndex].question_text || questions[currentQuestionIndex].question}</p>
            </div>

            {/* 选项 */}
            <div className="mb-6 space-y-3">
              {questions[currentQuestionIndex].options && (Array.isArray(questions[currentQuestionIndex].options) ? questions[currentQuestionIndex].options : JSON.parse(questions[currentQuestionIndex].options)).map((option, index) => {
                const correctAnswer = parseInt(questions[currentQuestionIndex].correct_answer);
                const isCorrect = showResult && index === correctAnswer;
                const isWrong = showResult && userAnswer === index && userAnswer !== correctAnswer;
                
                return (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${ 
                      !showResult 
                        ? userAnswer === index 
                          ? 'border-primary bg-blue-50' 
                          : 'border-gray-200 hover:border-primary hover:bg-blue-50' 
                        : isCorrect 
                          ? 'border-green-500 bg-green-50' 
                          : isWrong 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-200' 
                    }`}
                    onClick={() => !showResult && setUserAnswer(index)}
                  >
                    <div className="flex items-center">
                      <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                      <span className="flex-grow">{option}</span>
                      {showResult && (isCorrect || isWrong) && (
                        <span className={`ml-2 font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 解析 */}
            {showResult && questions[currentQuestionIndex].explanation && (
              <div className="mb-6 p-5 bg-yellow-50 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  详细解析
                </h4>
                <p className="text-gray-700 leading-relaxed">{questions[currentQuestionIndex].explanation}</p>
              </div>
            )}

            {/* 按钮 */}
            <div className="flex justify-center">
              {!showResult ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={userAnswer === null || submitting}
                  className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '判断中...' : '提交答案'}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors duration-300"
                >
                  {currentQuestionIndex < questions.length - 1 ? '下一题 →' : '完成练习'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">暂无题目</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PracticeCenter;