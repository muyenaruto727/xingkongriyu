const {
  formatVocabularyField,
  normalizeVocabularyField,
} = require('./vocabularyOptions');
const { normalizeRelatedGrammars } = require('./grammarRelated');

function toNonEmptyString(value) {
  return String(value ?? '').trim();
}

function toNonEmptyStringList(value) {
  if (typeof value === 'string') {
    try {
      return toNonEmptyStringList(JSON.parse(value));
    } catch {
      return value ? [value.trim()] : [];
    }
  }

  return Array.isArray(value)
    ? value.map(toNonEmptyString).filter(Boolean)
    : [];
}

function buildLinkedVocabularyDetails(item = {}) {
  const tags = normalizeVocabularyField('tag', item.tag);

  return {
    pronunciation: toNonEmptyString(item.pronunciation),
    pitchAccent: formatVocabularyField('pitchAccent', item.pitch_accent ?? item.pitchAccent),
    category: formatVocabularyField('category', item.category),
    tags: Array.isArray(tags)
      ? tags.map((tag) => formatVocabularyField('tag', tag)).filter(Boolean)
      : [],
  };
}

function buildLinkedGrammarDetails(item = {}) {
  const rawExercises = Array.isArray(item.translationExercises)
    ? item.translationExercises
    : toNonEmptyStringList(item.translationExercises);
  const rawAnswers = Array.isArray(item.referenceAnswers)
    ? item.referenceAnswers
    : toNonEmptyStringList(item.referenceAnswers);

  return {
    japaneseMeaning: toNonEmptyString(item.japaneseMeaning),
    chineseMeaning: toNonEmptyString(item.chineseMeaning),
    textbook: toNonEmptyString(item.textbook),
    lesson: toNonEmptyString(item.lesson),
    continuation: toNonEmptyString(item.continuation),
    attentionPoints: toNonEmptyString(item.attentionPoints),
    examples: toNonEmptyStringList(item.examples),
    exercises: rawExercises.reduce((items, question, index) => {
      const normalizedQuestion = toNonEmptyString(question);
      if (normalizedQuestion) {
        items.push({
          question: normalizedQuestion,
          answer: toNonEmptyString(rawAnswers[index]),
        });
      }
      return items;
    }, []),
    relatedGrammars: normalizeRelatedGrammars(item.relatedGrammars || item.related_grammars),
  };
}

module.exports = {
  buildLinkedVocabularyDetails,
  buildLinkedGrammarDetails,
};
