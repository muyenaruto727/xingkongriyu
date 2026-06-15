import { useState, useEffect } from 'react';
import api from '../../../lib/api';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    growthRate: 0,
    pendingFeedback: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await api.getStats();
        setStats({
          totalUsers: result.totalUsers || 0,
          growthRate: result.growthRate || 0,
          pendingFeedback: result.pendingFeedback || 0,
          recentActivity: result.recentActivity || []
        });
      } catch (error) {
        api.handleError('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">仪表板</h2>
        <p className="text-gray-500">欢迎回来，管理员！这里是系统的统计信息。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 用户总数卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            {stats.growthRate > 0 && (
              <span className="inline-flex items-center text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +{stats.growthRate}%
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mb-1">用户总数</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
        </div>

        {/* 最近活动卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center mb-4">
            <div className="bg-purple-50 p-3 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">最近活动</p>
              <p className="text-sm font-medium text-gray-700">{stats.recentActivity.length} 条记录</p>
            </div>
          </div>
          <ul className="space-y-2">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.slice(0, 3).map((activity, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                  <span className="truncate">用户 <span className="font-medium text-gray-800">{activity.username}</span> 登录系统</span>
                </li>
              ))
            ) : (
              <li className="flex items-center text-sm text-gray-400">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2 flex-shrink-0"></span>
                <span>暂无活动记录</span>
              </li>
            )}
          </ul>
        </div>

        {/* 待处理任务卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center mb-4">
            <div className="bg-orange-50 p-3 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">待处理任务</p>
              <p className="text-sm font-medium text-gray-700">{stats.pendingFeedback} 项待处理</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">审核用户反馈</span>
              </div>
              <span className="bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                {stats.pendingFeedback} 条
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
