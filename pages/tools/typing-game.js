import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message } from 'antd';
import Navigation from '../../components/layout/Navigation';
import { api } from '../../lib/api';

const TypingGame = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [gameMode, setGameMode] = useState('word');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameHistory, setGameHistory] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [wordCount, setWordCount] = useState(20);
  const [articleLevel, setArticleLevel] = useState('N5');
  const [filteredItems, setFilteredItems] = useState([]);
  const [usedItems, setUsedItems] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const inputRef = useRef(null);

  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];
  const articleLevels = [
    { label: '初级 (N5)', value: 'N5' },
    { label: '初级 (N4)', value: 'N4' },
    { label: '中级 (N3)', value: 'N3' },
    { label: '中级 (N2)', value: 'N2' },
    { label: '高级 (N1)', value: 'N1' },
  ];
  const wordCounts = [10, 20, 30, 40, 50];

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (isPlaying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPlaying, currentItem]);

  const startGame = async () => {
    try {
      setIsLoadingData(true);
      setScore(0);
      setCorrectCount(0);
      setWrongCount(0);
      if (gameMode === 'sentence') {
        setTimeLeft(difficulty === 'easy' ? 900 : difficulty === 'medium' ? 600 : 300);
      } else {
        setTimeLeft(difficulty === 'easy' ? 90 : difficulty === 'medium' ? 60 : 45);
      }
      setGameHistory([]);
      setShowResult(false);
      setUserInput('');
      setUsedItems([]);

      if (gameMode === 'word') {
        const vocabData = await api.getVocabList({ level: selectedLevel, limit: 1000 });
        const vocabList = vocabData.data || vocabData || [];
        const filtered = (Array.isArray(vocabList) ? vocabList : []).filter(vocab => vocab.level === selectedLevel);
        const items = filtered.slice(0, wordCount);
        if (items.length === 0) {
          message.warning('当前配置没有可用词汇，请换一个等级后再试');
          return;
        }
        setFilteredItems(items);
        getNextItem(items, []);
      } else {
        const response = await api.getRandomArticle(articleLevel);
        if (!response || !response.content) {
          message.warning('当前难度暂无可练习的文章，请换一个难度后再试');
          return;
        }
        // 将文章拆成句子，逐句练习
        const sentences = response.content
          .split(/[。！？\n]+/)
          .filter(s => s.trim().length > 0)
          .map((s, i) => ({
            id: `s-${i}`,
            japanese: s.trim() + '。',
            meaning: response.title || '',
            pronunciation: '',
          }));
        if (sentences.length === 0) {
          message.warning('当前文章没有可练习的句子，请换一个难度后再试');
          return;
        }
        setFilteredItems(sentences);
        getNextItem(sentences, []);
      }
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
      setShowResult(false);
    } finally {
      setIsLoadingData(false);
    }
  };

  const getNextItem = (items, usedIds) => {
    const available = items.filter(item => !usedIds.includes(item.id));
    if (available.length === 0) {
      endGame();
      return;
    }
    const next = available[Math.floor(Math.random() * available.length)];
    setCurrentItem(next);
    setUsedItems([...usedIds, next.id]);
    setUserInput('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    if (currentItem) {
      if (value.trim() === (currentItem.japanese || '').trim()) {
        setScore(prev => prev + (gameMode === 'word' ? 10 : 50));
        setCorrectCount(prev => prev + 1);
        setGameHistory(prev => [...prev, { ...currentItem, correct: true }]);
        getNextItem(filteredItems, usedItems);
      }
    }
  };

  const skipItem = () => {
    if (currentItem) {
      setWrongCount(prev => prev + 1);
      setGameHistory(prev => [...prev, { ...currentItem, correct: false }]);
      getNextItem(filteredItems, usedItems);
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    setShowResult(true);
  };

  const goBackToSettings = () => {
    setIsPlaying(false);
    setShowResult(false);
  };

  const calculateAccuracy = () => {
    const total = correctCount + wrongCount;
    return total > 0 ? Math.round((correctCount / total) * 100) : 0;
  };

  return (
    <div className="tool-page">
      <Head>
        <title>打字游戏 — 星空日语</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main className="tool-main">
        <div className="container max-w-3xl">

          {/* ── Settings Page ── */}
          {!isPlaying && !showResult && (
            <div>
              {/* Hero header */}
              <div className="mb-8">
                <span className="tool-eyebrow">打字游戏</span>
                <h1 className="tool-title">
                  日语打字练习
                </h1>
                <p className="tool-description">
                  选择模式与难度，通过键盘输入来练习日语单词和句子
                </p>
              </div>

              {/* Settings card */}
              <div className="tool-panel mb-8">
                {/* Mode selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">选择模式</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setGameMode('word')}
                      className={`tool-choice ${
                        gameMode === 'word'
                          ? 'tool-choice-active'
                          : ''
                      }`}
                    >
                      <div className="font-bold text-gray-800">单词模式</div>
                      <div className="text-xs text-gray-400 mt-1">练习日语单词输入</div>
                      {gameMode === 'word' && (
                        <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-md bg-blue-500 text-white">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setGameMode('sentence')}
                      className={`tool-choice ${
                        gameMode === 'sentence'
                          ? 'tool-choice-active'
                          : ''
                      }`}
                    >
                      <div className="font-bold text-gray-800">文章模式</div>
                      <div className="text-xs text-gray-400 mt-1">练习日语句子输入</div>
                      {gameMode === 'sentence' && (
                        <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-md bg-blue-500 text-white">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Level / Count / Article level */}
                {gameMode === 'word' && (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">词汇等级</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="tool-input"
                      >
                        {levels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">词汇数量</label>
                      <select
                        value={wordCount}
                        onChange={(e) => setWordCount(Number(e.target.value))}
                        className="tool-input"
                      >
                        {wordCounts.map(count => (
                          <option key={count} value={count}>{count} 个</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {gameMode === 'sentence' && (
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">文章难度</label>
                    <select
                      value={articleLevel}
                      onChange={(e) => setArticleLevel(e.target.value)}
                      className="tool-input"
                    >
                      {articleLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Difficulty */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">难度选择</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'easy', label: '简单', desc: gameMode === 'sentence' ? '15分钟' : '90秒' },
                      { key: 'medium', label: '中等', desc: gameMode === 'sentence' ? '10分钟' : '60秒' },
                      { key: 'hard', label: '困难', desc: gameMode === 'sentence' ? '5分钟' : '45秒' },
                    ].map(d => (
                      <button
                        key={d.key}
                        onClick={() => setDifficulty(d.key)}
                        className={`tool-choice ${difficulty === d.key ? 'tool-choice-active' : ''}`}
                      >
                        <div className="text-sm font-bold text-slate-800">{d.label}</div>
                        <div className="mt-1 text-xs text-slate-500">{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action row */}
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/tools')}
                    className="tool-button-secondary flex-1"
                  >
                    ← 返回
                  </button>
                  <button
                    onClick={startGame}
                    disabled={isLoadingData}
                    className="tool-button-primary flex-1"
                  >
                    {isLoadingData ? '准备中...' : '开始游戏'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Game Playing ── */}
          {isPlaying && currentItem && (
            <div>
              {/* Stats bar */}
              <div className="tool-panel mb-4 p-4 md:p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="tool-stat">
                    <div className="tool-stat-label">得分</div>
                    <div className="tool-stat-value">{score}</div>
                  </div>
                  <div className="tool-stat">
                    <div className="tool-stat-label">正确</div>
                    <div className="tool-stat-value">{correctCount}</div>
                  </div>
                  <div className="tool-stat">
                    <div className="tool-stat-label">错误</div>
                    <div className="tool-stat-value">{wrongCount}</div>
                  </div>
                  <div className={`tool-stat ${timeLeft <= 30 ? 'border-red-200 bg-red-50' : ''}`}>
                    <div className="tool-stat-label">剩余时间</div>
                    <div className={`tool-stat-value font-mono ${timeLeft <= 30 ? 'text-red-600 animate-pulse' : ''}`}>
                      {timeLeft >= 60
                        ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                        : `${timeLeft}s`
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Question card */}
              <div className="tool-panel mb-4">
                {/* Meaning hint */}
                <div className="text-center mb-6">
                  <span className="tool-chip inline-flex mb-3">
                    {gameMode === 'word' ? '单词模式' : '文章模式'}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{currentItem.meaning}</h3>
                  {currentItem.pronunciation && (
                    <p className="text-sm text-slate-500 font-medium">{currentItem.pronunciation}</p>
                  )}
                </div>

                {/* Target text with character highlighting */}
                <div className="tool-panel-muted mb-6">
                  <p className="text-lg md:text-xl font-medium text-gray-700 leading-relaxed whitespace-pre-wrap break-all">
                    {currentItem.japanese.split('').map((char, index) => (
                      <span
                        key={index}
                        className={`inline-block min-w-[0.6em] text-center rounded-sm transition-colors ${
                          index < userInput.length
                            ? (userInput[index] === char
                              ? 'text-emerald-600 bg-emerald-100/60'
                              : 'text-red-500 bg-red-100/60')
                            : index === userInput.length
                            ? 'ring-2 ring-slate-300 bg-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </p>
                </div>

                {/* Input */}
                <div className="mb-4">
                  {gameMode === 'sentence' ? (
                    <textarea
                      ref={inputRef}
                      value={userInput}
                      onChange={handleInputChange}
                      placeholder="在此输入日语文章..."
                      rows={4}
                      className="tool-input text-lg font-medium resize-none"
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  ) : (
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={handleInputChange}
                      placeholder="在此输入日语..."
                      className="tool-input text-lg text-center font-medium"
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-center gap-3">
                  <button
                    onClick={skipItem}
                    className="tool-button-secondary"
                  >
                    跳过
                  </button>
                  <button
                    onClick={endGame}
                    className="tool-button-danger"
                  >
                    结束游戏
                  </button>
                  <button
                    onClick={goBackToSettings}
                    className="tool-button-secondary"
                  >
                    返回
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Results ── */}
          {showResult && (
            <div>
              {/* Result header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">游戏结束</h2>
                <p className="text-gray-500">
                  {calculateAccuracy() >= 80 ? '完成得很好，继续保持当前节奏。' : calculateAccuracy() >= 50 ? '基础已经建立，再练一轮会更稳。' : '先降低难度，把输入准确率练起来。'}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="tool-stat p-5">
                  <div className="tool-stat-label">最终得分</div>
                  <div className="tool-stat-value text-3xl">{score}</div>
                </div>
                <div className="tool-stat p-5">
                  <div className="tool-stat-label">正确率</div>
                  <div className="tool-stat-value text-3xl">{calculateAccuracy()}%</div>
                </div>
                <div className="tool-stat p-5">
                  <div className="tool-stat-label">正确数</div>
                  <div className="tool-stat-value text-3xl">{correctCount}</div>
                </div>
                <div className="tool-stat p-5">
                  <div className="tool-stat-label">错误数</div>
                  <div className="tool-stat-value text-3xl">{wrongCount}</div>
                </div>
              </div>

              {/* History */}
              {gameHistory.length > 0 && (
                <div className="tool-panel p-6 mb-6">
                  <h4 className="tool-section-title">答题记录</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {gameHistory.slice(-15).reverse().map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 text-sm"
                      >
                        <span className="font-medium truncate mr-4 text-gray-700">
                          {item.japanese}
                        </span>
                        <span className={`flex-shrink-0 rounded-md border px-2 py-1 text-xs font-bold ${
                          item.correct
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-600'
                        }`}>
                          {item.correct ? '✓ 正确' : '✗ 错误'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={goBackToSettings}
                  className="tool-button-secondary flex-1"
                >
                  返回
                </button>
                <button
                  onClick={startGame}
                  className="tool-button-primary flex-1"
                >
                  再玩一次
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default TypingGame;
