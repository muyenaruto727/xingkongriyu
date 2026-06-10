// 使用相对路径，避免CORS问题（Next.js同域API调用）

const API_BASE = '';

function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('currentUser');
}

async function requestRaw(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status === 401 && errorData.error?.code === 'AUTHENTICATION_ERROR') {
        clearStoredAuth();
      }
      const error = new Error(errorData.error?.message || errorData.message || `Failed to fetch ${endpoint}`);
      error.response = { status: res.status, data: errorData };
      throw error;
    }

    const result = await res.json();
    return result?.data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// 统一的请求处理函数，成功时只返回 API 响应里的 data 字段
async function request(endpoint, options = {}) {
  return requestRaw(endpoint, options);
}

function withQuery(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return `${endpoint}${queryString ? '?' + queryString : ''}`;
}

export const api = {
  // Vocabulary
  getVocabList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/vocabulary${queryString ? '?' + queryString : ''}`);
  },

  createVocab: async (data) => {
    return request('/api/vocabulary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateVocab: async (id, data) => {
    return request(`/api/vocabulary?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteVocab: async (id) => {
    return request(`/api/vocabulary?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Favorites
  getFavorites: async (userId, itemType) => {
    const params = new URLSearchParams({ user_id: userId });
    if (itemType) {
      params.append('item_type', itemType);
    }
    return request(`/api/favorites?${params.toString()}`);
  },

  addFavorite: async (userId, itemType, itemId) => {
    return request('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, item_type: itemType, item_id: itemId }),
    });
  },

  removeFavorite: async (userId, itemType, itemId) => {
    const params = new URLSearchParams({ user_id: userId, item_type: itemType, item_id: itemId });
    return request(`/api/favorites?${params.toString()}`, {
      method: 'DELETE',
    });
  },

  // Grammar
  getGrammarList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/grammar${queryString ? '?' + queryString : ''}`);
  },

  createGrammar: async (data) => {
    return request('/api/grammar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGrammar: async (id, data) => {
    return request(`/api/grammar?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteGrammar: async (id) => {
    return request(`/api/grammar?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Articles
  getArticleList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/articles${queryString ? '?' + queryString : ''}`);
  },

  createArticle: async (data) => {
    return request('/api/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateArticle: async (id, data) => {
    return request(`/api/articles?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteArticle: async (id) => {
    return request(`/api/articles?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Get random article by level
  getRandomArticle: async (level) => {
    return request(`/api/articles/random?level=${encodeURIComponent(level)}`);
  },

  // Users
  getUserList: async (params = {}) => {
    return request(withQuery('/api/users', params));
  },

  createUser: async (data) => {
    return request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: async (id, data) => {
    return request(`/api/users?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id) => {
    return request(`/api/users?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Auth
  register: async (data) => {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (username, password) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Questions
  getQuestionList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/questions${queryString ? '?' + queryString : ''}`);
  },

  createQuestion: async (data) => {
    return request('/api/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateQuestion: async (id, data) => {
    return request(`/api/questions?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteQuestion: async (id) => {
    return request(`/api/questions?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Exam Records
  getExamRecords: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/exam-records${queryString ? '?' + queryString : ''}`);
  },

  createExamRecord: async (data) => {
    return request('/api/exam-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  generateExam: async (data) => {
    return request('/api/exam/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteExamRecord: async (id) => {
    return request(`/api/exam-records?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Courses
  getCourseList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/courses${queryString ? '?' + queryString : ''}`);
  },

  getCourseById: async (id) => {
    return request(`/api/courses?id=${id}`);
  },

  createCourse: async (data) => {
    return request('/api/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCourse: async (id, data) => {
    return request(`/api/courses?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCourse: async (id) => {
    return request(`/api/courses?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Chapters
  getChapterList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/chapters${queryString ? '?' + queryString : ''}`);
  },

  createChapter: async (data) => {
    return request('/api/chapters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateChapter: async (id, data) => {
    return request(`/api/chapters?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteChapter: async (id) => {
    return request(`/api/chapters?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Sections
  getSectionList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/sections${queryString ? '?' + queryString : ''}`);
  },

  createSection: async (data) => {
    return request('/api/sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSection: async (id, data) => {
    return request(`/api/sections?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteSection: async (id) => {
    return request(`/api/sections?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Listening
  getListeningList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/listening${queryString ? '?' + queryString : ''}`);
  },

  createListening: async (data) => {
    return request('/api/listening', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateListening: async (id, data) => {
    return request(`/api/listening?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteListening: async (id) => {
    return request(`/api/listening?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Reading
  getReadingList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/reading${queryString ? '?' + queryString : ''}`);
  },

  createReading: async (data) => {
    return request('/api/reading', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReading: async (id, data) => {
    return request(`/api/reading?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteReading: async (id) => {
    return request(`/api/reading?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Vocab Import/Export
  importVocab: async (data) => {
    return request('/api/vocabulary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  exportVocab: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/vocabulary${queryString ? '?' + queryString : ''}`);
  },

  // Grammar Import/Export
  importGrammar: async (data) => {
    return request('/api/grammar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  exportGrammar: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/grammar${queryString ? '?' + queryString : ''}`);
  },

  // Question Import/Export
  importQuestions: async (data) => {
    return request('/api/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  exportQuestions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/questions${queryString ? '?' + queryString : ''}`);
  },

  // Textbooks
  getTextbookList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/textbooks${queryString ? '?' + queryString : ''}`);
  },

  getTextbookById: async (id) => {
    return request(`/api/textbooks?id=${id}`);
  },

  createTextbook: async (data) => {
    return request('/api/textbooks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTextbook: async (id, data) => {
    return request(`/api/textbooks?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTextbook: async (id) => {
    return request(`/api/textbooks?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Daily Quote
  getDailyQuoteList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/daily-quote${queryString ? '?' + queryString : ''}`);
  },

  getRandomDailyQuote: async () => {
    return request('/api/daily-quote?random=true');
  },

  createDailyQuote: async (data) => {
    return request('/api/daily-quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDailyQuote: async (id, data) => {
    return request('/api/daily-quote', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  deleteDailyQuote: async (id) => {
    return request(`/api/daily-quote?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Stats
  getStats: async () => {
    return request('/api/stats');
  },

  // Feedbacks
  getFeedbacks: async (params = {}) => {
    return request(withQuery('/api/feedbacks', params));
  },

  createFeedback: async (data) => {
    return request('/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateFeedback: async (data) => {
    return request('/api/feedbacks', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // NHK Easy News
  getNhkNews: async (params = {}) => {
    return request(withQuery('/api/nhk-news', params));
  },

  refreshNhkNews: async () => {
    return request('/api/nhk-news', {
      method: 'POST',
    });
  },
};

export default api;
