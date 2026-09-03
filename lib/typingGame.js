function normalizeTypingList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function cleanTypingVocabulary(data) {
  return normalizeTypingList(data)
    .filter((item) => item?.japanese && item?.chinese)
    .map((item) => ({
      ...item,
      meaning: item.meaning || item.chinese,
    }));
}

function buildTypingVocabularyParams({
  gameMode = 'word',
  sourceMode = 'level',
  selectedLevel = 'N5',
  selectedTextbook = '',
  selectedTextbookName = '',
  selectedLesson = '',
  wordCount = 20,
} = {}) {
  if (gameMode !== 'word') {
    return null;
  }

  const limit = Math.max(1, Number(wordCount || 20));

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
  normalizeTypingList,
  cleanTypingVocabulary,
  buildTypingVocabularyParams,
};
