function normalizeTetrisList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function cleanTetrisVocabulary(data) {
  return normalizeTetrisList(data).filter((item) => item?.japanese && item?.chinese);
}

function buildTetrisVocabularyParams({
  sourceMode = 'level',
  selectedLevel = 'N5',
  selectedTextbook = '',
  selectedTextbookName = '',
  selectedLesson = '',
  pairCount = 8,
} = {}) {
  const limit = Math.max(1, Number(pairCount || 8));

  if (sourceMode === 'textbook') {
    if (!selectedTextbook || !selectedLesson) {
      return { error: '请先选择教材和课程' };
    }

    const textbookName = selectedTextbookName || selectedTextbook;
    return {
      params: {
        textbook: textbookName,
        lesson: `${textbookName}:${selectedLesson}`,
        limit,
      },
    };
  }

  return {
    params: {
      level: selectedLevel,
      limit,
    },
  };
}

module.exports = {
  normalizeTetrisList,
  cleanTetrisVocabulary,
  buildTetrisVocabularyParams,
};
