const VOCABULARY_FIELD_OPTIONS = {
  category: [
    { label: '名', value: 0 },
    { label: '形I', value: 1 },
    { label: '形II', value: 2 },
    { label: '自I', value: 3 },
    { label: '自II', value: 4 },
    { label: '自III', value: 5 },
    { label: '他I', value: 6 },
    { label: '他II', value: 7 },
    { label: '他III', value: 8 },
    { label: '自他I', value: 9 },
    { label: '自他II', value: 10 },
    { label: '自他III', value: 11 },
    { label: '副词', value: 12 },
    { label: '接续词', value: 13 },
    { label: '连体词', value: 14 },
    { label: '助词', value: 15 },
    { label: '惯用语', value: 16 },
  ],
  pitchAccent: [
    { label: '⓪', value: 0 },
    { label: '①', value: 1 },
    { label: '②', value: 2 },
    { label: '③', value: 3 },
    { label: '④', value: 4 },
    { label: '⑤', value: 5 },
    { label: '⑥', value: 6 },
    { label: '⑦', value: 7 },
    { label: '⑧', value: 8 },
    { label: '⑨', value: 9 },
    { label: '⑩', value: 10 },
  ],
  level: [
    { label: 'N1', value: 1 },
    { label: 'N2', value: 2 },
    { label: 'N3', value: 3 },
    { label: 'N4', value: 4 },
    { label: 'N5', value: 5 },
  ],
  tag: [
    { label: '日常', value: 0 },
    { label: '商务/职场', value: 1 },
    { label: 'IT/计算机', value: 2 },
    { label: '电子/半导体', value: 3 },
    { label: '制造业', value: 4 },
    { label: '金融/经济/财务', value: 5 },
    { label: '旅游/餐饮/交通', value: 6 },
    { label: '医疗', value: 7 },
    { label: '其他', value: 8 },
  ],
};

const FIELD_ALIASES = {
  pitch_accent: 'pitchAccent',
};

const MULTI_SELECT_FIELDS = new Set(['category', 'pitchAccent', 'tag']);

function resolveField(field) {
  return FIELD_ALIASES[field] || field;
}

function getFieldOptions(field) {
  return VOCABULARY_FIELD_OPTIONS[resolveField(field)] || [];
}

function getLookupMaps(field) {
  const options = getFieldOptions(field);
  const byValue = new Map();
  const byLabel = new Map();

  options.forEach((option) => {
    byValue.set(option.value, option.label);
    byLabel.set(option.label, option.value);
  });

  return { byValue, byLabel };
}

function isEmptyValue(value) {
  return value === undefined || value === null || value === '';
}

function coerceNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return null;
}

function toRawItems(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (isEmptyValue(raw)) {
    return [];
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return [];
    }

    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        if (parsed && typeof parsed === 'object') {
          return Object.values(parsed);
        }
      } catch (error) {
        // fall through to delimiter splitting
      }
    }

    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [raw];
}

function normalizeSingleField(field, raw) {
  if (isEmptyValue(raw)) {
    return raw;
  }

  const resolvedField = resolveField(field);
  const { byValue, byLabel } = getLookupMaps(resolvedField);
  const numericValue = coerceNumber(raw);

  if (numericValue !== null && byValue.has(numericValue)) {
    return numericValue;
  }

  const trimmed = typeof raw === 'string' ? raw.trim() : raw;
  if (typeof trimmed === 'string' && byLabel.has(trimmed)) {
    return byLabel.get(trimmed);
  }

  if (numericValue !== null) {
    return numericValue;
  }

  return trimmed;
}

function normalizeVocabularyField(field, raw) {
  const resolvedField = resolveField(field);

  if (MULTI_SELECT_FIELDS.has(resolvedField)) {
    const items = toRawItems(raw);
    const normalized = [];
    const seen = new Set();

    items.forEach((item) => {
      const value = normalizeSingleField(resolvedField, item);
      if (isEmptyValue(value)) {
        return;
      }

      const key = String(value);
      if (!seen.has(key)) {
        seen.add(key);
        normalized.push(value);
      }
    });

    return normalized;
  }

  return normalizeSingleField(resolvedField, raw);
}

function getVocabularyOptionValue(field, raw) {
  return normalizeSingleField(field, raw);
}

function getVocabularyOptionLabel(field, raw) {
  if (isEmptyValue(raw)) {
    return '';
  }

  const resolvedField = resolveField(field);
  const { byValue, byLabel } = getLookupMaps(resolvedField);
  const value = coerceNumber(raw);

  if (value !== null && byValue.has(value)) {
    return byValue.get(value);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (byLabel.has(trimmed)) {
      return trimmed;
    }
    return trimmed;
  }

  return String(raw);
}

function formatVocabularyField(field, raw) {
  const resolvedField = resolveField(field);
  const normalized = normalizeVocabularyField(resolvedField, raw);

  if (MULTI_SELECT_FIELDS.has(resolvedField)) {
    if (!Array.isArray(normalized) || normalized.length === 0) {
      return '';
    }
    return normalized.map((item) => getVocabularyOptionLabel(resolvedField, item)).join(', ');
  }

  return getVocabularyOptionLabel(resolvedField, normalized);
}

function normalizeVocabularyRecord(record = {}) {
  const category = normalizeVocabularyField('category', record.category);
  const pitchSource = record.pitch_accent !== undefined ? record.pitch_accent : record.pitchAccent;
  const pitch_accent = normalizeVocabularyField('pitchAccent', pitchSource);
  const level = normalizeVocabularyField('level', record.level);
  const tag = normalizeVocabularyField('tag', record.tag);

  return {
    ...record,
    category: Array.isArray(category) ? category.join(',') : category,
    pitch_accent: Array.isArray(pitch_accent) ? pitch_accent.join(',') : pitch_accent,
    level,
    tag: Array.isArray(tag) ? tag.join(',') : tag,
  };
}

function buildVocabularyFilterCandidates(field, raw) {
  const candidates = [];
  const resolvedField = resolveField(field);
  const { byValue } = getLookupMaps(resolvedField);
  const normalized = getVocabularyOptionValue(field, raw);

  if (!isEmptyValue(normalized)) {
    candidates.push(normalized);
    if (byValue.has(normalized)) {
      candidates.push(byValue.get(normalized));
    }
  }

  if (!isEmptyValue(raw)) {
    candidates.push(raw);
  }

  return [...new Set(candidates.map((item) => String(item)))];
}

module.exports = {
  VOCABULARY_FIELD_OPTIONS,
  buildVocabularyFilterCandidates,
  formatVocabularyField,
  getVocabularyOptionLabel,
  getVocabularyOptionValue,
  normalizeVocabularyField,
  normalizeVocabularyRecord,
};
