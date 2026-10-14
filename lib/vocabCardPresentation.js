const {
  formatVocabularyField,
  normalizeVocabularyField,
} = require('./vocabularyOptions');

function buildVocabularyCardMeta(vocab = {}) {
  const levelLabel = formatVocabularyField('level', vocab.level);
  const tags = normalizeVocabularyField('tag', vocab.tag);
  const pitchAccentLabel = formatVocabularyField(
    'pitchAccent',
    vocab.pitch_accent ?? vocab.pitchAccent,
  );

  return {
    levelLabel,
    tagLabels: Array.isArray(tags)
      ? tags.map((tag) => formatVocabularyField('tag', tag)).filter(Boolean)
      : [],
    pitchAccentLabel,
  };
}

module.exports = { buildVocabularyCardMeta };
