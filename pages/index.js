import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

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

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>星空日语</title>
        <meta name="description" content="星空日语，提供词汇、语法、听力等学习资源" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Navigation />
      
      <main className="flex-grow">
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 animate-fade-in">开始你的日语学习之旅</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                通过我们丰富的学习资源，掌握日语的基础知识，提升你的语言能力，开启日本文化之旅
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <a href="/learning-center" className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">学习中心</h4>
                <p className="text-gray-600 mb-6 leading-relaxed">提供词汇学习、语法学习和已上架课程，帮助你系统学习日语。</p>
                <div className="text-indigo-600 font-medium">了解更多 &gt;</div>
              </a>
              
              <a href="/practice-center" className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">练习中心</h4>
                <p className="text-gray-600 mb-6 leading-relaxed">提供词汇练习、语法练习、听力练习、阅读练习和真题考试。</p>
                <div className="text-green-600 font-medium">了解更多 &gt;</div>
              </a>
              
              <a href="/tools" className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">小工具</h4>
                <p className="text-gray-600 mb-6 leading-relaxed">提供打字游戏和单词消消乐等互动学习工具，让学习更有趣。</p>
                <div className="text-purple-600 font-medium">了解更多 &gt;</div>
              </a>
            </div>
            

          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;