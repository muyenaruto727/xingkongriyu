import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message, Select } from 'antd';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import { api } from '../../lib/api';
import { formatVocabularyField } from '../../lib/vocabularyOptions';

const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];
const questionCounts = [10, 20, 30];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const cleanVocab = (items) => items.filter((item) =>
  item
  && item.id !== undefined
  && item.japanese
  && item.chinese
);

const createQuestion = (answer, pool, mode) => {
  const distractors = shuffle(pool.filter((item) => item.id !== answer.id)).slice(0, 3);
  const optionWords = shuffle([answer, ...distractors]);

  return {
    answer,
    prompt: mode === 'jp-to-zh' ? answer.japanese : answer.chinese,
    promptHint: mode === 'jp-to-zh' ? answer.pronunciation : '',
    answerText: mode === 'jp-to-zh' ? answer.chinese : answer.japanese,
    options: optionWords.map((item) => ({
      id: item.id,
      label: mode === 'jp-to-zh' ? item.chinese : item.japanese,
      detailLabel: mode === 'jp-to-zh'
        ? [item.japanese, item.pronunciation].filter(Boolean).join(' · ')
        : item.chinese,
      raw: item,
    })),
  };
};

const PoliceRunner = () => (
  <svg className="chase-sprite-svg" viewBox="0 0 96 112" role="img" aria-label="警察">
    <rect x="26" y="6" width="42" height="16" rx="4" fill="#2563eb" />
    <rect x="36" y="0" width="22" height="10" rx="3" fill="#1d4ed8" />
    <rect x="30" y="22" width="36" height="30" rx="14" fill="#ffd7b5" />
    <rect x="32" y="21" width="32" height="8" rx="3" fill="#1e40af" />
    <circle cx="39" cy="35" r="3" fill="#1f2937" />
    <circle cx="57" cy="35" r="3" fill="#1f2937" />
    <path d="M40 44c6 5 12 5 18 0" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" fill="none" />
    <rect x="27" y="52" width="42" height="34" rx="8" fill="#3b82f6" />
    <rect x="41" y="54" width="12" height="31" fill="#f8fafc" />
    <rect x="36" y="61" width="24" height="10" rx="2" fill="#1d4ed8" />
    <path className="runner-arm runner-arm-left" d="M28 58L12 72" stroke="#ffd7b5" strokeWidth="8" strokeLinecap="round" />
    <path className="runner-arm runner-arm-right" d="M68 58L84 70" stroke="#ffd7b5" strokeWidth="8" strokeLinecap="round" />
    <path className="runner-leg runner-leg-left" d="M38 84L24 105" stroke="#1e40af" strokeWidth="9" strokeLinecap="round" />
    <path className="runner-leg runner-leg-right" d="M58 84L76 103" stroke="#1e40af" strokeWidth="9" strokeLinecap="round" />
    <rect x="16" y="101" width="22" height="7" rx="3" fill="#111827" />
    <rect x="66" y="100" width="22" height="7" rx="3" fill="#111827" />
  </svg>
);

const ThiefRunner = () => (
  <svg className="chase-sprite-svg" viewBox="0 0 96 112" role="img" aria-label="小偷">
    <rect x="29" y="8" width="38" height="16" rx="8" fill="#111827" />
    <rect x="30" y="23" width="36" height="30" rx="14" fill="#f8cfa6" />
    <path d="M30 31h36v7H30z" fill="#111827" />
    <circle cx="39" cy="36" r="3" fill="#f8fafc" />
    <circle cx="57" cy="36" r="3" fill="#f8fafc" />
    <path d="M43 45c4 2 8 2 12 0" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" fill="none" />
    <rect x="27" y="52" width="42" height="34" rx="8" fill="#111827" />
    <rect x="27" y="59" width="42" height="7" fill="#f8fafc" />
    <rect x="27" y="73" width="42" height="7" fill="#f8fafc" />
    <path className="runner-arm runner-arm-left" d="M30 59L13 75" stroke="#f8cfa6" strokeWidth="8" strokeLinecap="round" />
    <path className="runner-arm runner-arm-right" d="M68 60L85 71" stroke="#f8cfa6" strokeWidth="8" strokeLinecap="round" />
    <path d="M73 47c8 3 13 9 14 17 1 7-4 12-12 10-8-2-12-9-11-16 0-6 3-10 9-11z" fill="#f59e0b" stroke="#92400e" strokeWidth="3" />
    <path d="M69 53l11 14" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
    <path className="runner-leg runner-leg-left" d="M38 84L22 104" stroke="#111827" strokeWidth="9" strokeLinecap="round" />
    <path className="runner-leg runner-leg-right" d="M58 84L78 103" stroke="#111827" strokeWidth="9" strokeLinecap="round" />
    <rect x="15" y="101" width="22" height="7" rx="3" fill="#111827" />
    <rect x="68" y="100" width="22" height="7" rx="3" fill="#111827" />
  </svg>
);

