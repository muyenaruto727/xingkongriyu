import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message, Select } from 'antd';
import Navigation from '../../components/layout/Navigation';
import { api } from '../../lib/api';

const Flashcards = () => {
  const router = useRouter();
  const [textbooks, setTextbooks] = useState([]);
  const [selectedTextbook, setSelectedTextbook] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [vocabList, setVocabList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTextbooks();
  }, []);

  const fetchTextbooks = async () => {
    try {
      const data = await api.getTextbookList();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setTextbooks(list);
    } catch (err) {
      console.error('Failed to fetch textbooks:', err);
    }
  };

  const lessonOptions = () => {
    if (!selectedTextbook) return [];
    const tb = textbooks.find(t => String(t.id) === String(selectedTextbook));
    if (!tb) return [];
    // Try to get lessons from the textbook object or generate from lesson count
    if (tb.lessons && Array.isArray(tb.lessons)) {
      return tb.lessons;
    }
    // Fallback: generate lesson names
    const count = tb.lesson_count || tb.lessons_count || 25;
    return Array.from({ length: count }, (_, i) => ({
      id: `第${i + 1}课`,
      name: `第${i + 1}课`,
    }));
  };

  const startFlashcards = async () => {
    if (!selectedTextbook || !selectedLesson) return;
    setLoading(true);
    try {
      const tb = textbooks.find(t => String(t.id) === String(selectedTextbook));
      const lessonName = selectedLesson;
      // 使用教材名:课程名的完整格式，确保与数据库中存储的格式一致
      const textbookName = tb?.name || selectedTextbook;
      const fullLessonValue = `${textbookName}:${lessonName}`;
      const data = await api.getVocabList({
        textbook: textbookName,
        lesson: fullLessonValue,
        limit: 200,
      });
      const list = Array.isArray(data) ? data : (data?.data || []);
      if (list.length === 0) {
        message.warning('该课程暂无词汇数据，请选择其他课程');
        setLoading(false);
        return;
      }
      // Shuffle
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      setVocabList(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to fetch vocabulary:', err);
    }
    setLoading(false);
  };

  const currentVocab = vocabList[currentIndex];

  const goNext = () => {
    if (currentIndex < vocabList.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const handleKeyDown = (e) => {
    if (!isPlaying) return;
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsFlipped(prev => !prev);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isPlaying, currentIndex, vocabList.length]);

  const goBackToSettings = () => {
    setIsPlaying(false);
    setVocabList([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50" onKeyDown={handleKeyDown} tabIndex={-1}>
      <Head>
        <title>单词闪卡 — 星空日语</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main className="pt-28 pb-8 md:pt-36 md:pb-12">
        <div className="container max-w-2xl">

          {/* ── Settings ── */}
          {!isPlaying && (
            <div>
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200 mb-4">
                  🃏 单词闪卡
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                  闪卡记忆
                </h1>
                <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
                  选择教材和课程，通过翻转卡片反复记忆单词
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-8">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">选择教材</label>
                  <Select
                    value={selectedTextbook || undefined}
                    onChange={(value) => {
                      setSelectedTextbook(value);
                      setSelectedLesson('');
                    }}
                    placeholder="请选择教材"
                    style={{ width: '100%' }}
                    size="large"
                    options={textbooks.map(tb => ({
                      value: String(tb.id),
                      label: tb.name,
                    }))}
                  />
                </div>

                {selectedTextbook && (
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">选择课程</label>
                    <Select
                      value={selectedLesson || undefined}
                      onChange={(value) => setSelectedLesson(value)}
                      placeholder="请选择课程"
                      style={{ width: '100%' }}
                      size="large"
                      options={lessonOptions().map((l, i) => ({
                        value: l.name || l,
                        label: l.name || l,
                      }))}
                    />
                  </div>
                )}

                {/* How to use */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 mb-8">
                  <h4 className="text-sm font-bold text-indigo-600 mb-3">📖 使用方法</h4>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      点击卡片或按<span className="font-semibold text-indigo-600 mx-1">空格键</span>翻转卡片
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      按<span className="font-semibold text-indigo-600 mx-1">← →</span>方向键切换卡片
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      正面：日语单词 · 背面：中文释义 + 读音
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
                    onClick={startFlashcards}
                    disabled={!selectedTextbook || !selectedLesson || loading}
                    className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-lg font-bold rounded-2xl hover:from-indigo-600 hover:to-blue-600 hover:shadow-lg hover:shadow-indigo-200/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '加载中...' : '开始记忆'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Flashcard Mode ── */}
          {isPlaying && currentVocab && (
            <div className="text-center">
              {/* Progress */}
              <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                <span>{currentIndex + 1} / {vocabList.length}</span>
                <span className="text-xs bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full font-medium">
                  {selectedLesson}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / vocabList.length) * 100}%` }}
                />
              </div>

              {/* Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative w-full aspect-[4/3] max-w-md mx-auto cursor-pointer mb-8"
                style={{ perspective: '1000px' }}
              >
                <div
                  className={`relative w-full h-full transition-all duration-500`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front — Japanese */}
                  <div
                    className="absolute inset-0 rounded-3xl bg-white border-2 border-indigo-200 shadow-lg shadow-indigo-100/50 flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">日本語</span>
                    <p className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-relaxed">
                      {currentVocab.japanese}
                    </p>
                    {currentVocab.pronunciation && (
                      <p className="text-sm text-indigo-400 mt-3 font-medium">{currentVocab.pronunciation}</p>
                    )}
                    <span className="absolute bottom-4 text-xs text-gray-300">点击或按空格翻转</span>
                  </div>

                  {/* Back — Chinese */}
                  <div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-blue-200 shadow-lg shadow-blue-100/50 flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">中文</span>
                    <p className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-relaxed">
                      {currentVocab.chinese}
                    </p>
                    {currentVocab.pronunciation && (
                      <p className="text-sm text-blue-400 mt-3 font-medium">{currentVocab.pronunciation}</p>
                    )}
                    {currentVocab.level && (
                      <span className="absolute bottom-4 text-xs font-medium text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full">
                        {currentVocab.level}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-colors shadow-sm"
                >
                  {isFlipped ? '显示日语' : '显示中文'}
                </button>

                <button
                  onClick={goNext}
                  disabled={currentIndex >= vocabList.length - 1}
                  className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Bottom buttons */}
              <div className="flex gap-3">
                <button
                  onClick={goBackToSettings}
                  className="flex-1 py-4 bg-white text-gray-600 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  返回
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Flashcards;
