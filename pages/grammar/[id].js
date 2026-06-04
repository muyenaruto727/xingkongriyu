import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message } from 'antd';
import Navigation from '../../components/layout/Navigation';
import { api } from '../../lib/api';

const levelConfig = {
  'N5': {
    bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400',
    border: 'border-emerald-200', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-600',
    accent: 'from-emerald-500 to-teal-500', glow: 'from-emerald-200/30 to-teal-200/20',
    heroGradient: 'from-emerald-50 via-white to-teal-50',
    heroGlow: 'from-emerald-200/40 to-teal-200/25',
    sectionDot: 'bg-emerald-500',
  },
  'N4': {
    bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-400',
    border: 'border-sky-200', badgeBg: 'bg-sky-100', badgeText: 'text-sky-600',
    accent: 'from-sky-500 to-blue-500', glow: 'from-sky-200/30 to-blue-200/20',
    heroGradient: 'from-sky-50 via-white to-blue-50',
    heroGlow: 'from-sky-200/40 to-blue-200/25',
    sectionDot: 'bg-sky-500',
  },
  'N3': {
    bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400',
    border: 'border-amber-200', badgeBg: 'bg-amber-100', badgeText: 'text-amber-600',
    accent: 'from-amber-500 to-orange-500', glow: 'from-amber-200/30 to-orange-200/20',
    heroGradient: 'from-amber-50 via-white to-orange-50',
    heroGlow: 'from-amber-200/40 to-orange-200/25',
    sectionDot: 'bg-amber-500',
  },
  'N2': {
    bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400',
    border: 'border-orange-200', badgeBg: 'bg-orange-100', badgeText: 'text-orange-600',
    accent: 'from-orange-500 to-red-500', glow: 'from-orange-200/30 to-red-200/20',
    heroGradient: 'from-orange-50 via-white to-red-50',
    heroGlow: 'from-orange-200/40 to-red-200/25',
    sectionDot: 'bg-orange-500',
  },
  'N1': {
    bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400',
    border: 'border-rose-200', badgeBg: 'bg-rose-100', badgeText: 'text-rose-600',
    accent: 'from-rose-500 to-pink-500', glow: 'from-rose-200/30 to-pink-200/20',
    heroGradient: 'from-rose-50 via-white to-pink-50',
    heroGlow: 'from-rose-200/40 to-pink-200/25',
    sectionDot: 'bg-rose-500',
  },
};

