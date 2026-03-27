import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../components/layout/Navigation';
import { api } from '../lib/api';

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
  const [articleLevel, setArticleLevel] = useState('初级1');
  const [vocabList, setVocabList] = useState([]);
  const [articleList, setArticleList] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [usedItems, setUsedItems] = useState([]);
  const inputRef = useRef(null);

  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];
  const articleLevels = ['初级1', '初级2', '中级1', '中级2', '高级1', '高级2'];
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
        api.getVocabList(),
        api.getArticleList()
      ]);
      setVocabList(vocabData.data || []);
      setArticleList(articleData.data || []);
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
      // 根据游戏模式和难度设置时间
    if (gameMode === 'sentence') {
      // 文章模式：简单15分钟，中等10分钟，困难5分钟
      setTimeLeft(difficulty === 'easy' ? 900 : difficulty === 'medium' ? 600 : 300);
    } else {
      // 单词模式：保持原有设置
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
        // 从服务器获取随机文章
        const randomArticle = await api.getRandomArticle(articleLevel);
        setFilteredItems([randomArticle]);
        // 对于文章模式，直接使用整篇文章
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

    // 随机选择一个未使用的项目
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
      // 对于文章，随机选择一个句子
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
      // 文章模式下，实现字符级别的错误计数
      if (gameMode === 'sentence' && value.length > 0) {
        const currentChar = value[value.length - 1];
        const expectedChar = currentItem.japanese[value.length - 1];
        
        if (currentChar !== expectedChar) {
          // 只在字符错误时增加错误计数，避免重复计数
          setWrongCount(prev => prev + 1);
        }
      }

      if (value === currentItem.japanese) {
        setScore(score + (gameMode === 'word' ? 10 : 50)); // 文章模式得分更高
        setCorrectCount(correctCount + 1);
        setGameHistory([...gameHistory, { ...currentItem, correct: true }]);
        
        if (gameMode === 'word') {
          getNextItem(filteredItems, usedItems);
        } else {
          // 文章模式完成后直接结束游戏
          endGame();
        }
      }
    }
  };

  const skipItem = () => {
    if (currentItem) {
      setWrongCount(wrongCount + 1);
      setGameHistory([...gameHistory, { ...currentItem, correct: false }]);
      
      if (gameMode === 'word') {
        getNextItem(filteredItems, usedItems);
      } else {
        // 文章模式跳过直接结束游戏
        endGame();
      }
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    setShowResult(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/');
  };

  const calculateAccuracy = () => {
    const total = correctCount + wrongCount;
    return total > 0 ? Math.round((correctCount / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Head>
        <title>日语打字游戏</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-primary hover:text-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          


          {!isPlaying && !showResult && (
            <div className="max-w-2xl mx-auto">
              <div className="card p-8 border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-center">游戏设置</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">选择模式</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setGameMode('word')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        gameMode === 'word'
                          ? 'border-primary bg-blue-50 text-primary'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <div className="text-4xl mb-2">📝</div>
                      <div className="font-semibold">单词模式</div>
                      <div className="text-sm text-gray-500 mt-1">练习单词输入</div>
                    </button>
                    <button
                      onClick={() => setGameMode('sentence')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        gameMode === 'sentence'
                          ? 'border-primary bg-blue-50 text-primary'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <div className="text-4xl mb-2">📖</div>
                      <div className="font-semibold">文章模式</div>
                      <div className="text-sm text-gray-500 mt-1">练习句子输入</div>
                    </button>
                  </div>
                </div>

                {gameMode === 'word' && (
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">词汇等级</label>
                        <select
                          value={selectedLevel}
                          onChange={(e) => setSelectedLevel(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                        >
                          {levels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">词汇数量</label>
                        <select
                          value={wordCount}
                          onChange={(e) => setWordCount(Number(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                        >
                          {wordCounts.map(count => (
                            <option key={count} value={count}>{count}个</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {gameMode === 'sentence' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">文章难度</label>
                    <select
                      value={articleLevel}
                      onChange={(e) => setArticleLevel(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    >
                      {articleLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">选择难度</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setDifficulty('easy')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        difficulty === 'easy'
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-gray-200 hover:border-green-500'
                      }`}
                    >
                      <div className="font-semibold">简单</div>
                      <div className="text-xs text-gray-500 mt-1">{gameMode === 'sentence' ? '15分钟' : '90秒'}</div>
                    </button>
                    <button
                      onClick={() => setDifficulty('medium')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        difficulty === 'medium'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-600'
                          : 'border-gray-200 hover:border-yellow-500'
                      }`}
                    >
                      <div className="font-semibold">中等</div>
                      <div className="text-xs text-gray-500 mt-1">{gameMode === 'sentence' ? '10分钟' : '60秒'}</div>
                    </button>
                    <button
                      onClick={() => setDifficulty('hard')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        difficulty === 'hard'
                          ? 'border-red-500 bg-red-50 text-red-600'
                          : 'border-gray-200 hover:border-red-500'
                      }`}
                    >
                      <div className="font-semibold">困难</div>
                      <div className="text-xs text-gray-500 mt-1">{gameMode === 'sentence' ? '5分钟' : '45秒'}</div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  开始游戏
                </button>
              </div>
            </div>
          )}

          {isPlaying && currentItem && (
            <div className="max-w-3xl mx-auto">
              <div className="card p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">得分</div>
                      <div className="text-3xl font-bold text-primary">{score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">正确</div>
                      <div className="text-2xl font-bold text-green-500">{correctCount}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">错误</div>
                      <div className="text-2xl font-bold text-red-500">{wrongCount}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">剩余时间</div>
                    <div className={`text-3xl font-bold ${timeLeft <= 60 ? 'text-red-500' : 'text-dark'}`}>
                      {timeLeft >= 60 
                        ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` 
                        : `${timeLeft}s`
                      }
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">{currentItem.meaning}</h3>
                    {currentItem.pronunciation && (
                      <div className="text-lg text-primary font-medium">
                        {currentItem.pronunciation}
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-6 border-2 rounded-lg mb-6 ${gameMode === 'sentence' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                    <div className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {currentItem.japanese.split('').map((char, index) => (
                        <span 
                          key={index} 
                          className={`${index < userInput.length ? (userInput[index] === char ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50') : 'text-gray-800'}`}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="输入日语..."
                    className="w-full px-6 py-4 text-xl text-center border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={skipItem}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    跳过
                  </button>
                  <button
                    onClick={endGame}
                    className="px-6 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    结束游戏
                  </button>
                </div>
              </div>
            </div>
          )}

          {showResult && (
            <div className="max-w-2xl mx-auto">
              <div className="card p-8 border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-center">游戏结束</h3>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">最终得分</div>
                    <div className="text-4xl font-bold text-primary">{score}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">正确率</div>
                    <div className="text-4xl font-bold text-green-500">{calculateAccuracy()}%</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">正确数</div>
                    <div className="text-4xl font-bold text-purple-500">{correctCount}</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">错误数</div>
                    <div className="text-4xl font-bold text-red-500">{wrongCount}</div>
                  </div>
                </div>

                {gameHistory.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">答题记录</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {gameHistory.slice(-10).reverse().map((item, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            item.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{item.japanese}</div>
                            <span className={`text-sm ${item.correct ? 'text-green-600' : 'text-red-600'}`}>
                              {item.correct ? '✓ 正确' : '✗ 错误'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={startGame}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    再玩一次
                  </button>
                  <button
                    onClick={() => setShowResult(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    返回设置
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TypingGame;
