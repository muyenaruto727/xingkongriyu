import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import api from '../../lib/api';

const NhkEasyNews = () => {
  const router = useRouter();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchNews = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const result = await api.getNhkNews({ limit: 50 });
      const list = Array.isArray(result) ? result : result?.data;
      if (Array.isArray(list)) {
        setNewsList(list);
      } else {
        setError('获取新闻失败');
      }
    } catch (err) {
      console.error('Fetch news failed:', err);
      setError('获取新闻失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await api.refreshNhkNews();
      await fetchNews(true);
    } catch (err) {
      console.error('Refresh failed:', err);
      setError('刷新失败，请稍后再试');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 via-white to-red-50">
      <Head>
        <title>看新闻知天下 — 星空日语</title>
        <meta name="description" content="通过 NHK Easy News 阅读简单日语新闻，练习日语阅读能力" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        {/* Hero Header */}
        <section className="relative pt-28 pb-10 md:pt-36 md:pb-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-orange-200/30 to-transparent blur-3xl pointer-events-none" />
          <div className="container relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => router.push('/tools')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
              >
                <span aria-hidden="true">←</span>
                返回小工具
              </button>
            </div>
            <div className="max-w-3xl">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-orange-600 bg-orange-50 px-4 py-2 rounded-full mb-4">
                看新闻知天下
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                看新闻知天下
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                阅读日本最新新闻，用真实日语语料提升阅读理解能力。数据每日自动更新。
              </p>
            </div>
          </div>
        </section>

        {/* News List */}
        <section className="pb-20">
          <div className="container max-w-4xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">
                {loading ? '加载中...' : `共 ${newsList.length} 条新闻`}
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? '刷新中...' : '刷新新闻'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
                {error}
                <button
                  type="button"
                  onClick={() => fetchNews()}
                  className="ml-3 underline hover:no-underline"
                >
                  重试
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
                    <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-50 rounded w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* News List */}
            {!loading && !error && newsList.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无新闻数据</h3>
                <p className="text-gray-500 mb-6">点击「刷新新闻」从 NHK 获取最新新闻</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  立即获取
                </button>
              </div>
            )}

            {!loading && !error && newsList.length > 0 && (
              <div className="space-y-4">
                {newsList.map((news) => (
                  <a
                    key={news.id}
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-orange-100/30 hover:-translate-y-1 hover:border-orange-200 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Date */}
                        {news.pub_date && (
                          <span className="inline-block text-xs font-medium text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full mb-3">
                            {formatDate(news.pub_date)}
                          </span>
                        )}
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {news.title}
                        </h3>
                        {/* Description */}
                        {news.description && (
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                            {news.description}
                          </p>
                        )}
                      </div>
                      {/* Arrow */}
                      <div className="flex-shrink-0 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-300 group-hover:text-orange-400 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Info Footer */}
            {!loading && newsList.length > 0 && (
              <div className="mt-10 text-center">
                <p className="text-xs text-gray-400">
                  新闻来源：NHK NEWS WEB EASY — 数据每日自动更新，仅保留近 30 天新闻
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NhkEasyNews;
