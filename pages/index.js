import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { api } from '../lib/api';

// 动态导入组件，实现懒加载
const Navigation = dynamic(() => import('../components/layout/Navigation'), {
  ssr: true
});

const Footer = dynamic(() => import('../components/layout/Footer'), {
  ssr: true
});

const Home = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // 让后端处理课程过滤，只获取已上架的课程
        const response = await api.getCourseList({ limit: 4, status: '上架' });
        const allCourses = response.data?.data || [];
        setCourses(allCourses);
      } catch (error) {
        console.error('获取课程失败:', error);
      }
    };
    fetchCourses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>日语学习网站</title>
        <meta name="description" content="日语学习网站，提供词汇、语法、听力等学习资源" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Navigation />
      
      <main>
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 animate-fade-in">开始你的日语学习之旅</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                通过我们丰富的学习资源，掌握日语的基础知识，提升你的语言能力，开启日本文化之旅
              </p>
            </div>
            
            {/* 自助学习 */}
            <div className="mb-20">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                <span className="inline-block w-8 h-8 bg-primary rounded-full mr-3 flex items-center justify-center text-white">1</span>
                自助学习
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-blue-100 text-primary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">五十音图</h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">学习日语的基础音节，掌握平假名和片假名，为日语学习打下坚实基础。</p>
                  <a href="#" className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium">开始学习</a>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-green-100 text-secondary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">词汇学习</h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">学习日语基础词汇，包括常用单词、短语和表达方式，扩大词汇量。</p>
                  <a href="/vocabulary" className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium">开始学习</a>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-purple-100 text-accent rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">语法学习</h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">掌握日语语法规则，理解句子结构和表达方式，提高语言应用能力。</p>
                  <a href="/grammar" className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium">开始学习</a>
                </div>
              </div>
            </div>
            
            {/* 练习巩固 */}
            <div className="mb-20">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                <span className="inline-block w-8 h-8 bg-primary rounded-full mr-3 flex items-center justify-center text-white">2</span>
                练习巩固
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-yellow-100 text-yellow-600 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">词汇练习</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">通过练习巩固所学词汇，提高记忆效果，强化词汇应用能力。</p>
                  <a href="#" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors inline-block font-medium">开始练习</a>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-red-100 text-red-600 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">语法练习</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">通过练习巩固语法知识，提高应用能力，掌握语法规则的实际运用。</p>
                  <a href="#" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors inline-block font-medium">开始练习</a>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-indigo-100 text-indigo-600 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">阅读练习</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">通过阅读练习提高阅读理解能力，熟悉日语表达习惯和思维方式。</p>
                  <a href="#" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors inline-block font-medium">开始练习</a>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">听力练习</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">提高日语听力能力，适应不同场景的对话，培养听力理解能力。</p>
                  <a href="#" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors inline-block font-medium">开始练习</a>
                </div>
              </div>
            </div>
            
            {/* 课程 */}
            <div className="mb-20">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="inline-block w-8 h-8 bg-primary rounded-full mr-3 flex items-center justify-center text-white">3</span>
                  课程
                </h3>
                <a href="/courses" className="text-primary hover:text-primary/80 font-medium">
                  更多课程 &gt;
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {(Array.isArray(courses) ? courses : []).slice(0, 4).map((course, index) => {
                  // 为每个课程生成不同的颜色
                  const colors = [
                    { bg: 'bg-teal-100', text: 'text-teal-600', button: 'bg-teal-500 hover:bg-teal-600' },
                    { bg: 'bg-orange-100', text: 'text-orange-600', button: 'bg-orange-500 hover:bg-orange-600' },
                    { bg: 'bg-blue-100', text: 'text-blue-600', button: 'bg-blue-500 hover:bg-blue-600' },
                    { bg: 'bg-green-100', text: 'text-green-600', button: 'bg-green-500 hover:bg-green-600' }
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={course.id} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className={`${color.bg} ${color.text} rounded-full w-16 h-16 flex items-center justify-center mb-6`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold mb-3 text-gray-800">{course.name}</h4>
                      <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>
                      <a href={`/course/${course.id}`} className={`${color.button} text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium`}>查看课程</a>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 小游戏 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                <span className="inline-block w-8 h-8 bg-primary rounded-full mr-3 flex items-center justify-center text-white">5</span>
                小游戏
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">打字游戏</h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">通过打字游戏提高日语输入速度和准确性，熟悉日语字符的输入。</p>
                  <a href="/typing-game" className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium">开始游戏</a>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-pink-100 text-pink-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">单词消消乐</h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">通过游戏方式巩固单词记忆，提高学习兴趣，让学习变得更加有趣。</p>
                  <a href="#" className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium">开始游戏</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;