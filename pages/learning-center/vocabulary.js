import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message, Modal } from 'antd';
import dynamic from 'next/dynamic';
import { api } from '../../lib/api';

const Navigation = dynamic(() => import('../../components/layout/Navigation'), { ssr: true });
const Footer = dynamic(() => import('../../components/layout/Footer'), { ssr: true });

const levelColors = {
  'N5': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  'N4': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  'N3': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  'N2': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  'N1': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
};

const Vocabulary = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredVocabList, setFilteredVocabList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState('全部');
  const [selectedTag, setSelectedTag] = useState('全部');
  const [selectedTextbook, setSelectedTextbook] = useState('全部');
  const [selectedLesson, setSelectedLesson] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [textbookList, setTextbookList] = useState([]);
  const [textbookLessonsMap, setTextbookLessonsMap] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [currentVocab, setCurrentVocab] = useState(null);

  const itemsPerPage = 20;
  const levels = ['全部', 'N1', 'N2', 'N3', 'N4', 'N5'];
  const tags = ['全部', '日常', '商务/职场', 'IT/计算机', '电子/半导体', '制造业', '金融/经济/财务', '旅游/餐饮/交通', '医疗', '其他'];

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (!currentUser) setCurrentUser(parsedUser);
        if (parsedUser?.id && typeof parsedUser.id === 'number' && parsedUser.id > 0) {
          fetchFavorites(parsedUser.id);
        }
      } catch (error) { console.error('Failed to parse user:', error); }
    }
    fetchVocabList();
  }, [currentUser]);

  useEffect(() => { fetchTextbookList(); }, []);

  const fetchTextbookList = async () => {
    try {
      const data = await api.getTextbookList();
      setTextbookList(data);
      const lessonsMap = {};
      data.forEach(textbook => { lessonsMap[textbook.name] = (textbook.lessons || []).map(l => l.name); });
      setTextbookLessonsMap(lessonsMap);
    } catch (error) { console.error('Failed to fetch textbooks:', error); }
  };

  const fetchFavorites = async (userId) => {
    try {
      if (!userId || typeof userId !== 'number' || isNaN(userId) || userId <= 0) return;
      const favoriteIds = await api.getFavorites(userId, 'vocabulary');
      setFavorites(favoriteIds);
    } catch (error) { console.error('Failed to fetch favorites:', error); }
  };

  const fetchVocabList = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const params = {
        level: selectedLevel !== '全部' ? selectedLevel : '',
        tag: selectedTag !== '全部' ? selectedTag : '',
        textbook: selectedTextbook !== '全部' ? selectedTextbook : '',
        lesson: selectedLesson !== '全部' ? selectedLesson : '',
        search: searchKeyword, page: pageNum, limit: itemsPerPage,
      };
      const response = await api.getVocabList(params);
      const data = response.data || [];
      const total = response.total || 0;
      if (append) {
        setFilteredVocabList(prev => [...prev, ...data]);
      } else {
        setFilteredVocabList(data);
        setCurrentPage(pageNum);
      }
      setTotalCount(total);
    } catch (error) { console.error('Failed to fetch vocabulary:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { setCurrentPage(1); fetchVocabList(1); }, [selectedLevel, selectedTag, selectedTextbook, selectedLesson, searchKeyword]);

  const loadMore = () => {
    if (loading) return;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    if (currentPage < totalPages) fetchVocabList(currentPage + 1, true);
  };

  const showToast = (msg, type = 'info') => { message[type](msg); };
  const safeVocabList = Array.isArray(filteredVocabList) ? filteredVocabList : [];

  const toggleFavorite = async (vocabId) => {
    if (!currentUser) { showToast('请先登录后再收藏', 'warning'); router.push('/login'); return; }
    try {
      if (favorites.includes(vocabId)) {
        await api.removeFavorite(currentUser.id, 'vocabulary', vocabId);
        setFavorites(favorites.filter(id => id !== vocabId));
      } else {
        await api.addFavorite(currentUser.id, 'vocabulary', vocabId);
        setFavorites([...favorites, vocabId]);
      }
    } catch (error) { showToast('收藏操作失败，请重试', 'error'); }
  };

  const speakVocab = (japanese) => {
    const audio = new Audio(`/api/edge-tts?text=${encodeURIComponent(japanese)}&t=${Date.now()}`);
    audio.play().catch(() => showToast('语音播放失败，请重试', 'error'));
  };

  // Helper to parse fields that may be string, JSON, or array
  const parseField = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try { const p = JSON.parse(val); if (Array.isArray(p)) return p; if (typeof p === 'object') return Object.values(p); return val.split(',').map(s => s.trim()).filter(Boolean); }
      catch (e) { return val.split(',').map(s => s.trim()).filter(Boolean); }
    }
    return val;
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>词汇学习 — 星空日语</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main>
        {/* Hero header */}
        <section className="relative pt-28 pb-10 md:pt-36 md:pb-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-200/30 to-transparent blur-3xl pointer-events-none" />
          <div className="container relative z-10">
            <div className="max-w-3xl">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-4">
                词汇学习
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                构建你的日语词汇库
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                按级别、教材或标签筛选，配合发音和例句，高效积累词汇量
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="container">
            {/* Filters */}
            <div className="mb-8 space-y-4">
              {/* Level filter */}
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button key={level} onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedLevel === level
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}>{level}</button>
                ))}
              </div>

              {/* Textbook filter */}
              <div className="flex flex-wrap gap-2">
                {['全部', ...textbookList.map(t => t.name)].map((tb) => (
                  <button key={tb} onClick={() => { setSelectedTextbook(tb); setSelectedLesson('全部'); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedTextbook === tb
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}>{tb}</button>
                ))}
              </div>

              {/* Lesson filter */}
              {selectedTextbook !== '全部' && (
                <div className="flex flex-wrap gap-2">
                  {['全部', ...(textbookLessonsMap[selectedTextbook] || [])].map((lesson) => (
                    <button key={lesson} onClick={() => setSelectedLesson(lesson)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        selectedLesson === lesson
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}>{lesson}</button>
                  ))}
                </div>
              )}

              {/* Tag filter */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button key={tag} onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                      selectedTag === tag
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
                    }`}>{tag}</button>
                ))}
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索词汇或发音..."
                  className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all" />
                {searchKeyword && (
                  <button onClick={() => setSearchKeyword('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>

              {/* Active filters summary */}
              {(selectedLevel !== '全部' || selectedTextbook !== '全部' || selectedTag !== '全部' || searchKeyword) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400">当前筛选:</span>
                  {selectedLevel !== '全部' && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{selectedLevel}</span>}
                  {selectedTextbook !== '全部' && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{selectedTextbook}</span>}
                  {selectedLesson !== '全部' && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{selectedLesson}</span>}
                  {selectedTag !== '全部' && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{selectedTag}</span>}
                  {searchKeyword && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">"{searchKeyword}"</span>}
                  <span className="text-xs text-gray-400 ml-1">— {totalCount} 条结果</span>
                </div>
              )}
            </div>

            {/* Vocab cards */}
            {safeVocabList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {safeVocabList.map((vocab) => {
                  const lc = levelColors[vocab.level] || levelColors['N5'];
                  const categories = parseField(vocab.category);
                  const pitchAccent = parseField(vocab.pitch_accent || vocab.pitchAccent);

                  return (
                    <div key={vocab.id} className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:shadow-blue-100/30 hover:-translate-y-1 hover:border-blue-200 transition-all duration-300">
                      {/* Top accent line */}
                      <div className="absolute top-0 left-5 right-5 h-[3px] rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Row 1: Level + categories + favorite */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${lc.bg} ${lc.text}`}>{vocab.level || 'N5'}</span>
                          {Array.isArray(categories) && categories.slice(0, 1).map((cat, i) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{cat}</span>
                          ))}
                        </div>
                        <button onClick={() => toggleFavorite(vocab.id)}
                          className={`p-1.5 rounded-full transition-all ${
                            favorites.includes(vocab.id) ? 'bg-yellow-50 text-yellow-500' : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                          }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={favorites.includes(vocab.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>

                      {/* Row 2: Word + meaning */}
                      <div className="mb-4">
                        <div className="text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-blue-700 transition-colors">{vocab.japanese}</div>
                        <div className="text-sm text-gray-500 truncate">{vocab.chinese}</div>
                      </div>

                      {/* Row 3: Pronunciation + speaker */}
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                        <span className="truncate flex-1">{vocab.pronunciation || '-'}</span>
                        <button onClick={() => speakVocab(vocab.japanese)}
                          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="发音">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        </button>
                      </div>

                      {/* Row 4: Pitch accent */}
                      <div className="text-xs text-gray-400 mb-5">
                        声调: {Array.isArray(pitchAccent) && pitchAccent.length > 0 ? pitchAccent.join(', ') : '-'}
                      </div>

                      {/* Row 5: Example button */}
                      <button onClick={() => { setCurrentVocab(vocab); setShowExampleModal(true); }}
                        className="w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 group-hover:bg-blue-100">
                        查看例句
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无词汇数据</h3>
                <p className="text-gray-500">请前往后台管理系统添加词汇</p>
              </div>
            )}

            {/* Load more */}
            {totalCount > safeVocabList.length && (
              <div className="mt-10 text-center">
                <p className="text-sm text-gray-400 mb-4">共 {totalCount} 条，已显示 {safeVocabList.length} 条</p>
                <button onClick={loadMore} disabled={loading}
                  className={`px-8 py-3 rounded-2xl font-medium transition-all ${
                    loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20'
                  }`}>
                  {loading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Example Modal */}
      <Modal
        title={<span className="text-xl font-bold">{currentVocab?.japanese || ''}</span>}
        open={showExampleModal}
        onCancel={() => setShowExampleModal(false)}
        footer={null}
        width={560}
      >
        <div className="py-2">
          {currentVocab && (() => {
            const cats = parseField(currentVocab.category);
            const pitch = parseField(currentVocab.pitch_accent || currentVocab.pitchAccent);
            let examples = currentVocab.examples;
            if (typeof examples === 'string') { try { examples = JSON.parse(examples); } catch (e) {} }

            const infoItems = [];
            if (currentVocab.chinese) infoItems.push(currentVocab.chinese);
            if (currentVocab.level) infoItems.push(currentVocab.level);
            if (Array.isArray(cats) && cats.length > 0) infoItems.push(cats.join(' · '));
            if (currentVocab.pronunciation) infoItems.push('发音: ' + currentVocab.pronunciation);
            if (Array.isArray(pitch) && pitch.length > 0) infoItems.push('声调: ' + pitch.join(', '));

            return (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {infoItems.map((item, i) => (
                    <span key={i} className={`px-3 py-1 rounded-full text-xs ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{item}</span>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" /> 例句
                  </h4>
                  {Array.isArray(examples) && examples.length > 0 && examples.some(ex => ex && ex.trim() !== '') ? (
                    <div className="space-y-2">
                      {examples.filter(ex => ex && ex.trim() !== '').map((ex, i) => (
                        <div key={i} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-4 py-3">
                          <div className="flex items-baseline gap-3">
                            <span className="text-blue-600 font-bold text-sm min-w-[24px]">{i + 1}.</span>
                            <p className="text-gray-800 text-sm leading-relaxed">{ex}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl"><p className="text-gray-400 text-sm">暂无例句</p></div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </Modal>
    </div>
  );
};

export default Vocabulary;
