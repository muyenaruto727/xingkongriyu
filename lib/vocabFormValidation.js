function hasRequiredValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== '';
}

function validateVocabularyForm(form) {
  if (!String(form.japanese || '').trim()) {
    return '请输入日文';
  }
  if (!String(form.pronunciation || '').trim()) {
    return '请输入发音';
  }
  if (!String(form.chinese || '').trim()) {
    return '请输入中文';
  }
  if (!hasRequiredValue(form.level)) {
    return '请选择级别';
  }
  if (!hasRequiredValue(form.tag)) {
    return '请选择标签';
  }
  if (!hasRequiredValue(form.category)) {
    return '请选择类别';
  }
  if (!hasRequiredValue(form.pitchAccent)) {
    return '请选择声调';
  }

  return null;
}

module.exports = {
  validateVocabularyForm,
};
