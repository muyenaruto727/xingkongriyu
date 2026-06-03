import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { message } from 'antd';
import DashboardStats from './DashboardStats';
import UserManager from '../UserManager';
import VocabManager from '../VocabManager';
import GrammarManager from '../GrammarManager';
import ArticleManager from '../ArticleManager';
import FeedbackManager from '../FeedbackManager';
import ListeningManager from '../ListeningManager';
import ReadingManager from '../ReadingManager';
import CourseManager from '../CourseManager';
import QuestionManager from '../QuestionManager';
import TextbookManager from '../TextbookManager';

const Dashboard = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  // 标签页状态
  const [tabs, setTabs] = useState([
    { id: 'dashboard', name: '仪表板', active: true }
  ]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // 显示Toast通知
  const showToast = (msg, type = 'info') => {
    message[type](msg);
  };

  // 打开标签页
  const openTab = (tabId, tabName) => {
    const existingTab = tabs.find(tab => tab.id === tabId);
    if (!existingTab) {
      setTabs([...tabs, { id: tabId, name: tabName, active: false }]);
    }
    switchTab(tabId);
  };

  // 切换标签页
  const switchTab = (tabId) => {
    setTabs(tabs.map(tab => ({ ...tab, active: tab.id === tabId })));
    setActiveTab(tabId);
  };

  // 关闭标签页
  const closeTab = (e, tabId) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    let newActiveTab = activeTab;
    
    if (activeTab === tabId) {
      newActiveTab = newTabs[0].id;
    }
    
    setTabs(newTabs);
    setActiveTab(newActiveTab);
  };

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats />;
      case 'users':
        return <UserManager showToast={showToast} />;
      case 'vocabulary':
        return <VocabManager showToast={showToast} />;
      case 'grammar':
        return <GrammarManager showToast={showToast} />;
      case 'articles':
        return <ArticleManager showToast={showToast} />;
      case 'feedback':
        return <FeedbackManager showToast={showToast} />;
      case 'listening':
        return <ListeningManager showToast={showToast} />;
      case 'reading':
        return <ReadingManager showToast={showToast} />;
      case 'courses':
        return <CourseManager showToast={showToast} />;
      case 'questions':
        return <QuestionManager />;
      case 'textbooks':
        return <TextbookManager />;
      default:
        return <DashboardStats />;
    }
  };

  // 渲染占位符
  const renderPlaceholder = (title) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-dark">{title}</h3>
      </div>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-dark mb-2">功能开发中</h3>
          <p className="text-muted">此功能正在开发中，敬请期待</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className="flex">
        <div className="w-64 bg-white shadow-sm h-screen fixed">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-dark">后台管理</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => openTab('dashboard', '仪表板')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  仪表板
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openTab('users', '用户管理')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  用户管理
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openTab('vocabulary', '词汇管理')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'vocabulary' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  词汇管理
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openTab('grammar', '语法管理')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'grammar' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  语法管理
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openTab('textbooks', '教材管理')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'textbooks' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  教材管理
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openTab('courses', '课程管理')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'courses' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  课程管理
                </button>
              </li>

              <li>
                <button 
                  onClick={() => openTab('listening', '听力管理')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'listening' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  听力管理
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openTab('reading', '阅读管理')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'reading' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  阅读管理
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openTab('articles', '文章管理')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'articles' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  文章管理
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openTab('questions', 'JLPT题库')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'questions' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  JLPT题库
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openTab('feedback', '反馈管理')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'feedback' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  反馈管理
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* 主内容区 */}
        <div className="ml-64 flex-1 p-6">
          {/* 标签页导航 */}
          <div className="bg-white shadow-sm rounded-t-lg border border-b-0 border-gray-200 p-2 flex space-x-2 overflow-x-auto">
            {tabs.map(tab => (
              <div 
                key={tab.id}
                className={`flex items-center px-4 py-2 rounded-lg cursor-pointer ${tab.active ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                onClick={() => switchTab(tab.id)}
              >
                <span>{tab.name}</span>
                {tabs.length > 1 && (
                  <button 
                    className="ml-2 text-sm"
                    onClick={(e) => closeTab(e, tab.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 标签页内容 */}
          <div className="bg-white shadow-sm rounded-b-lg border border-gray-200 p-6 min-h-[calc(100vh-120px)]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;