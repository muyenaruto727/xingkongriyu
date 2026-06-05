import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
  const [vocabList, setVocabList] = useState([]);
  const [articleList, setArticleList] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [usedItems, setUsedItems] = useState([]);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vocabData, articleData] = await Promise.all([
        api.getVocabList({ limit: 1000 }),
        api.getArticleList({ limit: 1000 })
      ]);
      setVocabList(vocabData.data || vocabData || []);
      setArticleList(articleData.data || articleData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

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
      setIsPlaying(true);
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
        const filtered = vocabList.filter(vocab => vocab.level === selectedLevel);
        const items = filtered.slice(0, wordCount);
        setFilteredItems(items);
        getNextItem(items, []);
      } else {
        const randomArticle = await api.getRandomArticle(articleLevel);
        setFilteredItems([randomArticle]);
        setCurrentItem({
          id: randomArticle.id,
          japanese: randomArticle.content.trim(),
          meaning: randomArticle.title,
          pronunciation: ''
        });
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      setIsPlaying(false);
      setShowResult(true);
    }
  };

  const getNextItem = (items, usedItems) => {
    if (items.length === 0) {
      endGame();
      return;
    }
    const availableItems = items.filter(item => !usedItems.includes(item.id));
    if (availableItems.length === 0) {
      endGame();
      return;
    }
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const selectedItem = availableItems[randomIndex];

    if (gameMode === 'word') {
      setCurrentItem({
        id: selectedItem.id,
        japanese: selectedItem.japanese,
        meaning: selectedItem.chinese,
        pronunciation: selectedItem.pronunciation
      });
    } else {
      const sentences = selectedItem.content.split('。').filter(s => s.trim() !== '');
      if (sentences.length > 0) {
        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        setCurrentItem({
          id: selectedItem.id,
          japanese: randomSentence.trim() + '。',
          meaning: selectedItem.title,
          pronunciation: ''
        });
      } else {
        getNextItem(items, usedItems);
        return;
      }
    }
    const newUsedItems = [...usedItems, selectedItem.id];
    setUsedItems(newUsedItems);
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
        if (gameMode === 'word') {
          getNextItem(filteredItems, usedItems);
        } else {
          endGame();
        }
      }
    }
  };

  const skipItem = () => {
    if (currentItem) {
      setWrongCount(prev => prev + 1);
      setGameHistory(prev => [...prev, { ...currentItem, correct: false }]);
      if (gameMode === 'word') {
        getNextItem(filteredItems, usedItems);
      } else {
        endGame();
      }
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <Head>
        <title>打字游戏 — 星空日语</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main className="pt-28 pb-8 md:pt-36 md:pb-12">
        <div className="container max-w-3xl">

          {/* ── Settings Page ── */}
          {!isPlaying && !showResult && (
            <div>
              {/* Hero header */}
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-600 ring-1 ring-purple-200 mb-4">
                  ⌨️ 打字游戏
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                  日语打字练习
                </h1>
                <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
                  选择模式与难度，通过键盘输入来练习日语单词和句子
                </p>
              </div>

              {/* Settings card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-8">
                {/* Mode selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">选择模式</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setGameMode('word')}
                      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                        gameMode === 'word'
                          ? 'border-purple-400 bg-purple-50 shadow-md shadow-purple-100/50'
                          : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">📝</div>
                      <div className="font-bold text-gray-800">单词模式</div>
                      <div className="text-xs text-gray-400 mt-1">练习日语单词输入</div>
                      {gameMode === 'word' && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setGameMode('sentence')}
                      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                        gameMode === 'sentence'
                          ? 'border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100/50'
                          : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">📖</div>
                      <div className="font-bold text-gray-800">文章模式</div>
                      <div className="text-xs text-gray-400 mt-1">练习日语句子输入</div>
                      {gameMode === 'sentence' && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all"
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all"
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
                      { key: 'easy', label: '简单', desc: gameMode === 'sentence' ? '15分钟' : '90秒', color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', dot: 'bg-emerald-500' },
                      { key: 'medium', label: '中等', desc: gameMode === 'sentence' ? '10分钟' : '60秒', color: 'amber', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', dot: 'bg-amber-500' },
                      { key: 'hard', label: '困难', desc: gameMode === 'sentence' ? '5分钟' : '45秒', color: 'rose', bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', dot: 'bg-rose-500' },
                    ].map(d => (
                      <button
                        key={d.key}
                        onClick={() => setDifficulty(d.key)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          difficulty === d.key
                            ? `${d.border} ${d.bg} shadow-sm`
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`text-sm font-bold ${difficulty === d.key ? d.text : 'text-gray-600'}`}>{d.label}</div>
                        <div className={`text-xs mt-1 ${difficulty === d.key ? d.text + '/70' : 'text-gray-400'}`}>{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action row */}
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/tools')}
                    className="group inline-flex items-center gap-2 px-5 py-4 rounded-2xl text-base font-semibold text-gray-500 bg-white border border-gray-200 hover:text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all duration-300 flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回
                  </button>
                  <button
                    onClick={startGame}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-200/50 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    开始游戏
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Game Playing ── */}
          {isPlaying && currentItem && (
            <div>
              {/* Stats bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">得分</div>
                      <div className="text-2xl font-extrabold text-purple-600">{score}</div>
                    </div>
                    <div className="w-px h-10 bg-gray-100" />
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">正确</div>
                      <div className="text-2xl font-extrabold text-emerald-500">{correctCount}</div>
                    </div>
                    <div className="w-px h-10 bg-gray-100" />
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">错误</div>
                      <div className="text-2xl font-extrabold text-red-400">{wrongCount}</div>
                    </div>
                  </div>
                  <div className={`text-center px-4 py-2 rounded-xl ${timeLeft <= 30 ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">剩余时间</div>
                    <div className={`text-2xl font-extrabold font-mono ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                      {timeLeft >= 60
                        ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                        : `${timeLeft}s`
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Question card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-4">
                {/* Meaning hint */}
                <div className="text-center mb-6">
                  <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold mb-3">
                    {gameMode === 'word' ? '单词模式' : '文章模式'}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{currentItem.meaning}</h3>
                  {currentItem.pronunciation && (
                    <p className="text-sm text-purple-500 font-medium">{currentItem.pronunciation}</p>
                  )}
                </div>

                {/* Target text with character highlighting */}
                <div className={`p-5 rounded-xl mb-6 border-2 ${gameMode === 'sentence' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
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
                            ? 'ring-2 ring-purple-300 bg-purple-50'
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
                      className="w-full px-6 py-4 text-lg font-medium border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all placeholder:text-gray-300 resize-none"
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
                      className="w-full px-6 py-4 text-lg text-center font-medium border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all placeholder:text-gray-300"
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
                    className="px-5 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    跳过
                  </button>
                  <button
                    onClick={endGame}
                    className="px-5 py-2.5 bg-red-50 text-red-500 font-medium rounded-xl hover:bg-red-100 transition-colors"
                  >
                    结束游戏
                  </button>
                  <button
                    onClick={goBackToSettings}
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:text-gray-700 hover:border-gray-300 transition-all duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回设置
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
                <span className="inline-block text-4xl mb-4">🎉</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">游戏结束</h2>
                <p className="text-gray-500">
                  {calculateAccuracy() >= 80 ? '太厉害了！继续保持！' : calculateAccuracy() >= 50 ? '还不错，再练练会更好！' : '加油，多多练习！'}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 text-center border border-purple-100">
                  <div className="text-xs text-purple-400 uppercase tracking-wider font-semibold mb-1">最终得分</div>
                  <div className="text-3xl font-extrabold text-purple-600">{score}</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 text-center border border-emerald-100">
                  <div className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-1">正确率</div>
                  <div className="text-3xl font-extrabold text-emerald-600">{calculateAccuracy()}%</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 text-center border border-blue-100">
                  <div className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-1">正确数</div>
                  <div className="text-3xl font-extrabold text-blue-600">{correctCount}</div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-5 text-center border border-rose-100">
                  <div className="text-xs text-rose-400 uppercase tracking-wider font-semibold mb-1">错误数</div>
                  <div className="text-3xl font-extrabold text-rose-600">{wrongCount}</div>
                </div>
              </div>

              {/* History */}
              {gameHistory.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">答题记录</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {gameHistory.slice(-15).reverse().map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                          item.correct ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
                        }`}
                      >
                        <span className={`font-medium truncate mr-4 ${item.correct ? 'text-gray-700' : 'text-gray-700'}`}>
                          {item.japanese}
                        </span>
                        <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${item.correct ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
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
                  onClick={() => router.push('/tools')}
                  className="group inline-flex items-center gap-2 px-5 py-4 rounded-2xl text-base font-semibold text-gray-500 bg-white border border-gray-200 hover:text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all duration-300 flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回
                </button>
                <button
                  onClick={goBackToSettings}
                  className="flex-1 py-4 bg-white text-gray-600 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  返回设置
                </button>
                <button
                  onClick={startGame}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-300"
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
