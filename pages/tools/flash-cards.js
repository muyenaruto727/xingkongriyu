import { useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeftOutlined,
  BookOutlined,
  CheckOutlined,
  ReloadOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { message, Select } from 'antd';
import Navigation from '../../components/layout/Navigation';
import { api } from '../../lib/api';
import { formatVocabularyField } from '../../lib/vocabularyOptions';
import {
  getFlashcardProgress,
  getNextFlashcardReviewState,
  hasFlashcardFieldValue,
  normalizeFlashcardExamples,
} from '../../lib/flashcardStudy';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

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
  const [reviewState, setReviewState] = useState({
    remembered: 0,
    reviewAgain: 0,
  });

  useEffect(() => {
    fetchTextbooks();
  }, []);

  const fetchTextbooks = async () => {
    try {
      const data = await api.getTextbookList();
      setTextbooks(normalizeList(data));
    } catch (err) {
      api.handleError('教材列表读取失败', err);
    }
  };

  const selectedTextbookItem = useMemo(
    () => textbooks.find((item) => String(item.id) === String(selectedTextbook)),
    [selectedTextbook, textbooks],
  );

  const lessonOptions = useMemo(() => {
    if (!selectedTextbookItem) return [];
    if (Array.isArray(selectedTextbookItem.lessons)) {
      return selectedTextbookItem.lessons;
    }

    const count = selectedTextbookItem.lesson_count || selectedTextbookItem.lessons_count || 25;
    return Array.from({ length: count }, (_, index) => ({
      id: `第${index + 1}课`,
      name: `第${index + 1}课`,
    }));
  }, [selectedTextbookItem]);

  const sourceLabel = selectedTextbookItem && selectedLesson
    ? `${selectedTextbookItem.name} · ${selectedLesson}`
    : '教材课程';

  const currentVocab = vocabList[currentIndex];
  const progress = getFlashcardProgress(currentIndex, vocabList.length);
  const currentExamples = normalizeFlashcardExamples(currentVocab?.examples);

  const startFlashcards = async () => {
    if (!selectedTextbook || !selectedLesson) {
      message.warning('请先选择教材和课程');
      return;
    }

    setLoading(true);
    try {
      const textbookName = selectedTextbookItem?.name || selectedTextbook;
      const fullLessonValue = `${textbookName}:${selectedLesson}`;
      const data = await api.getVocabList({
        textbook: textbookName,
        lesson: fullLessonValue,
        limit: 200,
      });
      const list = normalizeList(data).filter((item) => item?.japanese && item?.chinese);

      if (list.length === 0) {
        message.warning('该课程暂无词汇数据，请选择其他课程');
        return;
      }

      setVocabList([...list].sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
      setIsFlipped(false);
      setReviewState({ remembered: 0, reviewAgain: 0 });
      setIsPlaying(true);
    } catch (err) {
      api.handleError('词汇读取失败', err);
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (currentIndex < vocabList.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 120);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 120);
    }
  };

  const handleReviewAction = (action) => {
    setReviewState((prev) => getNextFlashcardReviewState(prev, action));
    goNext();
  };

  const handleKeyDown = (event) => {
    if (!isPlaying) return;
    if (event.key === 'ArrowLeft') goPrev();
    if (event.key === 'ArrowRight') goNext();
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!isPlaying) return undefined;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentIndex, vocabList.length]);

  const goBackToSettings = () => {
    setIsPlaying(false);
    setVocabList([]);
    setIsFlipped(false);
  };

  return (
    <div className="tool-page-shell">
      <Head>
        <title>单词闪卡 — 星空日语</title>
        <meta name="description" content="选择教材课程，用翻转闪卡记忆日语单词、读音、声调和例句。" />
      </Head>

      <Navigation />

      <main className="flex-grow overflow-x-hidden" onKeyDown={handleKeyDown} tabIndex={-1}>
        <section className="tool-main">
          <div className="mx-auto w-full max-w-6xl min-w-0 px-4 sm:px-6 lg:px-8">
            {!isPlaying && (
              <div>
                <button
                  type="button"
                  onClick={() => router.push('/tools')}
                  className="tool-back"
                >
                  <ArrowLeftOutlined />
                  返回小工具
                </button>

                <div className="mb-8">
                  <span className="tool-eyebrow">单词闪卡</span>
                  <h1 className="tool-title">学习桌面</h1>
                  <p className="tool-description">
                    从指定教材课程取词，先看日语和读音，再翻到背面确认中文、例句和标签。
                  </p>
                </div>

                <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                  <section className="tool-panel min-w-0">
                    <div className="mb-8 flex items-start gap-4">
                      <div className="flash-desk-icon">
                        <BookOutlined />
                      </div>
                      <div className="min-w-0">
                        <h2 className="tool-section-title mb-1">选择今天要复习的课程</h2>
                        <p className="text-sm leading-7 text-slate-600">
                          建议一次只选一课，先快速过一遍，再把不熟的词单独复习。
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="min-w-0">
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

                      <div className="min-w-0">
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

                    <div className="mt-8 grid gap-3 md:grid-cols-3">
                      <div className="tool-stat text-left">
                        <div className="tool-stat-label">训练方式</div>
                        <div className="mt-2 text-sm font-bold text-slate-900">翻面记忆</div>
                      </div>
                      <div className="tool-stat text-left">
                        <div className="tool-stat-label">反馈按钮</div>
                        <div className="mt-2 text-sm font-bold text-slate-900">已记住 / 再复习</div>
                      </div>
                      <div className="tool-stat text-left">
                        <div className="tool-stat-label">快捷键</div>
                        <div className="mt-2 text-sm font-bold text-slate-900">空格 · ← →</div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        onClick={startFlashcards}
                        disabled={!selectedTextbook || !selectedLesson || loading}
                        className="tool-button-primary w-full sm:w-auto sm:min-w-40"
                      >
                        {loading ? '准备中...' : '开始记忆'}
                      </button>
                    </div>
                  </section>

                  <aside className="tool-panel h-fit min-w-0 overflow-hidden">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="tool-section-title mb-0">今日训练</h2>
                      <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                        轻量复习
                      </span>
                    </div>
                    <div className="flash-preview-card">
                      <div className="flash-bookmark" />
                      <div className="text-xs font-bold text-slate-400">预览</div>
                      <div className="mt-6 text-4xl font-black text-slate-950">言葉</div>
                      <div className="mt-2 text-sm font-semibold text-slate-500">ことば · ⓪ · 名</div>
                      <div className="mt-8 rounded-md bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
                        先猜意思，再翻面确认。遇到犹豫的词，点“再复习”。
                      </div>
                    </div>
                    <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                      <p>卡片正面保留日语、读音、声调和词性，减少“看答案”的干扰。</p>
                      <p>背面集中展示中文、例句、级别和标签，适合课后快速过词。</p>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {isPlaying && currentVocab && (
              <div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={goBackToSettings}
                    className="tool-back mb-0 w-fit"
                  >
                    <ArrowLeftOutlined />
                    返回设置
                  </button>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="tool-chip px-3 py-1 text-xs">{sourceLabel}</span>
                    <span className="tool-chip px-3 py-1 text-xs">
                      {progress.current}/{progress.total}
                    </span>
                  </div>
                </div>

                <div className="mb-6 grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="tool-panel p-5">
                    <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>今日进度</span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div className="tool-progress">
                      <div className="tool-progress-fill" style={{ width: `${progress.percent}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="tool-stat">
                      <div className="tool-stat-label">已记住</div>
                      <div className="tool-stat-value text-emerald-700">{reviewState.remembered}</div>
                    </div>
                    <div className="tool-stat">
                      <div className="tool-stat-label">再复习</div>
                      <div className="tool-stat-value text-amber-700">{reviewState.reviewAgain}</div>
                    </div>
                  </div>
                </div>

                <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <section className="tool-panel flash-study-surface min-w-0">
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="flash-card-stage"
                      style={{ perspective: '1200px' }}
                    >
                      <div
                        className="flash-card-inner"
                        style={{
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        <div className="flash-card-face flash-card-front">
                          <div className="flash-bookmark" />
                          <div className="flex items-center justify-between gap-3">
                            <span className="flash-card-label">正面</span>
                            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                              日本語
                            </span>
                          </div>
                          <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                            <p className="text-4xl font-black leading-tight text-slate-950 md:text-6xl">
                              {currentVocab.japanese}
                            </p>
                            {currentVocab.pronunciation && (
                              <p className="mt-5 text-lg font-semibold text-slate-500">
                                {currentVocab.pronunciation}
                              </p>
                            )}
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                              {currentVocab.pitch_accent !== undefined
                                && currentVocab.pitch_accent !== null
                                && currentVocab.pitch_accent !== '' && (
                                  <span className="tool-chip px-2.5 py-1 text-xs">
                                    声调 {formatVocabularyField('pitchAccent', currentVocab.pitch_accent)}
                                  </span>
                                )}
                              {hasFlashcardFieldValue(currentVocab.category) && (
                                <span className="tool-chip px-2.5 py-1 text-xs">
                                  {formatVocabularyField('category', currentVocab.category)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button type="button" className="flash-flip-hint">
                            <SwapOutlined />
                            点击翻到背面
                          </button>
                        </div>

                        <div className="flash-card-face flash-card-back">
                          <div className="flash-bookmark flash-bookmark-back" />
                          <div className="flex items-center justify-between gap-3">
                            <span className="flash-card-label">背面</span>
                            {hasFlashcardFieldValue(currentVocab.level) && (
                              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                {formatVocabularyField('level', currentVocab.level)}
                              </span>
                            )}
                          </div>
                          <div className="mt-8">
                            <div className="text-sm font-bold text-slate-400">中文释义</div>
                            <p className="mt-2 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
                              {currentVocab.chinese}
                            </p>
                          </div>
                          {currentExamples.length > 0 && (
                            <div className="mt-8 rounded-lg bg-white/70 p-4 ring-1 ring-slate-200">
                              <div className="text-xs font-bold text-slate-400">例句</div>
                              <div className="mt-3 space-y-3 text-base leading-8 text-slate-700">
                                {currentExamples.slice(0, 2).map((example, index) => (
                                  <p key={`${example}-${index}`}>{example}</p>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="mt-6 flex flex-wrap gap-2">
                            {hasFlashcardFieldValue(currentVocab.tag) && (
                              <span className="tool-chip px-2.5 py-1 text-xs">
                                {formatVocabularyField('tag', currentVocab.tag)}
                              </span>
                            )}
                            {currentVocab.pronunciation && (
                              <span className="tool-chip px-2.5 py-1 text-xs">
                                {currentVocab.pronunciation}
                              </span>
                            )}
                          </div>
                          <button type="button" className="flash-flip-hint">
                            <SwapOutlined />
                            点击回到正面
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={goPrev}
                          disabled={currentIndex === 0}
                          className="tool-icon-button"
                          aria-label="上一张"
                        >
                          <ArrowLeftOutlined />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFlipped(!isFlipped)}
                          className="tool-button-secondary"
                        >
                          <SwapOutlined />
                          翻面
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleReviewAction('reviewAgain')}
                          disabled={currentIndex >= vocabList.length - 1}
                          className="flash-review-button flash-review-button-warm"
                        >
                          <ReloadOutlined />
                          再复习
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewAction('remembered')}
                          disabled={currentIndex >= vocabList.length - 1}
                          className="flash-review-button flash-review-button-good"
                        >
                          <CheckOutlined />
                          已记住
                        </button>
                      </div>
                    </div>
                  </section>

                  <aside className="tool-panel h-fit min-w-0">
                    <h2 className="tool-section-title">学习记录</h2>
                    <div className="space-y-4">
                      <div className="tool-panel-muted">
                        <div className="text-lg font-bold text-slate-900">
                          {isFlipped ? '核对答案' : '先在心里说出意思'}
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          不确定时先翻面，再决定“已记住”还是“再复习”。
                        </p>
                      </div>
                      <div>
                        <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                          <span>本轮完成</span>
                          <span>{progress.current}/{progress.total}</span>
                        </div>
                        <div className="tool-progress">
                          <div className="tool-progress-fill" style={{ width: `${progress.percent}%` }} />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={currentIndex >= vocabList.length - 1}
                        className="tool-button-primary w-full"
                      >
                        下一张
                      </button>
                      {currentIndex >= vocabList.length - 1 && (
                        <div className="rounded-lg bg-emerald-50 p-4 text-sm font-semibold leading-7 text-emerald-800 ring-1 ring-emerald-100">
                          已到最后一张。可以返回设置换一课，或用“上一张”回看。
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <style jsx>{`
        .flash-desk-icon {
          align-items: center;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 0.5rem;
          color: #2563eb;
          display: inline-flex;
          flex: 0 0 auto;
          height: 3rem;
          justify-content: center;
          width: 3rem;
        }

        .flash-preview-card,
        .flash-card-face {
          background:
            linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px) 0 0 / 28px 28px,
            linear-gradient(#fffdf7, #f8fafc);
          box-shadow: 0 18px 40px rgba(59, 130, 246, 0.12);
        }

        .flash-preview-card {
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          min-height: 260px;
          padding: 1.5rem;
          position: relative;
        }

        .flash-bookmark {
          background: #bfdbfe;
          border-radius: 0 0 0.375rem 0.375rem;
          height: 3.5rem;
          position: absolute;
          right: 1.5rem;
          top: 0;
          width: 1.25rem;
        }

        .flash-bookmark-back {
          background: #bbf7d0;
        }

        .flash-study-surface {
          background: linear-gradient(180deg, rgba(239, 246, 255, 0.78), rgba(255, 255, 255, 0.95));
        }

        .flash-card-stage {
          cursor: pointer;
          margin: 0 auto;
          max-width: 680px;
          min-height: 440px;
          width: 100%;
        }

        .flash-card-inner {
          height: 100%;
          min-height: 440px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 520ms ease;
        }

        .flash-card-face {
          backface-visibility: hidden;
          border: 1px solid #dbeafe;
          border-radius: 0.75rem;
          display: flex;
          flex-direction: column;
          inset: 0;
          min-height: 440px;
          padding: 1.5rem;
          position: absolute;
        }

        .flash-card-back {
          background:
            linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px) 0 0 / 28px 28px,
            linear-gradient(#f7fee7, #f8fafc);
          transform: rotateY(180deg);
        }

        .flash-card-label {
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .flash-flip-hint {
          align-items: center;
          align-self: center;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          color: #64748b;
          display: inline-flex;
          font-size: 0.75rem;
          font-weight: 700;
          gap: 0.375rem;
          margin-top: auto;
          padding: 0.5rem 0.75rem;
        }

        .flash-review-button {
          align-items: center;
          border-radius: 0.375rem;
          display: inline-flex;
          font-size: 0.875rem;
          font-weight: 800;
          gap: 0.5rem;
          justify-content: center;
          min-height: 2.75rem;
          padding: 0.75rem 1rem;
          transition: all 180ms ease;
        }

        .flash-review-button:hover {
          transform: translateY(-1px);
        }

        .flash-review-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
          transform: none;
        }

        .flash-review-button-warm {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
        }

        .flash-review-button-good {
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          color: #047857;
        }

        @media (max-width: 640px) {
          .flash-card-stage,
          .flash-card-inner,
          .flash-card-face {
            min-height: 420px;
          }
        }
      `}</style>
    </div>
  );
};

export default Flashcards;
