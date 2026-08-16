function normalizeFlashcardExamples(examples) {
  if (Array.isArray(examples)) {
    return examples.map((item) => String(item || '').trim()).filter(Boolean);
  }

  if (examples === undefined || examples === null) {
    return [];
  }

  const text = String(examples).trim();
  if (!text) {
    return [];
  }

  return text.split(/[;；]/).map((item) => item.trim()).filter(Boolean);
}

function getNextFlashcardReviewState(state = {}, action) {
  const current = {
    remembered: Number(state.remembered || 0),
    reviewAgain: Number(state.reviewAgain || 0),
  };

  if (action === 'remembered') {
    return {
      ...current,
      remembered: current.remembered + 1,
    };
  }

  if (action === 'reviewAgain') {
    return {
      ...current,
      reviewAgain: current.reviewAgain + 1,
    };
  }

  return current;
}

function getFlashcardProgress(currentIndex = 0, total = 0) {
  const safeTotal = Math.max(0, Number(total || 0));
  const current = safeTotal === 0 ? 0 : Math.min(safeTotal, Number(currentIndex || 0) + 1);

  return {
    current,
    total: safeTotal,
    percent: safeTotal === 0 ? 0 : Math.round((current / safeTotal) * 100),
  };
}

function hasFlashcardFieldValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && value !== '';
}

module.exports = {
  normalizeFlashcardExamples,
  getNextFlashcardReviewState,
  getFlashcardProgress,
  hasFlashcardFieldValue,
};
