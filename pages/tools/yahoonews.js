import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message } from 'antd';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import api from '../../lib/api';

const YahooNews = () => {
  const router = useRouter();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const result = await api.getYahooNews({ limit: 50 });
      const list = Array.isArray(result) ? result : result?.data;
      if (Array.isArray(list)) {
        setNewsList(list);
      } else {
        setNewsList([]);
        message.warning('新闻数据暂时无法读取，请稍后再试');
      }
    } catch {
      // API errors are shown by lib/api.js; keep page state cleanup here.
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
      await api.refreshYahooNews();
      await fetchNews(true);
    } catch {
      // API errors are shown by lib/api.js; keep page state cleanup here.
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  const latestNewsDate = newsList
    .map((news) => new Date(news.pub_date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b - a)[0];
  const latestNewsLabel = latestNewsDate ? formatDate(latestNewsDate) : '等待同步';

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7fb] text-gray-900">
      <Head>
        <title>看新闻知天下 — 星空日语</title>
        <meta name="description" content="浏览 Yahoo Japan 新闻，使用真实日语时事材料提升阅读能力" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        <section className="pt-24 pb-10 md:pt-32 md:pb-14">
          <div className="container max-w-6xl">
            <button
              type="button"
              onClick={() => router.push('/tools')}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              <span aria-hidden="true">←</span>
              返回小工具
            </button>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div>
                <p className="mb-4 inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                  Yahoo Japan News
                </p>
                <h1 className="text-4xl font-black leading-tight text-gray-950 md:text-6xl">
                  看新闻知天下
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
                  浏览 Yahoo Japan 新闻标题和摘要，用真实时事语料练习快速阅读、关键词识别和新闻日语表达。
                </p>
              </div>

              <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-gray-500">新闻面板</p>
                <p className="mt-3 text-4xl font-black text-gray-950">
                  {loading ? '...' : newsList.length}
                  <span className="ml-2 text-base font-semibold text-gray-500">条</span>
                </p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-gray-500">最新日期</dt>
                    <dd className="font-semibold text-gray-800">{loading ? '加载中' : latestNewsLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-gray-500">数据来源</dt>
                    <dd className="font-semibold text-gray-800">Yahoo Japan</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-gray-500">保留范围</dt>
                    <dd className="font-semibold text-gray-800">近 30 天</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="container max-w-6xl">
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {loading ? '正在整理新闻列表' : `共 ${newsList.length} 条新闻`}
                </p>
                <p className="mt-1 text-sm text-gray-500">点击新闻会在新窗口打开原文。</p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-55"
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

            {loading && (
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
                    <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100" />
                    <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            )}

            {!loading && newsList.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                <h3 className="mb-2 text-xl font-bold text-gray-900">暂无新闻数据</h3>
                <p className="mb-6 text-gray-500">点击「刷新新闻」从 Yahoo Japan 获取最新新闻。</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex rounded-lg bg-red-500 px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-55"
                >
                  立即获取
                </button>
              </div>
            )}

            {!loading && newsList.length > 0 && (
              <div className="grid gap-4">
                {newsList.map((news, index) => (
                  <a
                    key={news.id || news.link}
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500">
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-600">#{String(index + 1).padStart(2, '0')}</span>
                          <span>{formatDate(news.pub_date) || '日期待同步'}</span>
                        </div>
                        <h3 className="text-xl font-bold leading-snug text-gray-950 transition-colors group-hover:text-red-600 md:text-2xl">
                          {news.title}
                        </h3>
                        {news.description && (
                          <p className="mt-3 line-clamp-4 text-sm leading-7 text-gray-600 md:text-base">
                            {news.description}
                          </p>
                        )}
                      </div>
                      <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all group-hover:bg-red-500 group-hover:text-white md:flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M9 7h8v8" />
                        </svg>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {!loading && newsList.length > 0 && (
              <div className="mt-10 border-t border-gray-200 pt-5 text-center">
                <p className="text-xs font-medium text-gray-500">
                  新闻来源：Yahoo Japan News · 数据每日自动更新 · 仅保留近 30 天新闻
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

export default YahooNews;
