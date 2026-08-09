import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message, Select } from 'antd';
import Navigation from '../../components/layout/Navigation';
import { api } from '../../lib/api';
import {
  formatVocabularyField,
} from '../../lib/vocabularyOptions';

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
      api.handleError('Failed to fetch textbooks:', err);
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
      api.handleError('Failed to fetch vocabulary:', err);
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
    <div className="tool-page" onKeyDown={handleKeyDown} tabIndex={-1}>
      <Head>
        <title>单词闪卡 — 星空日语</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main className="tool-main">
        <div className="container max-w-2xl">

          {/* ── Settings ── */}
          {!isPlaying && (
            <div>
              <div className="mb-8">
                <span className="tool-eyebrow">单词闪卡</span>
                <h1 className="tool-title">
                  闪卡记忆
                </h1>
                <p className="tool-description">
                  选择教材和课程，通过翻转卡片反复记忆单词
                </p>
              </div>

              <div className="tool-panel mb-8">
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
                <div className="tool-panel-muted mb-8">
                  <h4 className="tool-section-title">使用方法</h4>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      点击卡片或按<span className="font-semibold text-slate-800 mx-1">空格键</span>翻转卡片
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      按<span className="font-semibold text-slate-800 mx-1">← →</span>方向键切换卡片
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      正面：日语单词 · 背面：中文释义 + 读音
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
                    onClick={startFlashcards}
                    disabled={!selectedTextbook || !selectedLesson || loading}
                    className="tool-button-primary flex-1"
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
                <span className="tool-chip px-3 py-1 text-xs">
                  {selectedLesson}
                </span>
              </div>

              {/* Progress bar */}
              <div className="tool-progress mb-8">
                <div
                  className="tool-progress-fill"
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
                    className="absolute inset-0 rounded-lg bg-white border border-slate-200 shadow-[0_1px_0_rgba(15,23,42,0.04)] flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">日本語</span>
                    <p className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-relaxed">
                      {currentVocab.japanese}
                    </p>
                    {currentVocab.pronunciation && (
                      <p className="text-sm text-slate-500 mt-3 font-medium">{currentVocab.pronunciation}</p>
                    )}
                    {((currentVocab.pitch_accent !== undefined && currentVocab.pitch_accent !== null && currentVocab.pitch_accent !== '') || currentVocab.category) && (
                      <div className="flex flex-wrap justify-center gap-2 mt-5">
                        {currentVocab.pitch_accent !== undefined && currentVocab.pitch_accent !== null && currentVocab.pitch_accent !== '' && (
                          <span className="tool-chip px-2.5 py-1 text-xs">
                            声调: {formatVocabularyField('pitchAccent', currentVocab.pitch_accent)}
                          </span>
                        )}
                        {currentVocab.category && (
                          <span className="tool-chip px-2.5 py-1 text-xs">
                            {formatVocabularyField('category', currentVocab.category)}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="absolute bottom-4 text-xs text-gray-300">点击或按空格翻转</span>
                  </div>

                  {/* Back — Chinese */}
                  <div
                    className="absolute inset-0 rounded-lg bg-[#fafaf7] border border-slate-200 shadow-[0_1px_0_rgba(15,23,42,0.04)] flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">中文</span>
                    <p className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-relaxed">
                      {currentVocab.chinese}
                    </p>
                    {currentVocab.pronunciation && (
                      <p className="text-sm text-slate-500 mt-3 font-medium">{currentVocab.pronunciation}</p>
                    )}
                    {currentVocab.level && (
                      <span className="absolute bottom-4 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                        {formatVocabularyField('level', currentVocab.level)}
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
                  className="tool-icon-button"
                  aria-label="上一张"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="tool-button-primary"
                >
                  {isFlipped ? '显示日语' : '显示中文'}
                </button>

                <button
                  onClick={goNext}
                  disabled={currentIndex >= vocabList.length - 1}
                  className="tool-icon-button"
                  aria-label="下一张"
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
                  className="tool-button-secondary flex-1"
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
