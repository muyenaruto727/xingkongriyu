import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../components/layout/Navigation';
import { api } from '../lib/api';

const Profile = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [favoriteGrammar, setFavoriteGrammar] = useState([]);
  const [favoriteVocabulary, setFavoriteVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      if (parsedUser.id) {
        fetchFavorites(parsedUser.id);
      }
    } else {
      router.push('/');
    }
  }, []);

  const fetchFavorites = async (userId) => {
    try {
      setLoading(true);
      
      // 获取收藏的语法ID
      const grammarIds = await api.getFavorites(userId, 'grammar');
      // 获取收藏的词汇ID
      const vocabIds = await api.getFavorites(userId, 'vocabulary');
      
      // 获取语法详情
      if (grammarIds.length > 0) {
        const grammarList = await api.getGrammarList();
        const filteredGrammar = grammarList.filter(grammar => grammarIds.includes(grammar.id));
        setFavoriteGrammar(filteredGrammar);
      }
      
      // 获取词汇详情
      if (vocabIds.length > 0) {
        const vocabList = await api.getVocabList();
        const filteredVocab = vocabList.filter(vocab => vocabIds.includes(vocab.id));
        setFavoriteVocabulary(filteredVocab);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Head>
        <title>个人中心</title>
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
            <h2 className="title">个人中心</h2>
            <p className="text-muted">管理您的学习进度和收藏内容</p>
          </div>

          {/* 用户信息 */}
          <div className="mb-12 p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-dark mb-2">{currentUser?.username || '用户'}</h3>
                <p className="text-gray-600">{currentUser?.email || '邮箱'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>

          {/* 收藏的语法 */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-dark mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              收藏的语法
            </h3>
            {favoriteGrammar.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteGrammar.map((grammar) => (
                  <div key={grammar.id} className="card p-6 border border-gray-100 bg-white hover:border-primary/30 transition-all duration-300">
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                        {grammar.level || 'N5'}
                      </span>
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
              <div className="p-8 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">暂无收藏的语法</p>
              </div>
            )}
          </div>

          {/* 收藏的词汇 */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-dark mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              收藏的词汇
            </h3>
            {favoriteVocabulary.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favoriteVocabulary.map((vocab) => (
                  <div key={vocab.id} className="card p-5 border border-gray-100 hover:border-primary/30 transition-all duration-300 flex flex-col h-[280px] justify-between">
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
                    </div>
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-dark mb-1">{vocab.japanese}</div>
                      <div className="text-base text-primary truncate">{vocab.chinese}</div>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <span className="text-xs text-gray-400 mr-2">发音：</span>
                      <span className="flex-1">{vocab.pronunciation || '-'}</span>
                    </div>
                    <div className="text-gray-500 text-sm">
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
                              pitchAccent = [pitchAccent];
                            }
                          } catch (e) {
                            pitchAccent = [pitchAccent];
                          }
                        }
                        if (Array.isArray(pitchAccent) && pitchAccent.length > 0) {
                          return pitchAccent.map((accent, idx) => (
                            <span key={idx} className="inline-block mr-2">{accent}</span>
                          ));
                        } else {
                          return '-';
                        }
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">暂无收藏的词汇</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
