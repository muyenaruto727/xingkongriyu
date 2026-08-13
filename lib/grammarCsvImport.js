const { splitCsvRows } = require('./vocabCsvImport');
const { normalizeRelatedGrammars } = require('./grammarRelated');

const CSV_HEADERS = [
  'grammarPoint',
  'level',
  'japaneseMeaning',
  'chineseMeaning',
  'continuation',
  'attentionPoints',
  'examples',
  'translationExercises',
  'referenceAnswers',
  'relatedGrammars',
];

const MULTI_VALUE_FIELDS = new Set([
  'examples',
  'translationExercises',
  'referenceAnswers',
]);

const HEADER_ALIASES = {
  grammar_point: 'grammarPoint',
  japanese_meaning: 'japaneseMeaning',
  chinese_meaning: 'chineseMeaning',
  attention_points: 'attentionPoints',
  translation_exercises: 'translationExercises',
  reference_answers: 'referenceAnswers',
  related_grammars: 'relatedGrammars',
};

const TEMPLATE_ROWS = [
  {
    grammarPoint: '〜ている',
    level: 'N5',
    japaneseMeaning: '現在進行中の動作を表す',
    chineseMeaning: '表示正在进行的动作',
    continuation: '動詞のて形 + いる',
    attentionPoints: '瞬间动词搭配时也可表示结果状态。',
    examples: '私は日本語を勉強しています。;彼はテレビを見ています。',
    translationExercises: '我正在学习日语。;他正在看电视。',
    referenceAnswers: '私は日本語を勉強しています。;彼はテレビを見ています。',
    relatedGrammars: '〜てある|12;〜ところ|18',
  },
  {
    grammarPoint: '〜ばかり',
    level: 'N3',
    japaneseMeaning: '直前の完了や偏りを表す',
    chineseMeaning: '表示刚刚完成，或总是/光是做某事',
    continuation: '動詞た形 + ばかり;名詞 + ばかり',
    attentionPoints: '和「〜ところ」相比，时间感可以更主观。',
    examples: '日本に来たばかりです。;弟はゲームばかりしています。',
    translationExercises: '我刚到日本。;弟弟总是在玩游戏。',
    referenceAnswers: '日本に来たばかりです。;弟はゲームばかりしています。',
    relatedGrammars: '〜ところ|18;〜だけ|24',
  },
  {
    grammarPoint: '〜ために',
    level: 'N4',
    japaneseMeaning: '目的や原因を表す',
    chineseMeaning: '表示目的或原因',
    continuation: '動詞辞書形 + ために;名詞 + のために',
    attentionPoints: '表示目的时，前后主语通常一致。',
    examples: '試験に合格するために勉強します。;雨のために試合が中止になりました。',
    translationExercises: '为了通过考试而学习。;因为下雨，比赛取消了。',
    referenceAnswers: '試験に合格するために勉強します。;雨のために試合が中止になりました。',
    relatedGrammars: '〜ように|31;〜ので|9',
  },
];

function normalizeHeader(header) {
  const normalized = String(header || '').replace(/^\uFEFF/, '').trim();
  return HEADER_ALIASES[normalized] || normalized;
}

function splitMultiValue(value) {
  return String(value || '')
    .split(/[;；]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRelatedGrammars(value) {
  const rows = splitMultiValue(value).map((item) => {
    const separatorIndex = item.indexOf('|');
    if (separatorIndex === -1) {
      return { grammar: item, id: '' };
    }

    return {
      grammar: item.slice(0, separatorIndex).trim(),
      id: item.slice(separatorIndex + 1).trim(),
    };
  });

  return normalizeRelatedGrammars(rows);
}

function parseGrammarCsv(content) {
  const rows = splitCsvRows(String(content || ''));
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map(normalizeHeader);

  return rows.slice(1).map((row) => {
    const record = {};

    headers.forEach((header, index) => {
      const value = String(row[index] || '').trim();
      if (MULTI_VALUE_FIELDS.has(header)) {
        record[header] = value ? splitMultiValue(value) : [];
      } else if (header === 'relatedGrammars') {
        record[header] = value ? parseRelatedGrammars(value) : [];
      } else {
        record[header] = value;
      }
    });

    return record;
  });
}

function escapeCsvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function buildGrammarCsvTemplate() {
  const rows = TEMPLATE_ROWS.map((row) =>
    CSV_HEADERS.map((header) => escapeCsvCell(row[header])).join(',')
  );

  return `\uFEFF${CSV_HEADERS.join(',')}\n${rows.join('\n')}`;
}

module.exports = {
  buildGrammarCsvTemplate,
  parseGrammarCsv,
};
