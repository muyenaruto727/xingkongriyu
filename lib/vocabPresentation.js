function formatPitchAccent(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
      .join(', ');
  }

  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

function countVocabularyExamples(examples) {
  if (Array.isArray(examples)) {
    return examples.filter((example) =>
      String(example?.sentence ?? '').trim(),
    ).length;
  }

  return String(examples ?? '').trim() ? 1 : 0;
}

module.exports = {
  countVocabularyExamples,
  formatPitchAccent,
};
