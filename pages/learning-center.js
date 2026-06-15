import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import { api } from '../lib/api';

const LearningCenter = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await api.getCourseList({ status: '上架' });
        setCourses(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        api.handleError('获取课程列表失败:', error);
        setCourses([]);
      }
    };
    getCourses();
  }, []);

  const selfStudyCards = [
    {
      title: '日语入门',
      desc: '从五十音图开始，掌握假名、发音和基础问候语，为零基础学习者打好根基。',
      href: '/learning-center/introduction',
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: '词汇学习',
      desc: '按级别、教材和标签筛选词汇，配合发音朗读和例句，高效积累词汇量。',
      href: '/learning-center/vocabulary',
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: '语法学习',
      desc: '系统学习从 N5 到 N1 的语法要点，每个语法点都配有例句和翻译练习。',
      href: '/learning-center/grammar',
      gradient: 'from-violet-500 to-purple-500',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  const courseColors = [
    { gradient: 'from-amber-500 to-orange-500', bgLight: 'bg-amber-50', text: 'text-amber-600' },
    { gradient: 'from-rose-500 to-pink-500', bgLight: 'bg-rose-50', text: 'text-rose-600' },
    { gradient: 'from-sky-500 to-blue-500', bgLight: 'bg-sky-50', text: 'text-sky-600' },
    { gradient: 'from-emerald-500 to-green-500', bgLight: 'bg-emerald-50', text: 'text-emerald-600' },
    { gradient: 'from-violet-500 to-purple-500', bgLight: 'bg-violet-50', text: 'text-violet-600' },
    { gradient: 'from-cyan-500 to-teal-500', bgLight: 'bg-cyan-50', text: 'text-cyan-600' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Head>
        <title>学习中心 — 星空日语</title>
        <meta name="description" content="学习中心，提供词汇学习、语法学习和已上架课程" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        {/* ───── Hero ───── */}
        <section className="relative pt-28 pb-12 md:pt-40 md:pb-20 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-100/60 to-cyan-100/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-purple-100/40 to-pink-100/20 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

          <div className="container relative z-10">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-5">
                学习中心
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
                选择你的
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">学习路径</span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                从零基础到流利对话，这里有你需要的一切学习资源。
              </p>
            </div>
          </div>
        </section>

        {/* ───── 第一大块：自主学习 ───── */}
        <section className="pb-16 md:pb-24">
          <div className="container">
            {/* Section header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-[3px] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-blue-500">自主学习</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                自由探索，按需学习
              </h2>
              <p className="text-gray-500 text-base max-w-xl">
                根据自己的节奏和目标，选择入门、词汇或语法模块，循序渐进地提升日语能力。
              </p>
            </div>

            {/* 3 study cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selfStudyCards.map((card, i) => (
                <a
                  key={i}
                  href={card.href}
                  className={`group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:shadow-${card.textColor}/10 hover:-translate-y-1 hover:border-transparent transition-all duration-500`}
                >
                  {/* Top accent bar */}
                  <div className={`absolute top-0 left-6 right-6 h-[3px] rounded-full bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white">{card.icon}</span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold text-gray-900 mb-3 group-hover:${card.textColor} transition-colors duration-300`}>
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 leading-relaxed mb-6">
                    {card.desc}
                  </p>

                  {/* Link */}
                  <span className={`inline-flex items-center gap-2 text-sm font-semibold ${card.textColor}`}>
                    开始学习
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ───── 第二大块：精品课程 ───── */}
        <section className="pb-20 md:pb-28">
          <div className="container">
            {/* Section header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-[3px] rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-amber-500">精品课程</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                跟着课程，系统提升
              </h2>
              <p className="text-gray-500 text-base max-w-xl">
                由平台精心设计的系统化课程，带你从入门到精通，每一步都走得扎实。
              </p>
            </div>

            {/* Course cards */}
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, i) => {
                  const c = courseColors[i % courseColors.length];
                  return (
                    <a
                      key={course.id}
                      href={`/course/${course.id}`}
                      className="group relative bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all duration-500"
                    >
                      {/* Top accent */}
                      <div className={`absolute top-0 left-6 right-6 h-[3px] rounded-full bg-gradient-to-r ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                      {/* Header: icon + badges */}
                      <div className="flex items-start justify-between mb-5">
                        <div className={`w-12 h-12 bg-gradient-to-br ${c.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.isFree === '是' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'}`}>
                            {course.isFree === '是' ? '免费' : '付费'}
                          </span>
                          {course.format && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{course.format}</span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {course.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">
                        {course.description}
                      </p>

                      {/* CTA */}
                      <span className={`inline-flex items-center gap-2 text-sm font-semibold ${c.text}`}>
                        查看课程
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">暂无课程</h3>
                <p className="text-gray-500 text-sm">课程正在筹备中，敬请期待</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LearningCenter;
