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
    <div className="flex flex-col min-h-screen bg-[#f6f0e6] text-[#261f1a]">
      <Head>
        <title>看新闻知天下 — 星空日语</title>
        <meta name="description" content="通过 NHK Easy News 阅读简单日语新闻，练习日语阅读能力" />
      </Head>

      <Navigation />

      <main
        className="flex-grow bg-[linear-gradient(rgba(83,63,43,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(83,63,43,0.04)_1px,transparent_1px)] bg-[size:34px_34px]"
        style={{ fontFamily: '"PingFang SC", "Hiragino Sans", "Microsoft YaHei", system-ui, sans-serif' }}
      >
        <section className="pt-24 pb-10 md:pt-32 md:pb-14">
          <div className="container max-w-6xl">
            <div className="mb-8">
              <button
                type="button"
                onClick={() => router.push('/tools')}
                className="inline-flex items-center gap-2 rounded-full border border-[#d9c8b5] bg-[#fffaf1]/80 px-4 py-2 text-sm font-semibold text-[#7b3f25] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b9512e] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#b9512e]/30"
              >
                <span aria-hidden="true">←</span>
                返回小工具
              </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 border-y border-[#c7ad93] py-2 text-sm font-semibold text-[#7b3f25]">
                  <span className="h-2 w-2 rounded-full bg-[#b9512e]" />
                  NHK NEWS WEB EASY
                </div>
                <h1
                  className="max-w-3xl text-4xl font-black leading-tight text-[#211914] md:text-6xl"
                  style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "Songti SC", serif' }}
                >
                  看新闻知天下
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#65564a] md:text-lg">
                  用简单日语读真实新闻。每天挑几篇短文，先扫标题，再读摘要，慢慢把词汇和时事连在一起。
                </p>
              </div>

              <aside className="border border-[#d6c3ad] bg-[#fffaf1] p-5 shadow-[10px_10px_0_rgba(87,58,35,0.1)]">
                <div className="border-b border-[#d6c3ad] pb-4">
                  <p className="text-sm font-semibold text-[#7b3f25]">今日阅读面板</p>
                  <p
                    className="mt-2 text-4xl font-black text-[#211914]"
                    style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "Songti SC", serif' }}
                  >
                    {loading ? '...' : newsList.length}
                    <span className="ml-2 text-base font-semibold text-[#7a6b5f]">条</span>
                  </p>
                </div>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#7a6b5f]">最新日期</dt>
                    <dd className="font-semibold text-[#2f2924]">{loading ? '加载中' : latestNewsLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#7a6b5f]">数据来源</dt>
                    <dd className="font-semibold text-[#2f2924]">NHK Easy</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#7a6b5f]">保留范围</dt>
                    <dd className="font-semibold text-[#2f2924]">近 30 天</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="container max-w-6xl">
            <div className="mb-6 flex flex-col gap-4 border-y border-[#d6c3ad] bg-[#fffaf1]/75 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#7b3f25]">
                  {loading ? '正在整理新闻列表' : `共 ${newsList.length} 条新闻`}
                </p>
                <p className="mt-1 text-sm text-[#7a6b5f]">点击标题会在新窗口打开原文。</p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 border border-[#b9512e] bg-[#b9512e] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_rgba(87,58,35,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#9f4427] focus:outline-none focus:ring-2 focus:ring-[#b9512e]/35 disabled:cursor-not-allowed disabled:opacity-55"
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

            {error && (
              <div className="mb-6 border-l-4 border-[#b9512e] bg-[#fffaf1] p-5 text-sm text-[#7b3f25] shadow-sm">
                <p className="font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchNews()}
                  className="mt-3 inline-flex border-b border-[#b9512e] font-bold text-[#b9512e] transition-colors hover:text-[#8d3a22] focus:outline-none focus:ring-2 focus:ring-[#b9512e]/25"
                >
                  重试
                </button>
              </div>
            )}

            {loading && (
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid gap-4 border border-[#e1d2bf] bg-[#fffaf1] p-5 md:grid-cols-[150px_minmax(0,1fr)_44px]">
                    <div className="h-5 w-28 animate-pulse bg-[#e7d9c7]" />
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 animate-pulse bg-[#e7d9c7]" />
                      <div className="h-4 w-full animate-pulse bg-[#efe4d5]" />
                      <div className="h-4 w-2/3 animate-pulse bg-[#efe4d5]" />
                    </div>
                    <div className="hidden h-10 w-10 animate-pulse bg-[#e7d9c7] md:block" />
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && newsList.length === 0 && (
              <div className="border border-[#d6c3ad] bg-[#fffaf1] px-6 py-16 text-center shadow-[8px_8px_0_rgba(87,58,35,0.08)]">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center border border-[#d6c3ad] bg-[#f6f0e6] text-[#b9512e]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-[#211914]">暂无新闻数据</h3>
                <p className="mb-6 text-[#7a6b5f]">点击「刷新新闻」从 NHK 获取最新新闻。</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex border border-[#b9512e] bg-[#b9512e] px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#9f4427] focus:outline-none focus:ring-2 focus:ring-[#b9512e]/35 disabled:opacity-55"
                >
                  立即获取
                </button>
              </div>
            )}

            {!loading && !error && newsList.length > 0 && (
              <div className="grid gap-4">
                {newsList.map((news, index) => (
                  <a
                    key={news.id}
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid gap-4 border border-[#d9c8b5] bg-[#fffaf1] p-5 shadow-[0_1px_0_rgba(87,58,35,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b9512e] hover:shadow-[8px_8px_0_rgba(185,81,46,0.11)] focus:outline-none focus:ring-2 focus:ring-[#b9512e]/35 md:grid-cols-[150px_minmax(0,1fr)_44px]"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-[#e5d8c8] pb-3 md:block md:border-b-0 md:border-r md:pb-0 md:pr-4">
                      <p className="font-mono text-xs font-bold text-[#b9512e]">
                        #{String(index + 1).padStart(2, '0')}
                      </p>
                      <p className="mt-0 text-sm font-semibold text-[#7a6b5f] md:mt-4">
                        {formatDate(news.pub_date) || '日期待同步'}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <h3
                        className="text-xl font-black leading-snug text-[#211914] transition-colors group-hover:text-[#b9512e] md:text-2xl"
                        style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "Songti SC", serif' }}
                      >
                        {news.title}
                      </h3>
                      {news.description && (
                        <p className="mt-3 line-clamp-6 text-sm leading-7 text-[#65564a] md:text-base">
                          {news.description}
                        </p>
                      )}
                    </div>

                    <div className="hidden items-start justify-end md:flex">
                      <span className="flex h-10 w-10 items-center justify-center border border-[#d6c3ad] bg-[#f6f0e6] text-[#7b3f25] transition-all group-hover:border-[#b9512e] group-hover:bg-[#b9512e] group-hover:text-white">
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
              <div className="mt-10 border-t border-[#d6c3ad] pt-5 text-center">
                <p className="text-xs font-medium text-[#7a6b5f]">
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
