import { message } from 'antd';

// 使用相对路径，避免CORS问题（Next.js同域API调用）

const API_BASE = '';
const DEFAULT_ERROR_MESSAGE = '请求失败，请稍后再试';
const NETWORK_ERROR_MESSAGE = '网络连接失败，请检查网络后重试';

const STATUS_ERROR_MESSAGES = {
  400: '请求参数有误，请调整后再试',
  401: '登录状态已失效，请重新登录',
  403: '没有权限执行此操作',
  404: '请求的内容不存在或已被删除',
  409: '数据状态已变化，请刷新后再试',
  422: '提交内容有误，请检查后再试',
  429: '操作太频繁了，请稍后再试',
  500: '服务器暂时不可用，请稍后再试',
  502: '服务连接异常，请稍后再试',
  503: '服务暂时不可用，请稍后再试',
  504: '服务响应超时，请稍后再试',
};

const TECHNICAL_ERROR_PATTERNS = [
  /^Failed to fetch/i,
  /^Load failed/i,
  /^No article found/i,
  /^NetworkError/i,
  /^TypeError/i,
  /^SyntaxError/i,
  /^Unexpected token/i,
  /^JSON\.parse/i,
  /\/api\//i,
  /\bfetch\b/i,
  /\bHTTP\b/i,
  /\bECONN/i,
  /\bETIMEDOUT\b/i,
  /\bENOTFOUND\b/i,
  /\bInvalid limit\b/i,
];

function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('currentUser');
}

class ApiRequestError extends Error {
  constructor(message, { status, data, endpoint, userMessage, cause } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.data = data;
    this.endpoint = endpoint;
    this.userMessage = userMessage || message || DEFAULT_ERROR_MESSAGE;
    this.response = status ? { status, data } : undefined;
    this.isApiRequestError = true;
    if (cause) {
      this.cause = cause;
    }
  }
}

function isTechnicalErrorMessage(value) {
  if (!value) return false;
  return TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(value));
}

function hasUserReadableText(value) {
  return /[\u3400-\u9fff\u3040-\u30ff]/.test(value || '');
}

function extractServerMessage(data = {}) {
  const dataError = data.error;
  return dataError?.message
    || (typeof dataError === 'string' ? dataError : '')
    || data.message
    || '';
}

function resolveApiErrorMessage({ status, data, error } = {}) {
  const serverMessage = extractServerMessage(data);
  if (serverMessage && hasUserReadableText(serverMessage) && !isTechnicalErrorMessage(serverMessage)) {
    return serverMessage;
  }

  if (status && STATUS_ERROR_MESSAGES[status]) {
    return STATUS_ERROR_MESSAGES[status];
  }

  const rawMessage = serverMessage || error?.message || error?.cause?.message || '';
  if (!status && (isTechnicalErrorMessage(rawMessage) || error instanceof TypeError)) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (rawMessage && !isTechnicalErrorMessage(rawMessage)) {
    return rawMessage;
  }

  return DEFAULT_ERROR_MESSAGE;
}

function createApiError(endpoint, error, responseData) {
  if (error instanceof ApiRequestError) {
    return error;
  }

  const status = error?.status || error?.response?.status;
  const data = responseData || error?.data || error?.response?.data || {};
  const serverMessage = extractServerMessage(data);
  const rawMessage = serverMessage || error?.message || `Failed to fetch ${endpoint}`;

  return new ApiRequestError(rawMessage, {
    status,
    data,
    endpoint,
    userMessage: resolveApiErrorMessage({ status, data, error }),
    cause: error,
  });
}

function applyRequestInterceptors(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    url: `${API_BASE}${endpoint}`,
    fetchOptions: {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    },
  };
}

async function parseJsonResponse(res) {
  return res.json().catch(() => ({}));
}

async function applyResponseInterceptors(endpoint, res) {
  const result = await parseJsonResponse(res);

  if (res.ok) {
    return result?.data;
  }

  if (res.status === 401 && result.error?.code === 'AUTHENTICATION_ERROR') {
    clearStoredAuth();
  }

  throw new ApiRequestError(extractServerMessage(result) || `Failed to fetch ${endpoint}`, {
    status: res.status,
    data: result,
    endpoint,
    userMessage: resolveApiErrorMessage({ status: res.status, data: result }),
  });
}

function applyErrorInterceptors(endpoint, error) {
  const apiError = createApiError(endpoint, error);

  if (typeof window !== 'undefined') {
    message.error(apiError.userMessage || DEFAULT_ERROR_MESSAGE);
  }

  return apiError;
}

async function requestRaw(endpoint, options = {}) {
  const { url, fetchOptions } = applyRequestInterceptors(endpoint, options);

  try {
    const res = await fetch(url, fetchOptions);
    return await applyResponseInterceptors(endpoint, res);
  } catch (error) {
    throw applyErrorInterceptors(endpoint, error);
  }
}

async function request(endpoint, options) {
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
export { ApiRequestError };
