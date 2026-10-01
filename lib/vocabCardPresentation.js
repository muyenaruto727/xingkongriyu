const {
  formatVocabularyField,
  normalizeVocabularyField,
} = require('./vocabularyOptions');

function buildVocabularyCardMeta(vocab = {}) {
  const levelLabel = formatVocabularyField('level', vocab.level);
  const tags = normalizeVocabularyField('tag', vocab.tag);

  return {
    levelLabel,
    tagLabels: Array.isArray(tags)
      ? tags.map((tag) => formatVocabularyField('tag', tag)).filter(Boolean)
      : [],
  };
}

module.exports = { buildVocabularyCardMeta };
