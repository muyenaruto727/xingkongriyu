import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message, Modal } from 'antd';
import dynamic from 'next/dynamic';
import { api } from '../../lib/api';

// 动态导入组件，实现懒加载
const Navigation = dynamic(() => import('../../components/layout/Navigation'), {
  ssr: true
});
const Footer = dynamic(() => import('../../components/layout/Footer'), {
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
  const [textbookList, setTextbookList] = useState([]); // 从API获取的教材列表
  const [textbookLessonsMap, setTextbookLessonsMap] = useState({}); // 教材课程映射
  const [totalCount, setTotalCount] = useState(0); // 总记录数
  const [loading, setLoading] = useState(false); // 加载状态
  const [showExampleModal, setShowExampleModal] = useState(false); // 例句弹窗状态
  const [currentVocab, setCurrentVocab] = useState(null); // 当前查看例句的词汇
  
  const itemsPerPage = 20;

  const levels = ['全部', 'N1', 'N2', 'N3', 'N4', 'N5'];
  const tags = ['全部', '日常', '商务/职场', 'IT/计算机', '电子/半导体', '制造业', '金融/经济/财务', '旅游/餐饮/交通', '医疗', '其他'];

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

  // 单独的useEffect用于获取教材列表，在组件挂载时执行
  useEffect(() => {
    fetchTextbookList();
  }, []);

  const fetchTextbookList = async () => {
    try {
      const data = await api.getTextbookList();
      setTextbookList(data);
      
      // 构建教材课程映射
      const lessonsMap = {};
      data.forEach(textbook => {
        lessonsMap[textbook.name] = (textbook.lessons || []).map(lesson => lesson.name);
      });
      setTextbookLessonsMap(lessonsMap);
    } catch (error) {
      console.error('Failed to fetch textbooks:', error);
    }
  };

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

  const fetchVocabList = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const params = {
        level: selectedLevel !== '全部' ? selectedLevel : '',
        tag: selectedTag !== '全部' ? selectedTag : '',
        textbook: selectedTextbook !== '全部' ? selectedTextbook : '',
        lesson: selectedLesson !== '全部' ? selectedLesson : '',
        search: searchKeyword,
        page: pageNum,
        limit: itemsPerPage
      };
      const response = await api.getVocabList(params);
      const data = response.data || [];
      const total = response.total || 0;
      
      if (append) {
        setVocabList(prev => [...prev, ...data]);
        setFilteredVocabList(prev => [...prev, ...data]);
      } else {
        setVocabList(data);
        setFilteredVocabList(data);
        setCurrentPage(pageNum);
      }
      setTotalCount(total);
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  // 当筛选参数变化时重新获取数据（从第一页开始）
  useEffect(() => {
    setCurrentPage(1);
    fetchVocabList(1);
  }, [selectedLevel, selectedTag, selectedTextbook, selectedLesson, searchKeyword]);

  // 上拉加载更多
  const loadMore = () => {
    if (loading) return;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    if (currentPage < totalPages) {
      fetchVocabList(currentPage + 1, true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/');
  };

  // 显示Toast通知
  const showToast = (msg, type = 'info') => {
    message[type](msg);
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
                {['全部', ...textbookList.map(t => t.name)].map((textbook) => (
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
                  {['全部', ...(textbookLessonsMap[selectedTextbook] || [])].map((lesson) => (
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

            {/* 筛选条件显示 */}
            <div className="mb-6 text-sm text-muted">
              {selectedLevel !== '全部' && `（${selectedLevel}级别）`}
              {selectedTextbook !== '全部' && `（${selectedTextbook}）`}
              {selectedLesson !== '全部' && `（${selectedLesson}）`}
              {selectedTag !== '全部' && `（${selectedTag}标签）`}
              {searchKeyword && `（搜索：${searchKeyword}）`}
            </div>
            
            {/* 词汇卡片网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {safeVocabList.map((vocab) => {
                // 打开例句弹窗
                const openExampleModal = () => {
                  setCurrentVocab(vocab);
                  setShowExampleModal(true);
                };
                
                return (
                  <div key={vocab.id} className="relative h-[280px]">
                    <div className="absolute inset-0 p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                      {/* 卡片内容 */}
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
                          <div className="text-2xl font-bold text-dark mb-1 truncate">{vocab.japanese}</div>
                          <div className="text-base text-primary truncate">{vocab.chinese}</div>
                        </div>
                        
                        {/* 第三行：发音 */}
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <span className="text-xs text-gray-400 mr-2">发音：</span>
                          <span className="flex-1 truncate">{vocab.pronunciation || '-'}</span>
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
                            onClick={openExampleModal}
                            className="w-full py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                          >
                            查看例句
                          </button>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 例句弹窗 */}
            <Modal
              title={
                <span className="text-2xl font-bold">{currentVocab?.japanese || ''}</span>
              }
              visible={showExampleModal}
              onCancel={() => setShowExampleModal(false)}
              footer={null}
              width={520}
            >
              <div className="py-4">
                {(() => {
                  if (!currentVocab) return null;
                  
                  // 处理分类/词性
                  let categories = currentVocab.category;
                  if (typeof categories === 'string') {
                    try {
                      const parsed = JSON.parse(categories);
                      if (Array.isArray(parsed)) {
                        categories = parsed;
                      } else if (typeof parsed === 'object') {
                        categories = Object.values(parsed);
                      } else {
                        categories = categories.split(',').map(item => item.trim()).filter(Boolean);
                      }
                    } catch (e) {
                      categories = categories.split(',').map(item => item.trim()).filter(Boolean);
                    }
                  }
                  
                  // 处理声调
                  let pitchAccent = currentVocab.pitch_accent || currentVocab.pitchAccent;
                  if (typeof pitchAccent === 'string') {
                    try {
                      const parsed = JSON.parse(pitchAccent);
                      if (Array.isArray(parsed)) {
                        pitchAccent = parsed;
                      } else if (typeof parsed === 'object') {
                        pitchAccent = Object.values(parsed);
                      } else {
                        pitchAccent = pitchAccent.split(',').map(item => item.trim()).filter(Boolean);
                      }
                    } catch (e) {
                      pitchAccent = pitchAccent.split(',').map(item => item.trim()).filter(Boolean);
                    }
                  }
                  
                  // 处理例句
                  let examples = currentVocab.examples;
                  if (typeof examples === 'string') {
                    try {
                      examples = JSON.parse(examples);
                    } catch (e) {
                      // 如果解析失败，保持原始字符串
                    }
                  }
                  
                  // 收集非空信息
                  const infoItems = [];
                  if (currentVocab.chinese) infoItems.push(currentVocab.chinese);
                  if (currentVocab.level) infoItems.push(currentVocab.level);
                  if (Array.isArray(categories) && categories.length > 0) infoItems.push(categories.join(','));
                  if (currentVocab.pronunciation) infoItems.push(currentVocab.pronunciation);
                  if (Array.isArray(pitchAccent) && pitchAccent.length > 0) infoItems.push(pitchAccent.join(','));
                  
                  return (
                    <div className="space-y-4">
                      {/* 紧凑的词汇信息 */}
                      <div className="flex flex-wrap gap-2">
                        {infoItems.map((item, index) => (
                          <span 
                            key={index} 
                            className={`px-3 py-1 rounded-full text-sm ${
                              index === 0 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                      
                      {/* 分隔线 */}
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      {/* 例句（主要区域） */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="w-1.5 h-4 bg-primary rounded-full mr-2"></span>
                          例句
                        </h4>
                        {Array.isArray(examples) && examples.length > 0 && examples.some(ex => ex && ex.trim() !== '') ? (
                          <div className="space-y-2">
                            {examples.filter(ex => ex && ex.trim() !== '').map((example, index) => (
                              <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg py-3 px-4">
                                <div className="flex items-baseline">
                                  <span className="text-primary font-bold text-base mr-3 min-w-[28px]">
                                    {index + 1}.
                                  </span>
                                  <p className="text-dark text-base leading-relaxed mb-0">{example}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-400">暂无例句</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Modal>

            {/* 空状态 */}
            {safeVocabList.length === 0 && (
              <div className="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-muted text-lg">暂无词汇数据</p>
                <p className="text-gray-400 text-sm mt-2">请前往后台管理系统添加词汇</p>
              </div>
            )}
            
            {/* 加载更多按钮 */}
            {totalCount > safeVocabList.length && (
              <div className="mt-8">
                <div className="text-center text-sm text-muted mb-4">
                  共 {totalCount} 条，已显示 {safeVocabList.length} 条
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className={`px-8 py-3 rounded-full font-medium transition-colors ${
                      loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-blue-600'
                    }`}
                  >
                    {loading ? '加载中...' : '加载更多'}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </section>
      </main>
    </div>
  );
};

export default Vocabulary;
