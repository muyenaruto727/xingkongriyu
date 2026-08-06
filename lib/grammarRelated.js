const MAX_RELATED_GRAMMAR_ROWS = 10;

function createEmptyRelatedGrammarRow() {
  return { grammar: '', id: '' };
}

function parseRelatedGrammarInput(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeRelatedGrammars(value) {
  return parseRelatedGrammarInput(value)
    .slice(0, MAX_RELATED_GRAMMAR_ROWS)
    .map((item) => ({
      grammar: String(item?.grammar ?? '').trim(),
      id: String(item?.id ?? '').trim(),
    }))
    .filter((item) => item.grammar && item.id);
}

function ensureEditableRelatedGrammars(value) {
  const normalized = normalizeRelatedGrammars(value);
  return normalized.length > 0 ? normalized : [createEmptyRelatedGrammarRow()];
}

module.exports = {
  MAX_RELATED_GRAMMAR_ROWS,
  createEmptyRelatedGrammarRow,
  ensureEditableRelatedGrammars,
  normalizeRelatedGrammars,
};
