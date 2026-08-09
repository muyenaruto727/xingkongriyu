import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message } from 'antd';
import Navigation from '../../components/layout/Navigation';
import { api } from '../../lib/api';

const cardColors = [
  { bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-800' },
  { bg: 'bg-[#fafaf7]', border: 'border-slate-200', text: 'text-slate-800' },
];

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TetrisGame = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [pairCount, setPairCount] = useState(8);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shakeCard, setShakeCard] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];
  const pairOptions = [4, 8, 12, 16];

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  useEffect(() => {
    let timer;
    if (isPlaying && !showResult) {
      timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, showResult]);

  const startGame = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const data = await api.getVocabList({ level: selectedLevel, limit: 1000 });
      const list = data.data || data || [];
      const levelVocab = (Array.isArray(list) ? list : []).filter(v => v.level === selectedLevel);
      const selected = shuffleArray(levelVocab).slice(0, pairCount);

      // If not enough vocab, fill with what we have.
      const actualCount = Math.min(selected.length, pairCount);
      if (actualCount === 0) {
        message.warning('当前配置没有可用词汇，请换一个等级后再试');
        return;
      }

      const gameCards = [];
      const usedVocab = selected.slice(0, actualCount);

      usedVocab.forEach((vocab, index) => {
        const color = cardColors[index % cardColors.length];
        // Japanese card
        gameCards.push({
          id: `j-${vocab.id}`,
          pairId: vocab.id,
          type: 'japanese',
          text: vocab.japanese,
          subText: vocab.pronunciation || '',
          color,
          matched: false,
        });
        // Chinese card
        gameCards.push({
          id: `c-${vocab.id}`,
          pairId: vocab.id,
          type: 'chinese',
          text: vocab.chinese,
          subText: '',
          color,
          matched: false,
        });
      });

      setCards(shuffleArray(gameCards));
      setSelectedCard(null);
      setMatchedPairs([]);
      setScore(0);
      setMoves(0);
      setCorrectMatches(0);
      setWrongAttempts(0);
      setElapsedTime(0);
      setShowResult(false);
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
      setShowResult(false);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedLevel, pairCount]);

  const handleCardClick = (card) => {
    if (card.matched || shakeCard) return;
    if (selectedCard && selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    // Second card selected — check match
    if (selectedCard.type === card.type) {
      // Same type — switch selection
      setSelectedCard(card);
      return;
    }

    setMoves(prev => prev + 1);

    if (selectedCard.pairId === card.pairId) {
      // Correct match!
      setScore(prev => prev + 10);
      setCorrectMatches(prev => prev + 1);
      setMatchedPairs(prev => [...prev, card.pairId]);
      setCards(prev => prev.map(c =>
        c.pairId === card.pairId ? { ...c, matched: true } : c
      ));
      setSelectedCard(null);

      // Check if all matched
      const newMatched = [...matchedPairs, card.pairId];
      if (newMatched.length === pairCount || newMatched.length === cards.length / 2) {
        setTimeout(() => {
          setIsPlaying(false);
          setShowResult(true);
        }, 600);
      }
    } else {
      // Wrong match
      setScore(prev => Math.max(0, prev - 2));
      setWrongAttempts(prev => prev + 1);
      setShakeCard(card.id);
      setTimeout(() => {
        setShakeCard(null);
        setSelectedCard(null);
      }, 500);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="tool-page">
      <Head>
        <title>单词消消乐 — 星空日语</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main className="tool-main">
        <div className="container max-w-4xl">

          {/* ── Settings ── */}
          {!isPlaying && !showResult && (
            <div>
              <div className="mb-8">
                <span className="tool-eyebrow">单词消消乐</span>
                <h1 className="tool-title">
                  单词配对消除
                </h1>
                <p className="tool-description">
                  将日语单词与中文释义配对消除，在游戏中巩固单词记忆
                </p>
              </div>

              <div className="tool-panel mb-8">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">配对数量</label>
                    <select
                      value={pairCount}
                      onChange={(e) => setPairCount(Number(e.target.value))}
                      className="tool-input"
                    >
                      {pairOptions.map(count => (
                        <option key={count} value={count}>{count} 对</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* How to play */}
                <div className="tool-panel-muted mb-8">
                  <h4 className="tool-section-title">游戏规则</h4>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      点击一张<span className="font-semibold text-slate-800">日语单词</span>卡片，再点击对应的<span className="font-semibold text-slate-800">中文释义</span>卡片
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      配对正确：+10分，两张卡片消除
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      配对错误：-2分，重新选择
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      消除所有卡片即为胜利
                    </li>
                  </ul>
                </div>

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
          {isPlaying && !showResult && (
            <div>
              {/* Stats bar */}
              <div className="tool-panel mb-6 p-4 md:p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="tool-stat">
                    <div className="tool-stat-label">得分</div>
                    <div className="tool-stat-value">{score}</div>
                  </div>
                  <div className="tool-stat">
                    <div className="tool-stat-label">步数</div>
                    <div className="tool-stat-value">{moves}</div>
                  </div>
                  <div className="tool-stat">
                    <div className="tool-stat-label">已配对</div>
                    <div className="tool-stat-value">{correctMatches}/{cards.length / 2}</div>
                  </div>
                  <div className="tool-stat">
                    <div className="tool-stat-label">用时</div>
                    <div className="tool-stat-value font-mono">{formatTime(elapsedTime)}</div>
                  </div>
                </div>
              </div>

              {/* Cards grid */}
              <div className={`grid gap-2 mb-8 ${
                cards.length <= 8 ? 'grid-cols-4' :
                cards.length <= 16 ? 'grid-cols-8' :
                cards.length <= 24 ? 'grid-cols-8' : 'grid-cols-8'
              }`}>
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    disabled={card.matched}
                    className={`
                      relative aspect-square rounded-md font-bold transition-all duration-200
                      flex flex-col items-center justify-center p-1.5 text-center
                      ${card.matched
                        ? 'opacity-0 scale-75 pointer-events-none'
                        : selectedCard?.id === card.id
                        ? 'ring-2 ring-blue-300 bg-blue-50 scale-[1.02] z-10'
                        : card.type === 'japanese'
                        ? 'bg-white border border-slate-200 hover:border-slate-400 hover:-translate-y-0.5'
                        : 'bg-[#fafaf7] border border-slate-200 hover:border-slate-400 hover:-translate-y-0.5'
                      }
                      ${shakeCard === card.id ? 'animate-[shake_0.5s_ease-in-out]' : ''}
                    `}
                  >
                    <span className={`text-[11px] md:text-xs font-bold leading-tight ${
                      card.type === 'japanese' ? 'text-slate-900' : 'text-slate-700'
                    }`}>
                      {card.text}
                    </span>
                    {card.subText && (
                      <span className="text-[9px] text-gray-400 mt-0.5">{card.subText}</span>
                    )}
                    {/* Type indicator */}
                    <span className={`absolute top-1 right-1 rounded-sm px-1 py-0 text-[8px] font-bold ${
                      card.type === 'japanese'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-stone-100 text-stone-500'
                    }`}>
                      {card.type === 'japanese' ? '日' : '中'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>进度</span>
                  <span>{Math.round((correctMatches / (cards.length / 2)) * 100)}%</span>
                </div>
                <div className="tool-progress">
                  <div
                    className="tool-progress-fill"
                    style={{ width: `${(correctMatches / (cards.length / 2)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setShowResult(false);
                  }}
                  className="tool-button-danger"
                >
                  结束游戏
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setShowResult(false);
                  }}
                  className="tool-button-secondary"
                >
                  返回
                </button>
              </div>
            </div>
          )}

          {/* ── Results ── */}
          {showResult && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                  {correctMatches === cards.length / 2 ? '完成配对' : '游戏结束'}
                </h2>
                <p className="text-gray-500">
                  {correctMatches === cards.length / 2
                    ? '所有单词都已正确配对。'
                    : `已配对 ${correctMatches}/${cards.length / 2} 对单词`
                  }
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="tool-stat p-5">
                  <div className="tool-stat-label">最终得分</div>
                  <div className="tool-stat-value text-3xl">{score}</div>
                </div>
                <div className="tool-stat p-5">
                  <div className="tool-stat-label">正确配对</div>
                  <div className="tool-stat-value text-3xl">{correctMatches}</div>
                </div>
                <div className="tool-stat p-5">
                  <div className="tool-stat-label">总步数</div>
                  <div className="tool-stat-value text-3xl">{moves}</div>
                </div>
                <div className="tool-stat p-5">
                  <div className="tool-stat-label">用时</div>
                  <div className="tool-stat-value text-3xl font-mono">{formatTime(elapsedTime)}</div>
                </div>
              </div>

              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setShowResult(false);
                  }}
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

      {/* Shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default TetrisGame;
