import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const DailyQuote = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuote = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const result = await api.getRandomDailyQuote();
      if (result) {
        setQuote(result);
      }
    } catch (error) {
      api.handleError('获取每日一句失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const handleRefresh = () => {
    fetchQuote(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-primary mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start gap-4">
        {/* 左侧图标 */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-medium">每日一句</span>
          </div>

          <p className="text-gray-800 text-base md:text-lg font-medium leading-relaxed mb-3">
            {quote.sentence}
          </p>

          {quote.meaning && (
            <p className="text-gray-500 text-sm leading-relaxed mb-3 pl-3 border-l-2 border-indigo-200">
              {quote.meaning}
            </p>
          )}

          {quote.source && (
            <div className="flex items-center text-sm">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
              <span className="text-gray-400">— {quote.source}</span>
            </div>
          )}
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 rounded-full bg-indigo-400 border-2 border-white"></div>
              <div className="w-4 h-4 rounded-full bg-purple-400 border-2 border-white"></div>
              <div className="w-4 h-4 rounded-full bg-pink-400 border-2 border-white"></div>
            </div>
            <span className="text-xs text-gray-400 ml-2">学习日语，每日进步</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
            title="换一句"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyQuote;
