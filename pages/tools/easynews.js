import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { message } from 'antd';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import api from '../../lib/api';

const NhkEasyNews = () => {
  const router = useRouter();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const result = await api.getNhkNews({ limit: 50 });
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
      await api.refreshNhkNews();
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
    <div className="tool-page-shell">
      <Head>
        <title>NHK Easy News — 星空日语</title>
        <meta name="description" content="通过 NHK Easy News 阅读简单日语新闻，练习日语阅读能力" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        <section className="tool-main">
          <div className="tool-container-wide">
            <div className="mb-8">
              <button
                type="button"
                onClick={() => router.push('/tools')}
                className="tool-back"
              >
                <span aria-hidden="true">←</span>
                返回小工具
              </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div>
                <div className="tool-eyebrow">
                  NHK NEWS WEB EASY
                </div>
                <h1 className="tool-title">
                  NHK Easy News
                </h1>
                <p className="tool-description">
                  用简单日语读真实新闻。每天挑几篇短文，先扫标题，再读摘要，慢慢把词汇和时事连在一起。
                </p>
              </div>

              <aside className="tool-panel p-6">
                <p className="text-sm font-semibold text-slate-500">今日阅读面板</p>
                <p className="mt-3 text-4xl font-black text-slate-950">
                    {loading ? '...' : newsList.length}
                  <span className="ml-2 text-base font-semibold text-slate-500">条</span>
                </p>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">最新日期</dt>
                    <dd className="font-semibold text-slate-800">{loading ? '加载中' : latestNewsLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">数据来源</dt>
                    <dd className="font-semibold text-slate-800">NHK Easy</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">保留范围</dt>
                    <dd className="font-semibold text-slate-800">近 30 天</dd>
                  </div>
                </dl>
              </aside>
            </div>

            <div className="tool-panel mt-10 mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {loading ? '正在整理新闻列表' : `共 ${newsList.length} 条新闻`}
                </p>
                <p className="mt-1 text-sm text-slate-500">点击标题会在新窗口打开原文。</p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="tool-button-primary gap-2"
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
                  <div key={i} className="tool-panel grid gap-4 p-5 md:grid-cols-[150px_minmax(0,1fr)_44px]">
                    <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="hidden h-10 w-10 animate-pulse rounded-md bg-slate-200 md:block" />
                  </div>
                ))}
              </div>
            )}

            {!loading && newsList.length === 0 && (
              <div className="tool-panel px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-md border border-slate-200 bg-[#fafaf7] text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">暂无新闻数据</h3>
                <p className="mb-6 text-slate-500">点击「刷新新闻」从 NHK 获取最新新闻。</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="tool-button-primary"
                >
                  立即获取
                </button>
              </div>
            )}

            {!loading && newsList.length > 0 && (
              <div className="grid gap-4">
                {newsList.map((news, index) => (
                  <a
                    key={news.id}
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tool-news-card group grid gap-4 md:grid-cols-[150px_minmax(0,1fr)_44px]"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 md:block md:border-b-0 md:border-r md:pb-0 md:pr-4">
                      <p className="font-mono text-xs font-bold text-slate-500">
                        #{String(index + 1).padStart(2, '0')}
                      </p>
                      <p className="mt-0 text-sm font-semibold text-slate-500 md:mt-4">
                        {formatDate(news.pub_date) || '日期待同步'}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-bold leading-snug text-slate-950 transition-colors group-hover:text-slate-700 md:text-2xl">
                        {news.title}
                      </h3>
                      {news.description && (
                        <p className="mt-3 line-clamp-6 text-sm leading-7 text-slate-600 md:text-base">
                          {news.description}
                        </p>
                      )}
                    </div>

                    <div className="hidden items-start justify-end md:flex">
                      <span className="tool-icon-button">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M9 7h8v8" />
                        </svg>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {!loading && newsList.length > 0 && (
              <div className="mt-10 border-t border-slate-200 pt-5 text-center">
                <p className="text-xs font-medium text-slate-500">
                  新闻来源：NHK NEWS WEB EASY · 数据每日自动更新 · 仅保留近 30 天新闻
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
