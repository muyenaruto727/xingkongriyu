const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// 统一的请求处理函数
async function request(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch ${endpoint}`);
    }

    const result = await res.json();
    // 统一处理响应格式
    return result.success ? result.data : result;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
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
  getUserList: async () => {
    return request('/api/users');
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
    return request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (username, password) => {
    try {
      // 使用专门的登录API
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        console.error('Login API response error:', res.status, res.statusText);
        if (res.status === 401) {
          throw new Error('用户名或密码错误');
        }
        throw new Error('登录失败，请重试');
      }
      
      const user = await res.json();
      console.log('Login successful:', user.username);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
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
    return request('/api/grammar/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  exportGrammar: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/grammar${queryString ? '?' + queryString : ''}`);
  },
};

export default api;