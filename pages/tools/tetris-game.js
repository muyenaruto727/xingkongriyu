import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../components/layout/Navigation';
import { api } from '../../lib/api';

const cardColors = [
  { from: 'from-indigo-400', to: 'to-blue-500', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
  { from: 'from-emerald-400', to: 'to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
  { from: 'from-amber-400', to: 'to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
  { from: 'from-purple-400', to: 'to-violet-500', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
  { from: 'from-rose-400', to: 'to-pink-500', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
  { from: 'from-cyan-400', to: 'to-sky-500', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600' },
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
  const [vocabList, setVocabList] = useState([]);
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

  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];
  const pairOptions = [4, 8, 12, 16];

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) setCurrentUser(JSON.parse(user));
    fetchVocab();
  }, []);

  useEffect(() => {
    let timer;
    if (isPlaying && !showResult) {
      timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, showResult]);

  const fetchVocab = async () => {
    try {
      const data = await api.getVocabList({ limit: 1000 });
      const list = data.data || data || [];
      setVocabList(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error);
    }
  };

  const startGame = useCallback(() => {
    const levelVocab = vocabList.filter(v => v.level === selectedLevel);
    const selected = shuffleArray(levelVocab).slice(0, pairCount);

    // If not enough vocab, fill with what we have
    const actualCount = Math.min(selected.length, pairCount);
    if (actualCount === 0) return;

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
  }, [vocabList, selectedLevel, pairCount]);

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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50">
      <Head>
        <title>单词消消乐 — 星空日语</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main className="pt-28 pb-8 md:pt-36 md:pb-12">
        <div className="container max-w-4xl">

          {/* ── Settings ── */}
          {!isPlaying && !showResult && (
            <div>
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-pink-100 text-pink-600 ring-1 ring-pink-200 mb-4">
                  💎 单词消消乐
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                  单词配对消除
                </h1>
                <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
                  将日语单词与中文释义配对消除，在游戏中巩固单词记忆
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-8">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">词汇等级</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all"
                    >
                      {pairOptions.map(count => (
                        <option key={count} value={count}>{count} 对</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* How to play */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-100 mb-8">
                  <h4 className="text-sm font-bold text-pink-600 mb-3">🎮 游戏规则</h4>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      点击一张<span className="font-semibold text-indigo-600">日语单词</span>卡片，再点击对应的<span className="font-semibold text-emerald-600">中文释义</span>卡片
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      配对正确：+10分，两张卡片消除
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      配对错误：-2分，重新选择
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      消除所有卡片即为胜利！
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/tools')}
                    className="flex-1 py-4 rounded-2xl text-lg font-bold text-gray-500 bg-white border border-gray-200 hover:text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all duration-300"
                  >
                    ← 返回
                  </button>
                  <button
                    onClick={startGame}
                    className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg font-bold rounded-2xl hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    开始游戏
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Game Playing ── */}
          {isPlaying && !showResult && (
            <div>
              {/* Stats bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">得分</div>
                      <div className="text-xl font-extrabold text-pink-600">{score}</div>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">步数</div>
                      <div className="text-xl font-extrabold text-gray-700">{moves}</div>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">已配对</div>
                      <div className="text-xl font-extrabold text-emerald-500">{correctMatches}/{cards.length / 2}</div>
                    </div>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl bg-gray-50">
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">用时</div>
                    <div className="text-xl font-extrabold font-mono text-gray-700">{formatTime(elapsedTime)}</div>
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
                      relative aspect-square rounded-xl font-bold transition-all duration-300
                      flex flex-col items-center justify-center p-1.5 text-center
                      ${card.matched
                        ? 'opacity-0 scale-75 pointer-events-none'
                        : selectedCard?.id === card.id
                        ? 'ring-4 ring-pink-400 scale-105 shadow-lg z-10'
                        : card.type === 'japanese'
                        ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5'
                        : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5'
                      }
                      ${shakeCard === card.id ? 'animate-[shake_0.5s_ease-in-out]' : ''}
                    `}
                  >
                    <span className={`text-[11px] md:text-xs font-bold leading-tight ${
                      card.type === 'japanese' ? 'text-indigo-700' : 'text-emerald-700'
                    }`}>
                      {card.text}
                    </span>
                    {card.subText && (
                      <span className="text-[9px] text-gray-400 mt-0.5">{card.subText}</span>
                    )}
                    {/* Type indicator */}
                    <span className={`absolute top-1 right-1 text-[8px] font-bold px-1 py-0 rounded-full ${
                      card.type === 'japanese'
                      ? 'bg-indigo-100 text-indigo-500'
                      : 'bg-emerald-100 text-emerald-500'
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
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500"
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
                  className="px-5 py-3 bg-red-50 text-red-500 font-medium rounded-2xl hover:bg-red-100 transition-all duration-300"
                >
                  结束游戏
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setShowResult(false);
                  }}
                  className="px-5 py-3 bg-white text-gray-600 font-medium rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
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
                <span className="inline-block text-4xl mb-4">
                  {correctMatches === cards.length / 2 ? '🏆' : score > 50 ? '🎉' : '💪'}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                  {correctMatches === cards.length / 2 ? '恭喜通关！' : '游戏结束'}
                </h2>
                <p className="text-gray-500">
                  {correctMatches === cards.length / 2
                    ? '所有单词都已正确配对，太棒了！'
                    : `已配对 ${correctMatches}/${cards.length / 2} 对单词`
                  }
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-5 text-center border border-pink-100">
                  <div className="text-xs text-pink-400 uppercase tracking-wider font-semibold mb-1">最终得分</div>
                  <div className="text-3xl font-extrabold text-pink-600">{score}</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 text-center border border-emerald-100">
                  <div className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-1">正确配对</div>
                  <div className="text-3xl font-extrabold text-emerald-600">{correctMatches}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 text-center border border-amber-100">
                  <div className="text-xs text-amber-400 uppercase tracking-wider font-semibold mb-1">总步数</div>
                  <div className="text-3xl font-extrabold text-amber-600">{moves}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 text-center border border-blue-100">
                  <div className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-1">用时</div>
                  <div className="text-3xl font-extrabold text-blue-600 font-mono">{formatTime(elapsedTime)}</div>
                </div>
              </div>

              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setShowResult(false);
                  }}
                  className="flex-1 py-4 bg-white text-gray-600 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  返回
                </button>
                <button
                  onClick={startGame}
                  className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-200/50 transition-all duration-300"
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
