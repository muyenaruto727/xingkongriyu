const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const duplicateGuardSql = read('scripts/sql/admin_duplicate_guards.sql');

const adminComponentRules = [
  {
    file: 'components/admin/ArticleManager.js',
    required: ['const [isSubmitting, setIsSubmitting] = useState(false)', 'if (isSubmitting) return;', 'okButtonProps={{ loading: isSubmitting, disabled: isSubmitting }}'],
  },
  {
    file: 'components/admin/CourseManager.js',
    required: ['if (isLoading) return;', 'loading={isLoading}', 'disabled={isLoading}'],
  },
  {
    file: 'components/admin/GrammarManager.js',
    required: ['if (isLoading) return;', 'okButtonProps={{ loading: isLoading, disabled: isLoading }}'],
  },
  {
    file: 'components/admin/QuestionManager.js',
    required: ['if (isLoading) return;', 'okButtonProps={{ loading: isLoading, disabled: isLoading }}'],
  },
  {
    file: 'components/admin/VocabManager.js',
    required: ['if (isLoading) return;', 'okButtonProps={{ loading: isLoading, disabled: isLoading }}'],
  },
  {
    file: 'components/admin/TextbookManager.js',
    required: ['if (isLoading) return;', 'okButtonProps={{ loading: isLoading, disabled: isLoading }}'],
  },
  {
    file: 'components/admin/DailyQuoteManager.js',
    required: ['const [submitting, setSubmitting] = useState(false)', 'if (submitting) return;', 'okButtonProps={{ loading: submitting, disabled: submitting }}'],
  },
  {
    file: 'components/admin/ChapterManager.js',
    required: ['if (isLoading) return;', 'confirmLoading={isLoading}', 'okButtonProps={{ loading: isLoading, disabled: isLoading }}'],
  },
  {
    file: 'components/admin/ListeningManager.js',
    required: ['if (isLoading) return;', 'okButtonProps={{ loading: isLoading, disabled: isLoading }}'],
  },
  {
    file: 'components/admin/ReadingManager.js',
    required: ['if (isLoading) return;', 'okButtonProps={{ loading: isLoading, disabled: isLoading }}'],
  },
];

const apiDuplicateRules = [
  { file: 'pages/api/articles/index.js', fields: ['DUPLICATE_RESOURCE', '文章标题已存在'] },
  { file: 'pages/api/chapters/index.js', fields: ['DUPLICATE_RESOURCE', '章节已存在'] },
  { file: 'pages/api/courses/index.js', fields: ['DUPLICATE_RESOURCE', '课程名称已存在'] },
  { file: 'pages/api/daily-quote/index.js', fields: ['DUPLICATE_RESOURCE', '每日一句已存在'] },
  { file: 'pages/api/grammar/index.js', fields: ['DUPLICATE_RESOURCE', '语法点已存在'] },
  { file: 'pages/api/questions/index.js', fields: ['DUPLICATE_RESOURCE', '题目已存在'] },
  { file: 'pages/api/sections/index.js', fields: ['DUPLICATE_RESOURCE', '小节已存在'] },
  { file: 'pages/api/textbooks/index.js', fields: ['DUPLICATE_RESOURCE', '教材名称已存在'] },
  { file: 'pages/api/vocabulary/index.js', fields: ['DUPLICATE_RESOURCE', '词汇已存在'] },
  { file: 'pages/api/listening/index.js', fields: ['DUPLICATE_RESOURCE', '听力材料已存在'] },
  { file: 'pages/api/reading/index.js', fields: ['DUPLICATE_RESOURCE', '阅读材料已存在'] },
];

const missingComponentRequirements = adminComponentRules.flatMap(({ file, required }) => {
  const source = read(file);
  return required
    .filter((snippet) => !source.includes(snippet))
    .map((snippet) => `${file} missing ${snippet}`);
});

const missingApiRequirements = apiDuplicateRules.flatMap(({ file, fields }) => {
  const source = read(file);
  return fields
    .filter((snippet) => !source.includes(snippet))
    .map((snippet) => `${file} missing ${snippet}`);
});

const requiredUniqueIndexes = [
  'idx_courses_unique_name',
  'idx_articles_unique_title',
  'idx_chapters_unique_course_name',
  'idx_sections_unique_chapter_name',
  'idx_daily_quotes_unique_sentence',
  'idx_grammar_unique_point_level',
  'idx_questions_unique_text_type_level',
  'idx_vocabulary_unique_japanese_pronunciation_level',
  'idx_listening_unique_difficulty_audio_type',
  'idx_reading_unique_difficulty_article',
];

assert(
  missingComponentRequirements.length === 0,
  `Admin submit guards missing:\n${missingComponentRequirements.join('\n')}`
);

assert(
  missingApiRequirements.length === 0,
  `API duplicate checks missing:\n${missingApiRequirements.join('\n')}`
);

const missingIndexes = requiredUniqueIndexes.filter((indexName) => !duplicateGuardSql.includes(indexName));
assert(
  missingIndexes.length === 0,
  `SQL duplicate index guards missing:\n${missingIndexes.join(', ')}`
);

console.log('admin submit guard checks passed');
