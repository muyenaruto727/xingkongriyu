function uniqueValues(values = []) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function resolveTextbookFilterNames(values = [], textbooks = []) {
  const namesById = new Map(
    textbooks.map((textbook) => [String(textbook.id), String(textbook.name)]),
  );

  return uniqueValues(values).map((value) => namesById.get(value) || value);
}

function buildTextbookCondition(column, parameterIndex) {
  return `(${column} = $${parameterIndex} OR ${column} LIKE $${parameterIndex}||',%' OR ${column} LIKE '%,'||$${parameterIndex} OR ${column} LIKE '%,'||$${parameterIndex}||',%')`;
}

function buildLessonCondition(parameterIndex, lessonValue) {
  if (String(lessonValue).includes(':')) {
    return `(lesson = $${parameterIndex} OR lesson LIKE $${parameterIndex}||':%' OR lesson LIKE $${parameterIndex}||',%' OR lesson LIKE '%,'||$${parameterIndex} OR lesson LIKE '%,'||$${parameterIndex}||':%' OR lesson LIKE '%,'||$${parameterIndex}||',%')`;
  }

  return `(lesson = $${parameterIndex} OR lesson LIKE $${parameterIndex}||',%' OR lesson LIKE '%,'||$${parameterIndex} OR lesson LIKE '%,'||$${parameterIndex}||',%' OR lesson LIKE '%:'||$${parameterIndex} OR lesson LIKE '%:'||$${parameterIndex}||':%' OR lesson LIKE '%:'||$${parameterIndex}||',%' OR lesson LIKE '%:'||$${parameterIndex}||':%,%')`;
}

function buildVocabularyTextbookFilter({
  textbookValues = [],
  lessonValues = [],
  startParamIndex = 1,
} = {}) {
  const clauses = [];
  const params = [];
  let nextParamIndex = startParamIndex;

  const textbookClauses = uniqueValues(textbookValues).map((textbook) => {
    const parameterIndex = nextParamIndex++;
    params.push(textbook);
    return `(${buildTextbookCondition('textbook', parameterIndex)} OR lesson LIKE $${parameterIndex}||':%' OR lesson LIKE '%,'||$${parameterIndex}||':%')`;
  });
  if (textbookClauses.length > 0) {
    clauses.push(`(${textbookClauses.join(' OR ')})`);
  }

  const lessonClauses = uniqueValues(lessonValues).map((lesson) => {
    const parameterIndex = nextParamIndex++;
    params.push(lesson);
    return buildLessonCondition(parameterIndex, lesson);
  });
  if (lessonClauses.length > 0) {
    clauses.push(`(${lessonClauses.join(' OR ')})`);
  }

  return { clauses, params, nextParamIndex };
}

module.exports = {
  resolveTextbookFilterNames,
  buildVocabularyTextbookFilter,
};
