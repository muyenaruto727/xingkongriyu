import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Navigation from "../components/layout/Navigation";
import Footer from "../components/layout/Footer";

const Tools = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>小工具 - 星空日语</title>
        <meta
          name="description"
          content="小工具，提供打字游戏、单词消消乐、单词闪卡、五十音消消乐、动词变形练习和听力入门"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Navigation />

      <main className="flex-grow">
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-sky-100 text-sky-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 4v16M16 4v16"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">
                  五十音消消乐
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  匹配平假名和片假名，在轻量游戏中熟悉五十音对应关系。
                </p>
                <Link
                  href="/tools/gojyuon"
                  className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium"
                >
                  开始游戏
                </Link>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">
                  打字游戏
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  通过打字游戏提高日语输入速度和准确性，熟悉日语字符的输入。
                </p>
                <Link
                  href="/tools/typing-game"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium"
                >
                  开始游戏
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-pink-100 text-pink-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">
                  单词消消乐
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  通过游戏方式巩固单词记忆，提高学习兴趣，让学习变得更加有趣。
                </p>
                <Link
                  href="/tools/tetris-game"
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium"
                >
                  开始游戏
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">
                  单词闪卡
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  按教材和课程筛选单词，通过翻转卡片强化记忆，支持中日文对照。
                </p>
                <Link
                  href="/tools/flash-cards"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium"
                >
                  开始记忆
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-amber-100 text-amber-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h8M8 12h6M8 17h5"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">
                  动词变变变
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  随机抽取动词和变形形式，输入假名或标准写法，练熟日语动词变化。
                </p>
                <Link
                  href="/tools/verb-change"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium"
                >
                  开始练习
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-cyan-100 text-cyan-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l10 6.5L9 19z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8v9"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">
                  听力入门
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  选择单词或句子，听音频，输入听到的日语内容。
                </p>
                <Link
                  href="/tools/easy-listening"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium"
                >
                  开始听写
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-orange-100 text-orange-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">
                  看新闻知天下
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  阅读日语新闻，用真实语料提升阅读能力。数据每日自动更新。
                </p>
                <Link
                  href="/tools/easynews"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium"
                >
                  开始阅读
                </Link>
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
