import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message } from 'antd';
import Navigation from '../../components/layout/Navigation';
import { api } from '../../lib/api';

const levelConfig = {
  'N5': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-200', hover: 'hover:border-emerald-300', shadow: 'hover:shadow-emerald-100/40' },
  'N4': { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-400', border: 'border-sky-200', hover: 'hover:border-sky-300', shadow: 'hover:shadow-sky-100/40' },
  'N3': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200', hover: 'hover:border-amber-300', shadow: 'hover:shadow-amber-100/40' },
  'N2': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400', border: 'border-orange-200', hover: 'hover:border-orange-300', shadow: 'hover:shadow-orange-100/40' },
  'N1': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400', border: 'border-rose-200', hover: 'hover:border-rose-300', shadow: 'hover:shadow-rose-100/40' },
};

const Grammar = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [grammarList, setGrammarList] = useState([]);
  const [filteredGrammarList, setFilteredGrammarList] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [favorites, setFavorites] = useState([]);
  const itemsPerPage = 20;
  const currentUserId = currentUser?.id;

  const levels = ['全部', 'N1', 'N2', 'N3', 'N4', 'N5'];

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
    }
    const storedFavorites = localStorage.getItem('grammarFavorites');
    if (storedFavorites && !user) setFavorites(JSON.parse(storedFavorites));
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchFavorites(currentUserId);
    }
  }, [currentUserId]);

  const fetchFavorites = async (userId) => {
    try {
      if (!userId || typeof userId !== 'number' || isNaN(userId) || userId <= 0) return;
      const favoriteIds = await api.getFavorites(userId, 'grammar');
      setFavorites(favoriteIds);
    } catch (error) { api.handleError('Failed to fetch favorites:', error); }
  };

  const fetchGrammarList = async (params = {}) => {
    try {
      const response = await api.getGrammarList(params);
      const data = response?.data || [];
      setGrammarList(data);
      setFilteredGrammarList(data.slice(0, itemsPerPage));
    } catch (error) { api.handleError('Failed to fetch grammar:', error); }
  };

  useEffect(() => {
    const params = {};
    if (selectedLevel !== '全部') params.level = selectedLevel;
    if (searchKeyword) params.search = searchKeyword;
    fetchGrammarList(params);
  }, [selectedLevel, searchKeyword]);

  const toggleFavorite = async (grammarId) => {
    if (!currentUser) { showToast('请先登录后再收藏', 'warning'); router.push('/login'); return; }
    try {
      if (favorites.includes(grammarId)) {
        await api.removeFavorite(currentUser.id, 'grammar', grammarId);
        setFavorites(favorites.filter(id => id !== grammarId));
      } else {
        await api.addFavorite(currentUser.id, 'grammar', grammarId);
        setFavorites([...favorites, grammarId]);
      }
    } catch {
      // API errors are shown by lib/api.js.
    }
  };

  const showToast = (msg, type = 'info') => { message[type](msg); };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>语法学习 — 星空日语</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main>
        {/* ── Hero ── */}
        <section className="relative pt-28 pb-8 md:pt-36 md:pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-[350px] h-[350px] rounded-full bg-gradient-to-br from-purple-100/50 to-violet-100/20 blur-3xl pointer-events-none" />
          <div className="container relative z-10">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full mb-4">语法学习</span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">掌握日语语法体系</h1>
              <p className="text-gray-500 text-lg">从 N5 到 N1，每个语法点都配有释义、例句和翻译练习</p>
            </div>
          </div>
        </section>

        {/* ── Filters + Cards ── */}
        <section className="pb-20">
          <div className="container">
            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
              {/* Level pills */}
              <div className="flex flex-wrap gap-2 flex-1">
                {levels.map((level) => (
                  <button key={level} onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedLevel === level
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/15'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
                    }`}>{level}</button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索语法..."
                  className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all" />
                {searchKeyword && (
                  <button onClick={() => setSearchKeyword('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Result summary */}
            <div className="mb-6">
              <p className="text-sm text-gray-400">
                共 <span className="font-semibold text-gray-600">{filteredGrammarList.length}</span> 个语法点
                {selectedLevel !== '全部' && <span> · {selectedLevel} 级别</span>}
                {searchKeyword && <span> · 搜索「{searchKeyword}」</span>}
              </p>
            </div>

            {/* Grammar cards */}
            {filteredGrammarList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGrammarList.map((grammar) => {
                  const lc = levelConfig[grammar.level] || levelConfig['N5'];
                  return (
                    <div key={grammar.id}
                      className={`group relative bg-white rounded-2xl border ${lc.border} ${lc.hover} p-6 hover:shadow-lg ${lc.shadow} hover:-translate-y-0.5 transition-all duration-300 cursor-pointer`}
                      onClick={() => router.push(`/grammar/${grammar.id}`)}
                    >
                      {/* Level badge + Favorite */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${lc.bg} ${lc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${lc.dot}`} />
                          {grammar.level || 'N5'}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(grammar.id); }}
                          className={`p-1.5 rounded-lg transition-all ${
                            favorites.includes(grammar.id) ? 'bg-red-50 text-red-500' : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                          }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={favorites.includes(grammar.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Grammar point name */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                        {grammar.grammarPoint}
                      </h3>

                      {/* Chinese meaning snippet */}
                      {grammar.chineseMeaning && (
                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4">
                          {grammar.chineseMeaning}
                        </p>
                      )}

                      {/* View detail link */}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 group-hover:gap-2 transition-all">
                        查看详情
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">暂无语法数据</h3>
                <p className="text-gray-500 text-sm">请前往后台管理系统添加语法数据</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Grammar;
