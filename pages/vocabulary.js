import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { api } from '../lib/api';

// 动态导入组件，实现懒加载
const Navigation = dynamic(() => import('../components/layout/Navigation'), {
  ssr: true
});

const Toast = dynamic(() => import('../components/common/Toast'), {
  ssr: true
});

const Vocabulary = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [vocabList, setVocabList] = useState([]);
  const [filteredVocabList, setFilteredVocabList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState('全部');
  const [selectedTag, setSelectedTag] = useState('全部');
  const [selectedTextbook, setSelectedTextbook] = useState('全部');
  const [selectedLesson, setSelectedLesson] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });
  const itemsPerPage = 20;

  const levels = ['全部', 'N1', 'N2', 'N3', 'N4', 'N5'];
  const tags = ['全部', '日常', '商务/职场', 'IT/计算机', '电子/半导体', '制造业', '金融/经济/财务', '旅游/餐饮/交通', '医疗', '其他'];
  const textbooks = ['全部', '综合日语1', '综合日语2', '综合日语3', '综合日语4', '大家的日语初级上', '大家的日语初级下', '大家的日语中级上', '大家的日语中级下'];
  
  // 教材和课程对应关系
  const textbookLessons = {
    '综合日语1': ['第5课', '第6课', '第7课', '第8课', '第9课', '第10课', '第11课', '第12课', '第13课', '第14课', '第15课'],
    '综合日语2': ['第16课', '第17课', '第18课', '第19课', '第20课', '第21课', '第22课', '第23课', '第24课', '第25课', '第26课', '第27课', '第28课', '第29课', '第30课'],
    '综合日语3': ['第1课', '第2课', '第3课', '第4课', '第5课', '第6课', '第7课', '第8课', '第9课', '第10课'],
    '综合日语4': ['第11课', '第12课', '第13课', '第14课', '第15课', '第16课', '第17课', '第18课', '第19课', '第20课'],
    '大家的日语初级上': ['第1课', '第2课', '第3课', '第4课', '第5课', '第6课', '第7课', '第8课', '第9课', '第10课', '第11课', '第12课', '第13课', '第14课', '第15课', '第16课', '第17课', '第18课', '第19课', '第20课', '第21课', '第22课', '第23课', '第24课', '第25课'],
    '大家的日语初级下': ['第25课', '第26课', '第27课', '第28课', '第29课', '第30课', '第31课', '第32课', '第33课', '第34课', '第35课', '第36课', '第37课', '第38课', '第39课', '第40课', '第41课', '第42课', '第43课', '第44课', '第45课', '第46课', '第47课', '第48课', '第49课', '第50课'],
    '大家的日语中级上': ['第1课', '第2课', '第3课', '第4课', '第5课', '第6课', '第7课', '第8课', '第9课', '第10课', '第11课', '第12课'],
    '大家的日语中级下': ['第13课', '第14课', '第15课', '第16课', '第17课', '第18课', '第19课', '第20课', '第21课', '第22课', '第23课', '第24课']
  };

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        // 只在currentUser为空时才设置，避免死循环
        if (!currentUser) {
          setCurrentUser(parsedUser);
        }
        // 只有当用户有有效id时才获取收藏
        if (parsedUser && parsedUser.id && typeof parsedUser.id === 'number' && parsedUser.id > 0) {
          fetchFavorites(parsedUser.id);
        }
      } catch (error) {
        console.error('Failed to parse user:', error);
      }
    }

    fetchVocabList();
  }, [currentUser]);

  const fetchFavorites = async (userId) => {
    try {
      // 验证userId是否为有效数字
      if (!userId || typeof userId !== 'number' || isNaN(userId) || userId <= 0) {
        console.error('Invalid userId:', userId);
        return;
      }
      const favoriteIds = await api.getFavorites(userId, 'vocabulary');
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const fetchVocabList = async () => {
    try {
      const params = {
        level: selectedLevel !== '全部' ? selectedLevel : '',
        tag: selectedTag !== '全部' ? selectedTag : '',
        textbook: selectedTextbook !== '全部' ? selectedTextbook : '',
        lesson: selectedLesson !== '全部' ? selectedLesson : '',
        search: searchKeyword
      };
      const response = await api.getVocabList(params);
      const data = response.data || [];
      setVocabList(data);
      setFilteredVocabList(data);
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error);
    }
  };

  // 当筛选参数变化时重新获取数据
  useEffect(() => {
    fetchVocabList();
  }, [selectedLevel, selectedTag, selectedTextbook, selectedLesson, searchKeyword]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/');
  };

  // 显示Toast通知
  const showToast = (message, type = 'info') => {
    setToast({ isOpen: true, message, type });
  };

  // 计算分页数据
  const safeVocabList = Array.isArray(filteredVocabList) ? filteredVocabList : [];
  const totalPages = Math.ceil(safeVocabList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVocabList = safeVocabList.slice(startIndex, endIndex);



  // 收藏函数
  const toggleFavorite = async (vocabId) => {
    if (!currentUser) {
      // 未登录时提示用户登录
      showToast('请先登录后再收藏', 'warning');
      router.push('/login');
      return;
    }

    try {
      if (favorites.includes(vocabId)) {
        // 取消收藏
        await api.removeFavorite(currentUser.id, 'vocabulary', vocabId);
        setFavorites(favorites.filter(id => id !== vocabId));
      } else {
        // 添加收藏
        await api.addFavorite(currentUser.id, 'vocabulary', vocabId);
        setFavorites([...favorites, vocabId]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showToast('收藏操作失败，请重试', 'error');
    }
  };

  // 发音函数
  const speakVocab = (japanese) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(japanese);
      speech.lang = 'ja-JP'; // 设置为日语
      speech.volume = 1;
      speech.rate = 0.5;
      speech.pitch = 1;
      speechSynthesis.speak(speech);
    } else {
      showToast('您的浏览器不支持语音合成功能', 'info');
    }
  };

  // 生成分页按钮
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 上一页按钮
    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-2 mx-1 rounded-lg border transition-colors ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-dark hover:bg-blue-50 hover:border-primary'
        }`}
      >
        上一页
      </button>
    );

    // 第一页
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-2 mx-1 rounded-lg border transition-colors ${
            currentPage === 1
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-dark hover:bg-blue-50 hover:border-primary'
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
      }
    }

    // 中间页码
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-2 mx-1 rounded-lg border transition-colors ${
            currentPage === i
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-dark hover:bg-blue-50 hover:border-primary'
          }`}
        >
          {i}
        </button>
      );
    }

    // 最后一页
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-2 mx-1 rounded-lg border transition-colors ${
            currentPage === totalPages
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-dark hover:bg-blue-50 hover:border-primary'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    // 下一页按钮
    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 mx-1 rounded-lg border transition-colors ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-dark hover:bg-blue-50 hover:border-primary'
        }`}
      >
        下一页
      </button>
    );

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>词汇学习</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Navigation />
      
      <main>
        <section className="pt-24 pb-12">
          <div className="container">


            {/* 级别筛选标签 */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedLevel === level
                        ? 'bg-primary text-white'
                        : 'bg-white text-dark border border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* 教材筛选 */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                {textbooks.map((textbook) => (
                  <button
                    key={textbook}
                    onClick={() => {
                      setSelectedTextbook(textbook);
                      setSelectedLesson('全部'); // 切换教材时重置课程选择
                    }}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTextbook === textbook
                        ? 'bg-primary text-white'
                        : 'bg-white text-dark border border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {textbook}
                  </button>
                ))}
              </div>
            </div>

            {/* 课程筛选 - 仅在选择了具体教材时显示 */}
            {selectedTextbook !== '全部' && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-3">
                  {['全部', ...(textbookLessons[selectedTextbook] || [])].map((lesson) => (
                    <button
                      key={lesson}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedLesson === lesson
                          ? 'bg-primary text-white'
                          : 'bg-white text-dark border border-gray-200 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {lesson}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 标签筛选 */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTag === tag
                        ? 'bg-primary text-white'
                        : 'bg-white text-dark border border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 搜索框 */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索词汇或发音..."
                  className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* 词汇统计 */}
            <div className="mb-6 text-sm text-muted">
              共 {safeVocabList.length} 个词汇
              {selectedLevel !== '全部' && `（${selectedLevel}级别）`}
              {selectedTextbook !== '全部' && `（${selectedTextbook}）`}
              {selectedLesson !== '全部' && `（${selectedLesson}）`}
              {selectedTag !== '全部' && `（${selectedTag}标签）`}
              {searchKeyword && `（搜索：${searchKeyword}）`}
            </div>
            
            {/* 词汇卡片网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentVocabList.map((vocab) => {
                const isFlipped = flippedCards.has(vocab.id);
                
                const toggleFlip = () => {
                  const newFlipped = new Set(flippedCards);
                  if (isFlipped) {
                    newFlipped.delete(vocab.id);
                  } else {
                    newFlipped.add(vocab.id);
                  }
                  setFlippedCards(newFlipped);
                };
                
                return (
                  <div key={vocab.id} className="perspective" style={{ perspective: '1000px' }}>
                    <div className={`card relative h-[280px] transition-all duration-600`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                      {/* 卡片正面 */}
                      <div className="absolute inset-0 p-5 border border-gray-100 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between" style={{ backfaceVisibility: 'hidden' }}>
                        {/* 第一行：级别、分类、收藏按钮 */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-100 text-xs px-2 py-1 rounded">{vocab.level || 'N5'}</span>
                            <div className="flex flex-wrap gap-1">
                              {(() => {
                                let categories = vocab.category;
                                if (typeof categories === 'string') {
                                  try {
                                    // 尝试解析JSON
                                    const parsed = JSON.parse(categories);
                                    if (Array.isArray(parsed)) {
                                      categories = parsed;
                                    } else if (typeof parsed === 'object') {
                                      categories = Object.values(parsed);
                                    } else {
                                      // 普通字符串，按逗号分割
                                      categories = categories.split(',').map(item => item.trim()).filter(Boolean);
                                    }
                                  } catch (e) {
                                    // 解析失败，按逗号分割
                                    categories = categories.split(',').map(item => item.trim()).filter(Boolean);
                                  }
                                }
                                if (Array.isArray(categories) && categories.length > 0) {
                                  return categories.map((cat, idx) => (
                                    <span key={idx} className="text-xs bg-blue-50 text-primary px-2 py-1 rounded">
                                      {cat}
                                    </span>
                                  ));
                                }
                              })()}
                            </div>
                          </div>
                          <button 
                            onClick={() => toggleFavorite(vocab.id)}
                            className={`p-2 rounded-full transition-colors ${favorites.includes(vocab.id) ? 'bg-yellow-100 text-yellow-500' : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-500'}`}
                            title="收藏到单词本"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={favorites.includes(vocab.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        </div>

                        {/* 第二行：词汇 */}
                        <div className="mb-3">
                          <div className="text-2xl font-bold text-dark mb-1">{vocab.japanese}</div>
                          <div className="text-base text-primary truncate">{vocab.chinese}</div>
                        </div>
                        
                        {/* 第三行：发音 */}
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <span className="text-xs text-gray-400 mr-2">发音：</span>
                          <span className="flex-1">{vocab.pronunciation || '-'}</span>
                          <button 
                            onClick={() => speakVocab(vocab.japanese)}
                            className="ml-2 text-gray-400 hover:text-primary transition-colors"
                            title="发音"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* 第四行：声调 */}
                        <div className="text-gray-500 text-sm mb-4">
                          <span className="text-xs text-gray-400 mr-2">声调：</span>
                          {(() => {
                            let pitchAccent = vocab.pitch_accent || vocab.pitchAccent;
                            if (typeof pitchAccent === 'string') {
                              try {
                                // 尝试解析JSON
                                const parsed = JSON.parse(pitchAccent);
                                if (Array.isArray(parsed)) {
                                  pitchAccent = parsed;
                                } else if (typeof parsed === 'object') {
                                  pitchAccent = Object.values(parsed);
                                } else {
                                  // 普通字符串，按逗号分割
                                  pitchAccent = pitchAccent.split(',').map(item => item.trim()).filter(Boolean);
                                }
                              } catch (e) {
                                // 解析失败，按逗号分割
                                pitchAccent = pitchAccent.split(',').map(item => item.trim()).filter(Boolean);
                              }
                            }
                            if (Array.isArray(pitchAccent) && pitchAccent.length > 0) {
                              return pitchAccent.join(', ');
                            } else {
                              return '-';
                            }
                          })()}
                        </div>
                        
                        {/* 第五行：查看例句按钮 */}
                        <div className="mt-auto">
                          <button
                            onClick={toggleFlip}
                            className="w-full py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                          >
                            查看例句
                          </button>
                        </div>
                      </div>
                      
                      {/* 卡片背面 */}
                      <div className="absolute inset-0 p-5 border border-gray-100 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-dark mb-1">{vocab.japanese}</h3>
                            <p className="text-primary text-sm">{vocab.chinese}</p>
                          </div>
                          <button 
                            onClick={toggleFlip}
                            className="text-gray-400 hover:text-gray-600"
                            title="返回"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                          {(() => {
                            let examples = vocab.examples;
                            if (typeof examples === 'string') {
                              try {
                                examples = JSON.parse(examples);
                              } catch (e) {
                                // 如果解析失败，保持原始字符串
                              }
                            }
                            if (Array.isArray(examples) && examples.length > 0 && examples.some(ex => ex && ex.trim() !== '')) {
                              return (
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-gray-500 mb-2">例句</h4>
                                  {examples.filter(ex => ex && ex.trim() !== '').map((example, index) => (
                                    <div key={index} className="bg-blue-50 rounded-lg p-3">
                                      <div className="flex items-start">
                                        <span className="text-primary font-medium mr-2">{index + 1}.</span>
                                        <p className="text-dark text-sm">{example}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              return (
                                <div className="text-center py-8">
                                  <p className="text-muted">暂无例句</p>
                                </div>
                              );
                            }
                          })()}
                        </div>
                        
                        <div className="mt-4">
                          <button
                            onClick={toggleFlip}
                            className="w-full py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                          >
                            返回
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 空状态 */}
            {currentVocabList.length === 0 && (
              <div className="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-muted text-lg">暂无词汇数据</p>
                <p className="text-gray-400 text-sm mt-2">请前往后台管理系统添加词汇</p>
              </div>
            )}
            
            {/* 分页条 */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center">
                {renderPagination()}
              </div>
            )}

            {/* 分页信息 */}
            {safeVocabList.length > 0 && (
              <div className="mt-4 text-center text-sm text-muted">
                第 {currentPage} / {totalPages} 页，共 {safeVocabList.length} 条
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Toast组件 */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default Vocabulary;
