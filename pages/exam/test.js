import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Modal, message } from 'antd';
import Navigation from '../../components/layout/Navigation';
import { FEEDBACK_TYPES } from '../../config/config';
import { handleApiError, logError, formatTime } from '../../utils.js';

const ExamTest = () => {
  const router = useRouter();
  const [examConfig, setExamConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('题目有误');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // 加载考试配置和题目
  useEffect(() => {
    const config = localStorage.getItem('currentExam');
    if (!config) {
      router.push('/exam');
      return;
    }

    const parsedConfig = JSON.parse(config);
    setExamConfig(parsedConfig);
    setTimeLeft(parsedConfig.timeLimit * 60);

    // 从API获取题目
    fetchQuestions(parsedConfig);
  }, [router]);

  // 倒计时
  useEffect(() => {
    if (timeLeft <= 0 || isExamFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isExamFinished]);

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
      vocabulary: { count: 30, time: 20 },
      grammar: { count: 17, time: 20 },
      reading: { count: 21, time: 35 },
      listening: { count: 30, time: 35 }
    },
    N5: {
      vocabulary: { count: 30, time: 20 },
      grammar: { count: 17, time: 10 },
      reading: { count: 21, time: 30 },
      listening: { count: 24, time: 30 }
    }
  };

  // 类别文案映射
  const categoryTexts = {
    // 文字/词汇
    kanji_reading: '漢字読音',
    kanji_writing: '漢字書き',
    word_formation: '単語構成',
    word_relation: '前後関係',
    synonym_replacement: '同義語置換',
    usage: '用法',
    '汉字-汉字读法题': '漢字読音',
    '汉字-汉字写法题': '漢字書き',
    '词汇-词语构成题': '単語構成',
    '词汇-前后关系题': '前後関係',
    '词汇-同义词替换题': '同義語置換',
    '词汇-用法题': '用法',
    // 文法
    sentence_grammar1: '文文法1',
    sentence_grammar2: '文文法2',
    text_grammar: '文章文法',
    '文法-句子文法题': '文文法',
    '文法-文章文法题': '文章文法',
    // 読解
    short_content: '内容理解（短編）',
    medium_content: '内容理解（中編）',
    long_content: '内容理解（長編）',
    comprehensive: '総合理解',
    argument: '論理理解（長編）',
    information_retrieval: '情報検索',
    '读解-内容理解题': '内容理解',
    '读解-综合理解题': '総合理解',
    '读解-逻辑理解题': '論理理解',
    '读解-信息检索题': '情報検索',
    // 聴解
    problem_understanding: '問題理解',
    point_understanding: '要点理解',
    summary_understanding: '概要理解',
    language_expression: '言語表現',
    immediate_response: '即時応答',
    listening_comprehensive: '総合理解',
    '听力-问题理解题': '問題理解',
    '听力-要点理解题': '要点理解',
    '听力-概要理解题': '概要理解',
    '听力-语言表达题': '言語表現',
    '听力-即时应答题': '即時応答',
    '听力-综合理解题': '総合理解'
  };

  // 类别提示文案
  const categoryPrompts = {
    kanji_reading: '() の言葉の読み方として最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    kanji_writing: '() の言葉を漢字で書く時、最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    word_formation: '() に入れるのに最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    word_relation: '() に入れるのに最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    synonym_replacement: '() に意味が最も近いものを 1, 2, 3, 4 から一つ選びなさい。',
    usage: '次の言葉の使い方として最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    '汉字-汉字读法题': '() の言葉の読み方として最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    '汉字-汉字写法题': '() の言葉を漢字で書く時、最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    '词汇-词语构成题': '() に入れるのに最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    '词汇-前后关系题': '() に入れるのに最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    '词汇-同义词替换题': '() に意味が最も近いものを 1, 2, 3, 4 から一つ選びなさい。',
    '词汇-用法题': '次の言葉の使い方として最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    sentence_grammar1: '次の () に入れるのに最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    sentence_grammar2: '次の (*) に入れるのに最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    text_grammar: '次の文章を読んで、文章全体の内容を考えて、() の中に入る最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    '文法-句子文法题': '次の () に入れるのに最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    '文法-文章文法题': '次の文章を読んで、文章全体の内容を考えて、() の中に入る最も良いものを 1, 2, 3, 4 から一つ選びなさい。',
    short_content: '次の文章を読んで、質問に答えなさい。答えは、1, 2, 3, 4 から最も良いものを一つ選びなさい。',
    medium_content: '次の文章を読んで、質問に答えなさい。答えは、1, 2, 3, 4 から最も良いものを一つ選びなさい。',
    long_content: '次の文章を読んで、質問に答えなさい。答えは、1, 2, 3, 4 から最も良いものを一つ選びなさい。',
    comprehensive: '次の文章を読んで、質問に答えなさい。答えは、1, 2, 3, 4 から最も良いものを一つ選びなさい。',
    argument: '次の文章を読んで、質問に答えなさい。答えは、1, 2, 3, 4 から最も良いものを一つ選びなさい。',
    information_retrieval: '次の文章を読んで、質問に答えなさい。答えは、1, 2, 3, 4 から最も良いものを一つ選びなさい。',
    '读解-内容理解题': '次の文章を読んで、質問に答えなさい。答えは、1, 2, 3, 4 から最も良いものを一つ選びなさい。',
    '读解-综合理解题': '次の文章を読んで、質問に答えなさい。答えは、1, 2, 3, 4 から最も良いものを一つ選びなさい。',
    '读解-逻辑理解题': '次の文章を読んで、質問に答えなさい。答えは、1, 2, 3, 4 から最も良いものを一つ選びなさい。',
    '读解-信息检索题': '次の文章を読んで、質問に答えなさい。答えは、1, 2, 3, 4 から最も良いものを一つ選びなさい。',
    problem_understanding: 'まず質問を聞いてください。それから話を聞いて、問題用紙の1から4の中から最も良いものを一つ選んでください。',
    point_understanding: 'まず質問を聞いてください。その後、問題用紙を見てください。読む時間があります。それから話を聞いて、問題用紙の1から4の中から最も良いものを一つ選んでください。',
    summary_understanding: '問題用紙に何も印刷されていません。この問題は、全体としてどんな内容かを聞く問題です。話の前に質問はありません。まず聞いてください。それから、質問と選択肢を聞いて、1, 2, 3, 4 から最も良いものを一つ選んでください。',
    language_expression: 'では、絵を見ながら質問を聞いてください。質問の人は「どうですか。」と言います。1から3の中から、最も良いものを一つ選んでください。',
    immediate_response: '問題用紙に何も印刷されていません。まず文を聞いてください。それから、その返事を聞いて、1から3の中から、最も良いものを一つ選んでください。',
    listening_comprehensive: 'まず話を聞いてください。それから、質問を聞いて、それぞれ問題用紙の1から4の中から最も良いものを一つ選んでください。',
    '听力-问题理解题': 'まず質問を聞いてください。それから話を聞いて、問題用紙の1から4の中から最も良いものを一つ選んでください。',
    '听力-要点理解题': 'まず質問を聞いてください。その後、問題用紙を見てください。読む時間があります。それから話を聞いて、問題用紙の1から4の中から最も良いものを一つ選んでください。',
    '听力-概要理解题': '問題用紙に何も印刷されていません。この問題は、全体としてどんな内容かを聞く問題です。話の前に質問はありません。まず聞いてください。それから、質問と選択肢を聞いて、1, 2, 3, 4 から最も良いものを一つ選んでください。',
    '听力-语言表达题': 'では、絵を見ながら質問を聞いてください。質問の人は「どうですか。」と言います。1から3の中から、最も良いものを一つ選んでください。',
    '听力-即时应答题': '問題用紙に何も印刷されていません。まず文を聞いてください。それから、その返事を聞いて、1から3の中から、最も良いものを一つ選んでください。',
    '听力-综合理解题': 'まず話を聞いてください。それから、質問を聞いて、それぞれ問題用紙の1から4の中から最も良いものを一つ選んでください。'
  };

  const fetchQuestions = async (config) => {
    try {
      const response = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: config.level,
          sections: config.sections
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data.data?.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      // 如果API调用失败，使用模拟数据
      generateMockQuestions(config);
    }
  };

  const generateMockQuestions = (config) => {
    const mockQuestions = [];
    const sections = config.sections || ['vocabulary', 'grammar', 'reading', 'listening'];
    const level = config.level || 'N3';
    
    let questionId = 1;
    sections.forEach(section => {
      const count = levelConfig[level][section] ? levelConfig[level][section].count : 10;
      for (let i = 0; i < count; i++) {
        let question;

        switch (section) {
          case 'vocabulary':
            const vocabCategories = ['kanji_reading', 'kanji_writing', 'word_formation', 'word_relation', 'synonym_replacement', 'usage'];
            const vocabCategory = vocabCategories[i % vocabCategories.length];
            question = {
              id: questionId++,
              type: 'vocabulary',
              typeName: '文字・語彙',
              category: vocabCategory,
              question: `词汇题目 ${i + 1}：请选择正确的读音`,
              options: ['选项A', '选项B', '选项C', '选项D'],
              correctAnswer: 0,
              explanation: `这是词汇题目 ${i + 1} 的解析。`
            };
            break;
          case 'grammar':
            const grammarCategories = ['sentence_grammar1', 'sentence_grammar2', 'text_grammar'];
            const grammarCategory = grammarCategories[i % grammarCategories.length];
            question = {
              id: questionId++,
              type: 'grammar',
              typeName: '文法',
              category: grammarCategory,
              question: `「彼は約束を守る（ ）、信頼できる人だ。」`,
              options: ['だけあって', 'ばかりか', 'ことから', 'ものだから'],
              correctAnswer: 2,
              explanation: `这是文法题目 ${i + 1} 的解析。正确答案是「ことから」，表示根据前面的事实得出结论。`
            };
            break;
          case 'reading':
            const readingCategories = ['short_content', 'medium_content', 'long_content', 'comprehensive', 'argument', 'information_retrieval'];
            const readingCategory = readingCategories[i % readingCategories.length];
            question = {
              id: questionId++,
              type: 'reading',
              typeName: '読解',
              category: readingCategory,
              passage: `阅读文章 ${Math.floor(i / 3) + 1}：这是一篇模拟的阅读理解文章。文章内容包括各种话题，用于测试学生的阅读理解能力。`,
              question: `阅读题目 ${(i % 3) + 1}：根据文章内容，选择正确的答案。`,
              options: ['选项A', '选项B', '选项C', '选项D'],
              correctAnswer: 1,
              explanation: `这是阅读题目 ${(i % 3) + 1} 的解析。根据文章内容，正确答案是选项B。`
            };
            break;
          case 'listening':
            const listeningCategories = ['problem_understanding', 'point_understanding', 'summary_understanding', 'language_expression', 'immediate_response', 'listening_comprehensive'];
            const listeningCategory = listeningCategories[i % listeningCategories.length];
            question = {
              id: questionId++,
              type: 'listening',
              typeName: '聴解',
              category: listeningCategory,
              audioUrl: null,
              question: `听力题目 ${i + 1}：请听音频，选择正确的答案。`,
              options: ['选项A', '选项B', '选项C', '选项D'],
              correctAnswer: 3,
              explanation: `这是听力题目 ${i + 1} 的解析。根据听力内容，正确答案是选项A。`
            };
            break;
          default:
            question = {
              id: questionId++,
              type: 'vocabulary',
              typeName: '文字・語彙',
              category: 'kanji_reading',
              question: `题目 ${i + 1}`,
              options: ['选项A', '选项B', '选项C', '选项D'],
              correctAnswer: 0,
              explanation: `这是题目 ${i + 1} 的解析。`
            };
        }

        mockQuestions.push(question);
      }
    });

    setQuestions(mockQuestions);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitExam = async () => {
    setIsExamFinished(true);
    
    // 计算成绩
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === parseInt(q.correctAnswer)) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const duration = formatTime(examConfig.timeLimit * 60 - timeLeft);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      showToast('请先登录', 'error');
      router.push('/login');
      return;
    }

    const examRecord = {
      level: examConfig.level,
      sections: examConfig.sections,
      score,
      correct_count: correctCount,
      total_count: questions.length,
      duration: examConfig.timeLimit * 60 - timeLeft,
      answers,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        typeName: q.typeName,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        passage: q.passage
      }))
    };

    try {
      const response = await fetch('/api/exam-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          ...examRecord
        }),
      });

      if (response.ok) {
        showToast(`考试完成！\n得分：${score}\n正确：${correctCount}/${questions.length}\n用时：${duration}`, 'success');
        router.push('/exam');
      } else {
        const error = new Error('Failed to save exam record');
        error.response = { status: response.status, data: await response.json() };
        handleApiError(error, showToast);
      }
    } catch (error) {
      logError(error, 'Save Exam Record');
      handleApiError(error, showToast);
    }
  };

  const showToast = (msg, type = 'info') => {
    message[type](msg);
  };

  const handleFeedbackSubmit = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      showToast('请先登录', 'error');
      router.push('/login');
      return;
    }

    if (!currentQuestion) {
      showToast('题目信息加载失败，请重试', 'error');
      return;
    }

    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          question_id: currentQuestion.id,
          feedback_type: feedbackType,
          description: feedbackDescription
        }),
      });

      if (response.ok) {
        showToast('反馈提交成功，感谢您的反馈！', 'success');
        setShowFeedbackModal(false);
        setFeedbackType('题目有误');
        setFeedbackDescription('');
      } else {
        const error = new Error('Failed to submit feedback');
        error.response = { status: response.status, data: await response.json() };
        handleApiError(error, showToast);
      }
    } catch (error) {
      logError(error, 'Submit Feedback');
      handleApiError(error, showToast);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!examConfig || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>考试中 - 日语学习网站</title>
      </Head>
      
      <Navigation />
      
      <main className="pt-20 pb-8">
        <div className="container max-w-4xl">
          {/* 顶部信息栏 */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                级别: <span className="font-semibold text-blue-600">{examConfig.level}</span>
              </span>
              <span className="text-sm text-gray-600">
                进度: <span className="font-semibold">{currentQuestionIndex + 1}/{questions.length}</span>
              </span>
            </div>
            <div className={`text-lg font-mono font-bold ${
              timeLeft < 300 ? 'text-red-600' : 'text-blue-600'
            }`}>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* 题目导航 */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex flex-wrap gap-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionJump(index)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[q.id] !== undefined
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* 题目内容 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            {currentQuestion && (
              <div>
                {/* 题目类型标签 */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {currentQuestion.typeName}
                  </span>
                  <button 
                    onClick={() => setShowFeedbackModal(true)}
                    className="text-orange-500 text-sm flex items-center gap-1 hover:text-orange-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    反馈
                  </button>
                </div>

                {/* 类别提示文案 */}
                {currentQuestion.category && categoryPrompts[currentQuestion.category] && (
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm pl-4 border-l-2 border-gray-200">
                      {categoryPrompts[currentQuestion.category]}
                    </p>
                  </div>
                )}

                {/* 阅读文章（如果是阅读题） */}
                {(currentQuestion.type === 'reading' || (currentQuestion.type === 'grammar' && currentQuestion.passage)) && currentQuestion.passage && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{currentQuestion.passage}</p>
                  </div>
                )}

                {/* 听力音频（如果是听力题） */}
                {currentQuestion.type === 'listening' && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <button className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <span className="text-gray-600">点击播放音频</span>
                    </div>
                  </div>
                )}

                {/* 题目 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* 选项 */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        answers[currentQuestion.id] === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion.id] === index
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[currentQuestion.id] === index && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 底部导航 */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              上一题
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                提交试卷
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                下一题
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* 提交确认弹窗 */}
      <Modal
        open={showConfirmSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
        title="确认提交"
        onOk={handleSubmitExam}
        okText="确认提交"
        cancelText="继续答题"
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            您已回答 <span className="font-semibold text-blue-600">{Object.keys(answers).length}</span> / {questions.length} 题
          </p>
          <p className="text-gray-600">
            未回答题目: <span className="font-semibold text-red-500">{questions.length - Object.keys(answers).length}</span> 题
          </p>
        </div>
      </Modal>

      {/* 反馈模态框 */}
      <Modal
        open={showFeedbackModal}
        onCancel={() => setShowFeedbackModal(false)}
        title="反馈题目问题"
        footer={null}
      >
        <p className="mb-4 text-gray-600">请选择问题类型，我们会自动检查并优化题目：</p>
        
        <div className="space-y-3 mb-6">
          {
            FEEDBACK_TYPES.map(item => (
              <button
                key={item.value}
                onClick={() => setFeedbackType(item.value)}
                className={`w-full p-4 rounded-lg text-left flex items-center gap-3 transition-colors ${
                  feedbackType === item.value
                    ? 'bg-orange-50 border-2 border-orange-500'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {feedbackType === item.value && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))
          }
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">补充说明（选填）</label>
          <textarea
            value={feedbackDescription}
            onChange={(e) => setFeedbackDescription(e.target.value)}
            placeholder="请详细描述问题，例如：我认为正确答案应该是..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {feedbackDescription.length}/500
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => setShowFeedbackModal(false)}
            className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleFeedbackSubmit}
            className="flex-1 p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            提交反馈
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ExamTest;