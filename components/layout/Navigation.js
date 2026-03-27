import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const Navigation = () => {
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

  const menuItems = {
    home: {
      label: '首页',
      href: '/',
      icon: null
    },
    selfLearning: {
      label: '自助学习',
      href: '#',
      icon: null,
      children: [
        { label: '五十音图', href: '#' },
        { label: '词汇学习', href: '/vocabulary' },
        { label: '语法学习', href: '/grammar' }
      ]
    },
    practice: {
      label: '练习巩固',
      href: '#',
      icon: null,
      children: [
        { label: '词汇练习', href: '#' },
        { label: '语法练习', href: '#' },
        { label: '阅读练习', href: '#' },
        { label: '听力练习', href: '#' }
      ]
    },
    exam: {
      label: '真题考试',
      href: '/exam',
      icon: null
    },
    premiumCourses: {
      label: '精品课程',
      href: '#',
      icon: null,
      children: [
        { label: '日语语法体系', href: '#' },
        { label: '日语语法辨析', href: '#' }
      ]
    },
    featuredCourses: {
      label: '特色课程',
      href: '#',
      icon: null,
      children: [
        { label: 'IT日语', href: '#' },
        { label: 'なめらか日本語', href: '#' }
      ]
    },
    games: {
      label: '小游戏',
      href: '/typing-game',
      icon: null,
      children: [
        { label: '打字游戏', href: '/typing-game' },
        { label: '单词消消乐', href: '#' }
      ]
    }
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container py-4 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">日语学习网站</h1>
        <nav className="hidden md:flex space-x-6">
          {Object.entries(menuItems).map(([key, item]) => (
            <div
              key={key}
              className="relative group"
            >
              <a
                href={item.href}
                className="text-dark font-medium hover:text-primary transition-colors flex items-center"
              >
                {item.label}
                {item.children && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </a>
              {item.children && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {item.children.map((child, index) => (
                    <a
                      key={index}
                      href={child.href}
                      className="block px-4 py-2 text-dark hover:bg-primary hover:text-white rounded-md transition-colors"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <span className="text-dark font-medium">欢迎，{currentUser.username}</span>
              <a href="/profile" className="bg-gray-100 text-dark px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                个人中心
              </a>
              <button onClick={handleLogout} className="bg-gray-100 text-dark px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                退出登录
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-dark font-medium hover:text-primary transition-colors">登录</a>
              <a href="/register" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                注册
              </a>
            </>
          )}
        </div>
        <button className="md:hidden text-dark">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navigation;
