import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';

const Tools = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>小工具 - 星空日语</title>
        <meta name="description" content="小工具，提供打字游戏和单词消消乐" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Navigation />
      
      <main className="flex-grow">
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tools;