const ChaseScene = ({ chaseProgress, thiefProgress, feedback, caught }) => (
  <div className={`chase-scene ${feedback === 'correct' ? 'chase-scene-correct' : ''} ${feedback === 'wrong' ? 'chase-scene-wrong' : ''}`}>
    <div className="chase-skyline" aria-hidden="true">
      <span className="chase-building chase-building-a" />
      <span className="chase-building chase-building-b" />
      <span className="chase-building chase-building-c" />
      <span className="chase-building chase-building-d" />
      <span className="chase-window chase-window-a" />
      <span className="chase-window chase-window-b" />
      <span className="chase-window chase-window-c" />
    </div>
    <div className="chase-road" aria-hidden="true">
      <span className="chase-lane chase-lane-a" />
      <span className="chase-lane chase-lane-b" />
      <span className="chase-lane chase-lane-c" />
      <span className="chase-lane chase-lane-d" />
    </div>
    <div
      className="chase-runner chase-police"
      style={{ left: `${chaseProgress}%` }}
    >
      <div className="chase-nameplate">警察</div>
      <PoliceRunner />
    </div>
    <div
      className="chase-runner chase-thief"
      style={{ left: `${thiefProgress}%` }}
    >
      <div className="chase-nameplate chase-nameplate-thief">小偷</div>
      <ThiefRunner />
    </div>
    {feedback && (
      <div className={`chase-bubble ${feedback === 'correct' ? 'chase-bubble-correct' : 'chase-bubble-wrong'}`}>
        {feedback === 'correct' ? '追上去' : '跑远了'}
      </div>
    )}
    {caught && (
      <div className="chase-caught-badge">已追上</div>
    )}
  </div>
);

