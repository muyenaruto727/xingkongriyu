// 配置文件 - 集中管理常量和配置

// API端点配置
export const API_ENDPOINTS = {
  // 词汇相关
  VOCABULARY: '/api/vocabulary',
  // 语法相关
  GRAMMAR: '/api/grammar',
  // 题目相关
  QUESTIONS: '/api/questions',
  // 考试相关
  EXAM: '/api/exam',
  // 考试记录相关
  EXAM_RECORDS: '/api/exam-records',
  // 反馈相关
  FEEDBACKS: '/api/feedbacks',
  // 文章相关
  ARTICLES: '/api/articles',
  // 用户相关
  USERS: '/api/users',
  // 登录相关
  LOGIN: '/api/login',
  // 注册相关
  REGISTER: '/api/register'
};

// 状态常量
export const STATUS = {
  // 反馈状态
  FEEDBACK: {
    PENDING: '待处理',
    PROCESSED: '已处理'
  },
  // 考试状态
  EXAM: {
    PENDING: '待开始',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成'
  }
};

// 题目类型
export const QUESTION_TYPES = {
  LISTENING: 'listening',
  READING: 'reading',
  GRAMMAR: 'grammar',
  VOCABULARY: 'vocabulary'
};

// 级别
export const LEVELS = [
  'N1', 'N2', 'N3', 'N4', 'N5'
];

// 反馈类型
export const FEEDBACK_TYPES = [
  { value: '题目有误', label: '题目有误', icon: '📄' },
  { value: '答案有误', label: '答案有误', icon: '✓' },
  { value: '解析有误', label: '解析有误', icon: '💡' },
  { value: '其他问题', label: '其他问题', icon: '❓' }
];

// 模态框尺寸
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
};

// 颜色配置
export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#3B82F6'
};

// 正则表达式
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
};

// 响应式断点
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px'
};

// 存储键名
export const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  TOKEN: 'token',
  LANGUAGE: 'language',
  THEME: 'theme'
};
