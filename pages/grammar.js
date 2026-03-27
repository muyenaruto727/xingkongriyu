import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../components/layout/Navigation';
import Toast from '../components/common/Toast';
import { api } from '../lib/api';

const Grammar = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [grammarList, setGrammarList] = useState([]);
  const [filteredGrammarList, setFilteredGrammarList] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });
  const itemsPerPage = 20;

  const levels = ['全部', 'N1', 'N2', 'N3', 'N4', 'N5'];

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      // 只在currentUser为空时才设置，避免死循环
      if (!currentUser) {
        setCurrentUser(parsedUser);
      }
      // 获取用户的语法收藏
      if (parsedUser.id) {
        fetchFavorites(parsedUser.id);
      }
    }

    fetchGrammarList();

    // 兼容旧的localStorage存储
    const storedFavorites = localStorage.getItem('grammarFavorites');
    if (storedFavorites && !currentUser) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, [currentUser]);

  const fetchFavorites = async (userId) => {
    try {
      // 验证userId是否为有效数字
      if (!userId || typeof userId !== 'number' || isNaN(userId) || userId <= 0) {
        console.error('Invalid userId:', userId);
        return;
      }
      const favoriteIds = await api.getFavorites(userId, 'grammar');
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const fetchGrammarList = async (params = {}) => {
    try {
      const data = await api.getGrammarList(params);
      setGrammarList(data);
      setFilteredGrammarList(data.slice(0, itemsPerPage));
    } catch (error) {
      console.error('Failed to fetch grammar:', error);
    }
  };

  useEffect(() => {
    const params = {};
    if (selectedLevel !== '全部') {
      params.level = selectedLevel;
    }
    if (searchKeyword) {
      params.search = searchKeyword;
    }
    fetchGrammarList(params);
  }, [selectedLevel, searchKeyword]);

  const toggleFavorite = async (grammarId) => {
    if (!currentUser) {
      // 未登录时提示用户登录
      showToast('请先登录后再收藏', 'warning');
      router.push('/login');
      return;
    }

    try {
      if (favorites.includes(grammarId)) {
        // 取消收藏
        await api.removeFavorite(currentUser.id, 'grammar', grammarId);
        setFavorites(favorites.filter(id => id !== grammarId));
      } else {
        // 添加收藏
        await api.addFavorite(currentUser.id, 'grammar', grammarId);
        setFavorites([...favorites, grammarId]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showToast('收藏操作失败，请重试', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/');
  };

  // 显示Toast通知
  const showToast = (message, type = 'info') => {
    setToast({ isOpen: true, message, type });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Head>
        <title>语法学习</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-primary hover:text-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          
          <div className="mb-8">
            <h2 className="title">语法学习</h2>
            <p className="text-muted">学习日语语法，提升语言能力</p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="md:w-48">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索语法点..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          {filteredGrammarList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
              {filteredGrammarList.map((grammar) => (
                <div key={grammar.id} className="card p-6 border border-gray-100 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                      {grammar.level || 'N5'}
                    </span>
                    <button
                      onClick={() => toggleFavorite(grammar.id)}
                      className={`p-2 rounded-full transition-colors ${
                        favorites.includes(grammar.id)
                          ? 'bg-red-100 text-red-500'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={favorites.includes(grammar.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-4">{grammar.grammarPoint}</h3>
                  <button
                    onClick={() => router.push(`/grammar/${grammar.id}`)}
                    className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-dark transition-colors text-sm"
                  >
                    查看详情
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted">暂无语法数据</p>
            </div>
          )}
        </div>
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

export default Grammar;