const PoliceCatchThief = () => {
  const router = useRouter();
  const feedbackTimerRef = useRef(null);
  const [textbooks, setTextbooks] = useState([]);
  const [sourceMode, setSourceMode] = useState('level');
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [selectedTextbook, setSelectedTextbook] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [questionMode, setQuestionMode] = useState('jp-to-zh');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [gameWords, setGameWords] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState({
    score: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    mistakes: [],
  });

  useEffect(() => {
    fetchTextbooks();
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const fetchTextbooks = async () => {
    try {
      const data = await api.getTextbookList();
      setTextbooks(normalizeList(data));
    } catch (err) {
      api.handleError('教材列表读取失败', err);
    }
  };

  const lessonOptions = useMemo(() => {
    if (!selectedTextbook) return [];
    const textbook = textbooks.find((item) => String(item.id) === String(selectedTextbook));
    if (!textbook) return [];
    if (Array.isArray(textbook.lessons)) return textbook.lessons;
    const count = textbook.lesson_count || textbook.lessons_count || 25;
    return Array.from({ length: count }, (_, index) => ({
      id: `第${index + 1}课`,
      name: `第${index + 1}课`,
    }));
  }, [selectedTextbook, textbooks]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = stats.correct + stats.wrong;
  const accuracy = answeredCount === 0 ? 0 : Math.round((stats.correct / answeredCount) * 100);
  const chaseProgress = Math.min(100, Math.max(8, 18 + stats.correct * 9 + stats.streak * 2 - stats.wrong * 5));
  const thiefProgress = Math.min(92, Math.max(38, 78 - stats.correct * 3 + stats.wrong * 5));
  const caught = chaseProgress >= thiefProgress;

  const sourceLabel = useMemo(() => {
    if (sourceMode === 'level') return selectedLevel;
    const textbook = textbooks.find((item) => String(item.id) === String(selectedTextbook));
    const lesson = selectedLesson || '未选课程';
    return textbook ? `${textbook.name} · ${lesson}` : '教材课程';
  }, [sourceMode, selectedLevel, selectedTextbook, selectedLesson, textbooks]);

  const loadVocabulary = async () => {
    if (sourceMode === 'textbook' && (!selectedTextbook || !selectedLesson)) {
      message.warning('请先选择教材和课程');
      return [];
    }

    if (sourceMode === 'level') {
      const data = await api.getVocabList({ level: selectedLevel, limit: 1000 });
      return cleanVocab(normalizeList(data));
    }

    const textbook = textbooks.find((item) => String(item.id) === String(selectedTextbook));
    const textbookName = textbook?.name || selectedTextbook;
    const lessonName = selectedLesson;
    const data = await api.getVocabList({
      textbook: textbookName,
      lesson: `${textbookName}:${lessonName}`,
      limit: 1000,
    });
    return cleanVocab(normalizeList(data));
  };

  const startGame = async () => {
    try {
      setLoading(true);
      const vocab = await loadVocabulary();
      if (vocab.length < 4) {
        message.warning('当前词汇范围少于 4 个词，无法生成四选一题目');
        return;
      }

      const selectedWords = shuffle(vocab).slice(0, Math.min(questionCount, vocab.length));
      const nextQuestions = selectedWords.map((word) => createQuestion(word, vocab, questionMode));

      setGameWords(vocab);
      setQuestions(nextQuestions);
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setFeedback(null);
      setStats({
        score: 0,
        correct: 0,
        wrong: 0,
        streak: 0,
        bestStreak: 0,
        mistakes: [],
      });
      setShowResult(false);
      setIsPlaying(true);
    } catch (err) {
      api.handleError('词汇读取失败', err);
    } finally {
      setLoading(false);
    }
  };

  const finishGame = () => {
    setIsPlaying(false);
    setShowResult(true);
  };

  const handleAnswer = (option) => {
    if (!currentQuestion || selectedOptionId !== null) return;

    const correct = option.id === currentQuestion.answer.id;
    setSelectedOptionId(option.id);
    setFeedback(correct ? 'correct' : 'wrong');
    setStats((prev) => {
      const nextStreak = correct ? prev.streak + 1 : 0;
      return {
        score: prev.score + (correct ? 10 + Math.min(prev.streak, 5) * 2 : 0),
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
        streak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
        mistakes: correct
          ? prev.mistakes
          : [...prev.mistakes, {
            word: currentQuestion.answer,
            selected: option.label,
            expected: currentQuestion.answerText,
          }],
      };
    });

    feedbackTimerRef.current = setTimeout(() => {
      if (currentIndex >= questions.length - 1) {
        finishGame();
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOptionId(null);
        setFeedback(null);
      }
    }, 850);
  };

  const resetToSettings = () => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setIsPlaying(false);
    setShowResult(false);
    setQuestions([]);
    setGameWords([]);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setFeedback(null);
  };

  return (
    <div className="tool-page-shell">
      <Head>
        <title>警察抓小偷 — 星空日语</title>
        <meta name="description" content="警察抓小偷词汇游戏，通过四选一追逐玩法巩固日语单词记忆" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        <section className="tool-main">
          <div className="tool-container-wide">
            {!isPlaying && !showResult && (
              <div>
                <button
                  type="button"
                  onClick={() => router.push('/tools')}
                  className="tool-back"
                >
                  <span aria-hidden="true">←</span>
                  返回小工具
                </button>

                <div className="mb-8">
                  <span className="tool-eyebrow">词汇游戏</span>
                  <h1 className="tool-title">警察抓小偷</h1>
                  <p className="tool-description">
                    从词汇列表生成四选一题目。答对一次警察就更接近小偷，连续答对会加速追捕。
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <section className="tool-panel">
                    <div className="mb-8">
                      <label className="tool-label">词汇来源</label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setSourceMode('level')}
                          className={`tool-choice ${sourceMode === 'level' ? 'tool-choice-active' : ''}`}
                        >
                          <div className="font-bold text-slate-800">按级别筛选</div>
                          <div className="mt-1 text-xs text-slate-500">从 N1-N5 词汇中抽题</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSourceMode('textbook')}
                          className={`tool-choice ${sourceMode === 'textbook' ? 'tool-choice-active' : ''}`}
                        >
                          <div className="font-bold text-slate-800">按教材课程</div>
                          <div className="mt-1 text-xs text-slate-500">从指定教材课程抽题</div>
                        </button>
                      </div>
                    </div>

                    {sourceMode === 'level' ? (
                      <div className="mb-8">
                        <label className="tool-label">JLPT 级别</label>
                        <div className="flex flex-wrap gap-2">
                          {levels.map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setSelectedLevel(level)}
                              className={`tool-chip ${selectedLevel === level ? 'tool-chip-active' : ''}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-8 grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="tool-label">选择教材</label>
                          <Select
                            value={selectedTextbook || undefined}
                            onChange={(value) => {
                              setSelectedTextbook(value);
                              setSelectedLesson('');
                            }}
                            placeholder="请选择教材"
                            style={{ width: '100%' }}
                            size="large"
                            options={textbooks.map((item) => ({
                              value: String(item.id),
                              label: item.name,
                            }))}
                          />
                        </div>
                        <div>
                          <label className="tool-label">选择课程</label>
                          <Select
                            value={selectedLesson || undefined}
                            onChange={(value) => setSelectedLesson(value)}
                            placeholder="请选择课程"
                            style={{ width: '100%' }}
                            size="large"
                            disabled={!selectedTextbook}
                            options={lessonOptions.map((lesson) => ({
                              value: lesson.name || lesson,
                              label: lesson.name || lesson,
                            }))}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="tool-label">题目模式</label>
                        <div className="grid gap-3">
                          <button
                            type="button"
                            onClick={() => setQuestionMode('jp-to-zh')}
                            className={`tool-choice ${questionMode === 'jp-to-zh' ? 'tool-choice-active' : ''}`}
                          >
                            <div className="font-bold text-slate-800">日语选中文</div>
                            <div className="mt-1 text-xs text-slate-500">看到日语，选择对应中文</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuestionMode('zh-to-jp')}
                            className={`tool-choice ${questionMode === 'zh-to-jp' ? 'tool-choice-active' : ''}`}
                          >
                            <div className="font-bold text-slate-800">中文选日语</div>
                            <div className="mt-1 text-xs text-slate-500">看到中文，选择对应日语</div>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="tool-label">题目数量</label>
                        <div className="flex flex-wrap gap-2">
                          {questionCounts.map((count) => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => setQuestionCount(count)}
                              className={`tool-chip ${questionCount === count ? 'tool-chip-active' : ''}`}
                            >
                              {count} 题
                            </button>
                          ))}
                        </div>
                        <div className="tool-panel-muted mt-5 text-sm leading-7 text-slate-600">
                          至少需要 4 个词才能开始。词汇不足时，会自动按当前范围可用词汇生成较少题目。
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                      <button
                        type="button"
                        onClick={() => router.push('/tools')}
                        className="tool-button-secondary flex-1"
                      >
                        返回
                      </button>
                      <button
                        type="button"
                        onClick={startGame}
                        disabled={loading || (sourceMode === 'textbook' && (!selectedTextbook || !selectedLesson))}
                        className="tool-button-primary flex-1"
                      >
                        {loading ? '准备中...' : '开始追捕'}
                      </button>
                    </div>
                  </section>

                  <aside className="tool-panel h-fit">
                    <h2 className="tool-section-title">游戏规则</h2>
                    <div className="space-y-3 text-sm leading-7 text-slate-600">
                      <p>每题 4 个选项，答对加 10 分，连击会获得额外分数。</p>
                      <p>答错会拉开距离，结果页会整理错词，方便回头复习。</p>
                      <p>第一版先做选择题追逐，后续可以继续加听音辨词、声调追捕、排行榜。</p>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {isPlaying && currentQuestion && (
              <div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={resetToSettings} className="tool-back mb-0 w-fit">
                    <span aria-hidden="true">←</span>
                    返回设置
                  </button>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="tool-chip px-3 py-1 text-xs">{sourceLabel}</span>
                    <span className="tool-chip px-3 py-1 text-xs">
                      {questionMode === 'jp-to-zh' ? '日语选中文' : '中文选日语'}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <section className="tool-panel">
                    <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className="tool-stat">
                        <div className="tool-stat-label">得分</div>
                        <div className="tool-stat-value">{stats.score}</div>
                      </div>
                      <div className="tool-stat">
                        <div className="tool-stat-label">正确</div>
                        <div className="tool-stat-value">{stats.correct}</div>
                      </div>
                      <div className="tool-stat">
                        <div className="tool-stat-label">连击</div>
                        <div className="tool-stat-value">{stats.streak}</div>
                      </div>
                      <div className="tool-stat">
                        <div className="tool-stat-label">进度</div>
                        <div className="tool-stat-value">{currentIndex + 1}/{totalQuestions}</div>
                      </div>
                    </div>

                    <div className="tool-panel-muted mb-6 overflow-hidden">
                      <ChaseScene
                        chaseProgress={chaseProgress}
                        thiefProgress={thiefProgress}
                        feedback={feedback}
                        caught={caught}
                      />
                    </div>

                    <div className="mb-6 text-center">
                      <div className="mb-3 text-sm font-semibold text-slate-500">
                        {questionMode === 'jp-to-zh' ? '请选择对应的中文释义' : '请选择对应的日语单词'}
                      </div>
                      <div className="text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                        {currentQuestion.prompt}
                      </div>
                      {currentQuestion.promptHint && (
                        <div className="mt-3 text-base font-medium text-slate-500">
                          {currentQuestion.promptHint}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {currentQuestion.options.map((option) => {
                        const isSelected = selectedOptionId === option.id;
                        const isCorrectAnswer = option.id === currentQuestion.answer.id;
                        const showCorrect = selectedOptionId !== null && isCorrectAnswer;
                        const showWrong = isSelected && feedback === 'wrong';

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleAnswer(option)}
                            disabled={selectedOptionId !== null}
                            className={`rounded-lg border bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-default disabled:hover:translate-y-0 ${
                              showCorrect
                                ? 'border-emerald-300 bg-emerald-50'
                                : showWrong
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/50'
                            }`}
                          >
                            <div className="text-base font-bold text-slate-900">{option.label}</div>
                            {selectedOptionId !== null && option.detailLabel && (
                              <div className="mt-1 text-xs font-medium text-slate-500">{option.detailLabel}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <aside className="tool-panel h-fit">
                    <h2 className="tool-section-title">追捕状态</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                          <span>警察距离</span>
                          <span>{caught ? '已追上' : `${Math.round(chaseProgress)}%`}</span>
                        </div>
                        <div className="tool-progress">
                          <div className="tool-progress-fill" style={{ width: `${chaseProgress}%` }} />
                        </div>
                      </div>
                      <div className="tool-panel-muted">
                        <div className={`text-lg font-bold ${feedback === 'correct' ? 'text-emerald-600' : feedback === 'wrong' ? 'text-red-600' : 'text-slate-800'}`}>
                          {feedback === 'correct' ? '追近一步' : feedback === 'wrong' ? '小偷跑远了' : '选择正确答案开始追捕'}
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          连续答对会提高追捕速度，答错会在结果页记录错词。
                        </p>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {showResult && (
              <div>
                <button type="button" onClick={resetToSettings} className="tool-back">
                  <span aria-hidden="true">←</span>
                  返回设置
                </button>

                <div className="mx-auto max-w-4xl">
                  <div className="mb-8 text-center">
                    <span className="tool-eyebrow">追捕结束</span>
                    <h1 className="tool-title">{accuracy >= 80 ? '成功抓到小偷' : '差一点就追上了'}</h1>
                    <p className="tool-description mx-auto">
                      {accuracy >= 80 ? '这轮词汇反应很稳，可以继续提高题量。' : '先把错词再过一遍，下一轮会追得更快。'}
                    </p>
                  </div>

                  <div className="tool-panel mb-6">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className="tool-stat">
                        <div className="tool-stat-label">得分</div>
                        <div className="tool-stat-value">{stats.score}</div>
                      </div>
                      <div className="tool-stat">
                        <div className="tool-stat-label">正确率</div>
                        <div className="tool-stat-value">{accuracy}%</div>
                      </div>
                      <div className="tool-stat">
                        <div className="tool-stat-label">正确</div>
                        <div className="tool-stat-value">{stats.correct}</div>
                      </div>
                      <div className="tool-stat">
                        <div className="tool-stat-label">最佳连击</div>
                        <div className="tool-stat-value">{stats.bestStreak}</div>
                      </div>
                    </div>

                    {stats.mistakes.length > 0 && (
                      <div className="mt-8">
                        <h2 className="tool-section-title">错词回顾</h2>
                        <div className="max-h-72 space-y-3 overflow-y-auto">
                          {stats.mistakes.map((item, index) => (
                            <div key={`${item.word.id}-${index}`} className="rounded-lg border border-slate-200 bg-white p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="text-lg font-bold text-slate-900">{item.word.japanese}</div>
                                  {item.word.pronunciation && (
                                    <div className="text-sm text-slate-500">{item.word.pronunciation}</div>
                                  )}
                                </div>
                                {item.word.level && (
                                  <span className="tool-chip px-2.5 py-1 text-xs">
                                    {formatVocabularyField('level', item.word.level)}
                                  </span>
                                )}
                              </div>
                              <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                <div>正确答案：<span className="font-semibold text-slate-900">{item.expected}</span></div>
                                <div>你的选择：<span className="font-semibold text-red-600">{item.selected}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex gap-3">
                      <button
                        type="button"
                        onClick={resetToSettings}
                        className="tool-button-secondary flex-1"
                      >
                        重新设置
                      </button>
                      <button
                        type="button"
                        onClick={startGame}
                        disabled={loading || gameWords.length < 4}
                        className="tool-button-primary flex-1"
                      >
                        再玩一次
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <style jsx global>{`
        .chase-scene {
          position: relative;
          height: 220px;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid #bfdbfe;
          background:
            radial-gradient(circle at 14% 18%, rgba(255, 255, 255, 0.9) 0 18px, transparent 19px),
            linear-gradient(#dbeafe 0%, #eff6ff 50%, #bfdbfe 51%, #bfdbfe 58%, #475569 59%, #334155 100%);
          box-shadow: inset 0 -16px 0 rgba(15, 23, 42, 0.12);
        }

        .chase-skyline {
          position: absolute;
          inset: 34px 0 78px;
          opacity: 0.9;
        }

        .chase-building {
          position: absolute;
          bottom: 0;
          width: 56px;
          border: 1px solid rgba(37, 99, 235, 0.18);
          background: #dbeafe;
          box-shadow: inset 0 8px 0 rgba(255, 255, 255, 0.45);
        }

        .chase-building-a {
          left: 5%;
          height: 62px;
        }

        .chase-building-b {
          left: 22%;
          height: 84px;
          width: 68px;
          background: #c7d2fe;
        }

        .chase-building-c {
          right: 22%;
          height: 68px;
          width: 64px;
          background: #e0f2fe;
        }

        .chase-building-d {
          right: 6%;
          height: 92px;
          width: 76px;
          background: #bfdbfe;
        }

        .chase-window {
          position: absolute;
          bottom: 34px;
          width: 8px;
          height: 8px;
          background: #fef3c7;
          box-shadow:
            16px 0 #fef3c7,
            0 18px #fef3c7,
            16px 18px #fef3c7;
        }

        .chase-window-a {
          left: calc(5% + 14px);
        }

        .chase-window-b {
          left: calc(22% + 18px);
          bottom: 50px;
        }

        .chase-window-c {
          right: calc(6% + 38px);
          bottom: 56px;
        }

        .chase-road {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 86px;
          background:
            linear-gradient(0deg, #1f2937 0 10px, transparent 10px),
            repeating-linear-gradient(90deg, transparent 0 52px, rgba(255, 255, 255, 0.86) 52px 92px, transparent 92px 144px),
            #334155;
          background-position: 0 0, 0 42px, 0 0;
          background-size: auto, 144px 8px, auto;
          animation: chase-road-move 1s linear infinite;
        }

        .chase-lane {
          position: absolute;
          bottom: 16px;
          width: 42px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          animation: chase-lane-move 1.2s linear infinite;
        }

        .chase-lane-a { left: 8%; }
        .chase-lane-b { left: 32%; animation-delay: -0.3s; }
        .chase-lane-c { left: 56%; animation-delay: -0.6s; }
        .chase-lane-d { left: 80%; animation-delay: -0.9s; }

        .chase-runner {
          position: absolute;
          bottom: 36px;
          width: 88px;
          height: 112px;
          transform: translateX(-50%);
          transition: left 520ms cubic-bezier(0.2, 0.85, 0.28, 1.08);
          animation: chase-runner-bob 0.34s ease-in-out infinite alternate;
          filter: drop-shadow(0 14px 8px rgba(15, 23, 42, 0.24));
          z-index: 4;
        }

        .chase-thief {
          animation-duration: 0.3s;
          z-index: 5;
        }

        .chase-scene-correct .chase-police {
          animation-duration: 0.22s;
        }

        .chase-scene-wrong .chase-thief {
          animation-duration: 0.2s;
        }

        .chase-sprite-svg {
          display: block;
          width: 88px;
          height: 112px;
          image-rendering: crisp-edges;
        }

        .runner-arm,
        .runner-leg {
          transform-box: fill-box;
          transform-origin: 50% 0%;
        }

        .runner-arm-left,
        .runner-leg-right {
          animation: chase-limb-a 0.42s ease-in-out infinite alternate;
        }

        .runner-arm-right,
        .runner-leg-left {
          animation: chase-limb-b 0.42s ease-in-out infinite alternate;
        }

        .chase-nameplate {
          position: absolute;
          left: 50%;
          top: -18px;
          transform: translateX(-50%);
          border-radius: 999px;
          border: 1px solid #bfdbfe;
          background: rgba(239, 246, 255, 0.94);
          padding: 2px 8px;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .chase-nameplate-thief {
          border-color: #fde68a;
          background: rgba(255, 251, 235, 0.95);
          color: #b45309;
        }

        .chase-bubble {
          position: absolute;
          top: 22px;
          left: 50%;
          z-index: 8;
          transform: translateX(-50%);
          border-radius: 12px;
          padding: 8px 14px;
          font-size: 14px;
          font-weight: 900;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.16);
          animation: chase-bubble-pop 0.85s ease-out both;
        }

        .chase-bubble-correct {
          border: 1px solid #86efac;
          background: #dcfce7;
          color: #15803d;
        }

        .chase-bubble-wrong {
          border: 1px solid #fecaca;
          background: #fee2e2;
          color: #b91c1c;
        }

        .chase-caught-badge {
          position: absolute;
          top: 18px;
          right: 18px;
          z-index: 8;
          border-radius: 999px;
          border: 1px solid #86efac;
          background: rgba(220, 252, 231, 0.95);
          padding: 6px 12px;
          color: #15803d;
          font-size: 12px;
          font-weight: 900;
        }

        @keyframes chase-runner-bob {
          from { transform: translateX(-50%) translateY(0); }
          to { transform: translateX(-50%) translateY(-5px); }
        }

        @keyframes chase-limb-a {
          from { transform: rotate(-18deg); }
          to { transform: rotate(22deg); }
        }

        @keyframes chase-limb-b {
          from { transform: rotate(20deg); }
          to { transform: rotate(-20deg); }
        }

        @keyframes chase-road-move {
          from { background-position: 0 0, 0 42px, 0 0; }
          to { background-position: 0 0, -144px 42px, 0 0; }
        }

        @keyframes chase-lane-move {
          from { transform: translateX(0); }
          to { transform: translateX(-150px); }
        }

        @keyframes chase-bubble-pop {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.92); }
          18% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-18px) scale(1); }
        }

        @media (max-width: 640px) {
          .chase-scene {
            height: 190px;
          }

          .chase-runner,
          .chase-sprite-svg {
            width: 70px;
            height: 90px;
          }

          .chase-runner {
            bottom: 34px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chase-road,
          .chase-lane,
          .chase-runner,
          .runner-arm-left,
          .runner-arm-right,
          .runner-leg-left,
          .runner-leg-right,
          .chase-bubble {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PoliceCatchThief;
