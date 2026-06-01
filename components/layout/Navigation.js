import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = ({ activeTab }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = {
    home: { label: '首页', href: '/', icon: null },
    learningCenter: { label: '学习中心', href: '/learning-center', icon: null },
    practiceCenter: { label: '练习中心', href: '/practice-center', icon: null },
    exam: { label: '真题考试', href: '/exam', icon: null },
    tools: { label: '小工具', href: '/tools', icon: null },
    oneOnOne: { label: '1V1辅导', href: '/one-on-one', icon: null }
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container h-16 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center h-full mb-0">星空日语</h1>
        <nav className="hidden md:flex space-x-6 items-center h-full">
          {Object.entries(menuItems).map(([key, item]) => (
            <div
              key={key}
              className="relative flex items-center h-full"
            >
              <a
                href={item.href}
                className={`font-medium transition-colors flex items-center ${
                    // 首页激活状态
                    (item.href === '/' && router.pathname === '/') ||
                    // 学习中心激活状态
                    (item.href === '/learning-center' && router.pathname.startsWith('/learning-center')) ||
                    // 练习中心激活状态
                    (item.href === '/practice-center' && router.pathname === '/practice-center') ||
                    // 真题考试激活状态
                    (item.href === '/exam' && router.pathname.startsWith('/exam')) ||
                    // 小工具激活状态
                    (item.href === '/tools' && router.pathname === '/tools') ||
                    // 1V1辅导激活状态
                    (item.href === '/one-on-one' && router.pathname === '/one-on-one')
                      ? 'text-primary' 
                      : 'text-dark hover:text-primary'
                  }`}
              >
                {item.label}
              </a>
            </div>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-dark font-medium">欢迎，{user.username}</span>
              <a href="/profile" className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors" title="个人中心">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </a>
              <button onClick={handleLogout} className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors" title="退出登录">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
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