const sectionColors = [
  { gradient: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100' },
  { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
  { gradient: 'from-purple-500 to-violet-500', bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
  { gradient: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
  { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  { gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
];

const GrammarDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [currentUser, setCurrentUser] = useState(null);
  const [grammar, setGrammar] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showAnswers, setShowAnswers] = useState({});

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    if (id) {
      const fetchGrammar = async () => {
        try {
          const response = await api.getGrammarList();
          const grammarList = response?.data || [];
          const found = grammarList.find(g => g.id === parseInt(id));
          if (found) setGrammar(found);
        } catch (error) {
          console.error('Failed to fetch grammar:', error);
        }
      };
      fetchGrammar();
    }
  }, [id]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser && parsedUser.id && typeof parsedUser.id === 'number' && parsedUser.id > 0) {
        const fetchFavorites = async () => {
          try {
            const favoriteIds = await api.getFavorites(parsedUser.id, 'grammar');
            setFavorites(favoriteIds);
          } catch (error) {
            console.error('Failed to fetch favorites:', error);
          }
        };
        fetchFavorites();
      }
    }
  }, [id]);

  const toggleFavorite = async () => {
    if (!grammar) return;
    if (!currentUser) {
      showToast('请先登录后再收藏', 'warning');
      router.push('/login');
      return;
    }
    try {
      if (favorites.includes(grammar.id)) {
        await api.removeFavorite(currentUser.id, 'grammar', grammar.id);
        setFavorites(favorites.filter(fid => fid !== grammar.id));
      } else {
        await api.addFavorite(currentUser.id, 'grammar', grammar.id);
        setFavorites([...favorites, grammar.id]);
      }
    } catch (error) {
      showToast('收藏操作失败，请重试', 'error');
    }
  };

  const showToast = (msg, type = 'info') => { message[type](msg); };

  const revealAllAnswers = () => {
    if (!grammar?.translationExercises) return;
    const all = {};
    grammar.translationExercises.forEach((_, i) => { all[i] = true; });
    setShowAnswers(all);
  };

  if (!grammar) {
    return (
      <div className="min-h-screen bg-white">
        <Head><title>语法详情 — 星空日语</title></Head>
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-[3px] border-violet-200 border-t-violet-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">加载语法详情...</p>
          </div>
        </div>
      </div>
    );
  }

  const lc = levelConfig[grammar.level] || levelConfig['N5'];
  const hasExamples = grammar.examples && grammar.examples.length > 0 && grammar.examples.some(ex => ex && ex.trim() !== '');
  const hasExercises = grammar.translationExercises && grammar.translationExercises.length > 0 && grammar.translationExercises.some(ex => ex && ex.trim() !== '');
  const isFavorited = favorites.includes(grammar.id);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{grammar.grammarPoint} — 语法详情 — 星空日语</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main>
        {/* ═══════ Hero ═══════ */}
        <section className={`relative pt-28 pb-10 md:pt-40 md:pb-16 overflow-hidden`}>
          {/* Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${lc.heroGradient} pointer-events-none`} />
          <div className={`absolute -top-24 -right-24 w-[380px] h-[380px] rounded-full bg-gradient-to-br ${lc.heroGlow} blur-3xl pointer-events-none`} />
          <div className="absolute -bottom-16 -left-16 w-[250px] h-[250px] rounded-full bg-gradient-to-tr from-violet-100/30 to-purple-100/20 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

          <div className="container relative z-10">
            <div className="max-w-3xl">
     
              {/* Level badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${lc.bg} ${lc.text} ring-1 ${lc.border} mb-4`}>
                <span className={`w-1.5 h-1.5 rounded-full ${lc.dot}`} />
                {grammar.level || 'N5'}
              </span>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight leading-tight">
                {grammar.grammarPoint}
              </h1>

              {/* Quick meaning preview */}
              {grammar.chineseMeaning && (
                <p className="text-gray-500 text-lg mb-6 leading-relaxed max-w-2xl">
                  {grammar.chineseMeaning}
                </p>
              )}

              {/* Favorite button */}
              <button
                onClick={toggleFavorite}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isFavorited
                    ? 'bg-red-50 text-red-600 ring-1 ring-red-200 shadow-sm'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50 hover:shadow-sm'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isFavorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isFavorited ? '已收藏' : '收藏语法点'}
              </button>
            </div>
          </div>
        </section>

        {/* ═══════ Content ═══════ */}
        <section className="pb-24">
          <div className="container">
            <div className="max-w-4xl">

              {/* ── Meanings ── */}
              {(grammar.japaneseMeaning || grammar.chineseMeaning) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  {grammar.japaneseMeaning && (
                    <div className="group relative bg-white rounded-2xl border border-indigo-100 p-6 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-t-2xl" />
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                          日
                        </div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.15em]">日文释义</span>
                      </div>
                      <p className="text-gray-800 text-lg leading-relaxed font-medium">
                        {grammar.japaneseMeaning}
                      </p>
                    </div>
                  )}
                  {grammar.chineseMeaning && (
                    <div className="group relative bg-white rounded-2xl border border-amber-100 p-6 hover:shadow-lg hover:shadow-amber-50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-t-2xl" />
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                          中
                        </div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-[0.15em]">中文释义</span>
                      </div>
                      <p className="text-gray-800 text-lg leading-relaxed font-medium">
                        {grammar.chineseMeaning}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Continuation ── */}
              {grammar.continuation && (
                <div className="relative bg-white rounded-2xl border border-purple-100 p-6 mb-8 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-purple-300 to-violet-300 rounded-full" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">接续方式</span>
                      <p className="text-xs text-gray-400 mt-0.5">この文法の接続のしかた</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50/50 to-violet-50/50 rounded-xl px-5 py-4 border border-purple-100/50">
                    <code className="text-gray-800 text-lg font-medium tracking-wide">{grammar.continuation}</code>
                  </div>
                </div>
              )}

              {/* ── Attention Points ── */}
              {grammar.attentionPoints && (
                <div className="relative bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl border border-amber-200 p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-[0.15em]">注意事项</span>
                      <p className="text-xs text-amber-400 mt-0.5">使用上の注意点</p>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl px-5 py-4 border border-amber-100/50">
                    <p className="text-gray-700 leading-relaxed">{grammar.attentionPoints}</p>
                  </div>
                </div>
              )}

              {/* ── Examples ── */}
              {hasExamples && (
                <div className="mb-10">
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-1 h-7 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400`} />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">例句</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {grammar.examples.filter(ex => ex && ex.trim() !== '').length} 句
                    </span>
                  </div>

                  <div className="space-y-3">
                    {grammar.examples.filter(ex => ex && ex.trim() !== '').map((example, i) => (
                      <div key={i}
                        className="group flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-300"
                      >
                        <span className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br ${sectionColors[i % 6].gradient}`}>
                          {i + 1}
                        </span>
                        <p className="text-gray-800 text-base leading-relaxed pt-1">{example}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Translation Exercises ── */}
              {hasExercises && (
                <div className="mb-10">
                  {/* Section header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-7 rounded-full bg-gradient-to-b from-emerald-400 to-green-400" />
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">翻译练习</h2>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        {grammar.translationExercises.filter(ex => ex && ex.trim() !== '').length} 题
                      </span>
                    </div>
                    {/* Reveal all button */}
                    {grammar.referenceAnswers && grammar.referenceAnswers.some(a => a) && (
                      <button
                        onClick={revealAllAnswers}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 hover:text-emerald-700 transition-all duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        全部显示答案
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {grammar.translationExercises.filter(ex => ex && ex.trim() !== '').map((exercise, i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                        {/* Exercise */}
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                              {i + 1}
                            </span>
                            <p className="text-gray-800 text-base leading-relaxed flex-1 pt-1">{exercise}</p>
                          </div>
                        </div>

                        {/* Answer area */}
                        {grammar.referenceAnswers && grammar.referenceAnswers[i] && (
                          <div className={`border-t px-5 py-4 transition-all duration-300 ${
                            showAnswers[i] ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50/50 border-gray-100'
                          }`}>
                            {!showAnswers[i] ? (
                              <button
                                onClick={() => setShowAnswers({...showAnswers, [i]: true})}
                                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors group"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                点击查看参考答案
                              </button>
                            ) : (
                              <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 mt-0.5">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </span>
                                <div>
                                  <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block mb-1">参考答案</span>
                                  <span className="text-emerald-800 text-sm leading-relaxed">{grammar.referenceAnswers[i]}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Empty State ── */}
              {!grammar.japaneseMeaning && !grammar.chineseMeaning && !grammar.continuation && !grammar.attentionPoints && !hasExamples && !hasExercises && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无详细内容</h3>
                  <p className="text-gray-500 text-sm">该语法点的详细释义、例句和练习正在完善中</p>
                </div>
              )}

              {/* ── Bottom navigation ── */}
              <div className="mt-16 pt-10 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.push('/learning-center/grammar')}
                    className={`group inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 border ${lc.border} ${lc.bg} ${lc.text} hover:shadow-md hover:-translate-y-0.5`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回语法列表
                  </button>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${lc.bg} ${lc.text} ring-1 ${lc.border}`}>
                    {grammar.level}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GrammarDetail;
