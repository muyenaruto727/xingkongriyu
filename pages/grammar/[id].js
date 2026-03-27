import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../components/layout/Navigation';
import Toast from '../../components/common/Toast';
import { api } from '../../lib/api';

const GrammarDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [currentUser, setCurrentUser] = useState(null);
  const [grammar, setGrammar] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showAnswers, setShowAnswers] = useState({});
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    if (id) {
      const fetchGrammar = async () => {
        try {
          const grammarList = await api.getGrammarList();
          const found = grammarList.find(g => g.id === parseInt(id));
          if (found) {
            setGrammar(found);
          }
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

  if (!grammar) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <Head>
          <title>语法详情</title>
        </Head>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Head>
        <title>{grammar.grammarPoint} - 语法详情</title>
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

          <div className="card p-8 border border-gray-100 bg-white">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                  {grammar.level || 'N5'}
                </span>
                <h2 className="text-3xl font-bold text-dark mt-4">{grammar.grammarPoint}</h2>
              </div>
              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-full transition-colors ${
                  favorites.includes(grammar.id)
                    ? 'bg-red-100 text-red-500'
                    : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={favorites.includes(grammar.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {grammar.japaneseMeaning && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-2">日文释义</div>
                    <div className="text-dark">{grammar.japaneseMeaning}</div>
                  </div>
                )}
                {grammar.chineseMeaning && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-2">中文释义</div>
                    <div className="text-dark">{grammar.chineseMeaning}</div>
                  </div>
                )}
              </div>

              {grammar.continuation && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">接续方式</div>
                  <div className="text-dark font-medium">{grammar.continuation}</div>
                </div>
              )}

              {grammar.attentionPoints && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">注意事项</div>
                  <div className="text-dark">{grammar.attentionPoints}</div>
                </div>
              )}

              {grammar.examples && grammar.examples.length > 0 && grammar.examples.some(ex => ex && ex.trim() !== '') && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">例句</div>
                  <div className="space-y-2">
                    {grammar.examples.filter(ex => ex && ex.trim() !== '').map((example, exIndex) => (
                      <div key={exIndex} className="bg-blue-50 p-3 rounded-lg text-dark">
                        <span className="text-primary font-medium mr-2">{exIndex + 1}.</span>
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {grammar.translationExercises && grammar.translationExercises.length > 0 && grammar.translationExercises.some(ex => ex && ex.trim() !== '') && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">翻译练习</div>
                  <div className="space-y-3">
                    {grammar.translationExercises.filter(ex => ex && ex.trim() !== '').map((exercise, exIndex) => (
                      <div key={exIndex} className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-dark mb-2">
                          <span className="text-primary font-medium mr-2">{exIndex + 1}.</span>
                          {exercise}
                        </div>
                        {grammar.referenceAnswers && grammar.referenceAnswers[exIndex] && (
                          <div>
                            {!showAnswers[exIndex] ? (
                              <button
                                onClick={() => setShowAnswers({...showAnswers, [exIndex]: true})}
                                className="text-primary hover:text-blue-700 text-sm font-medium"
                              >
                                查看答案
                              </button>
                            ) : (
                              <div className="text-sm text-green-600 mt-2">
                                <span className="font-medium">参考答案：</span>{grammar.referenceAnswers[exIndex]}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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

export default GrammarDetail;
