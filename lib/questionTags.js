const QUESTION_TAG_LABELS = [
  '助词',
  '敬语',
  '动词活用',
  '形容词活用',
  '自他动词',
  '指示词',
  '接续词',
  '复合动词',
  '副词',
  '拟声拟态词',
  '授受关系',
  '条件表现',
  '可能表现',
  '被动',
  '使役',
  '使役被动',
  '否定',
  '形式名词',
];

const QUESTION_TAG_OPTIONS = QUESTION_TAG_LABELS.map((label) => ({
  value: label,
  label,
}));

function normalizeQuestionTag(value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const normalized = String(value).trim();
  return QUESTION_TAG_LABELS.includes(normalized) ? normalized : '';
}

function normalizeQuestionTagForType(questionType, value) {
  if (questionType !== 'grammar') {
    return '';
  }

  return normalizeQuestionTag(value);
}

module.exports = {
  QUESTION_TAG_LABELS,
  QUESTION_TAG_OPTIONS,
  normalizeQuestionTag,
  normalizeQuestionTagForType,
};
