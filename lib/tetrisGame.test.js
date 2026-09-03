const assert = require('assert');

const {
  normalizeTetrisList,
  cleanTetrisVocabulary,
  buildTetrisVocabularyParams,
} = require('./tetrisGame');

assert.deepStrictEqual(normalizeTetrisList([{ id: 1 }]), [{ id: 1 }]);
assert.deepStrictEqual(normalizeTetrisList({ data: [{ id: 2 }] }), [{ id: 2 }]);
assert.deepStrictEqual(normalizeTetrisList({ rows: [] }), []);

assert.deepStrictEqual(
  cleanTetrisVocabulary([
    { japanese: '言葉', chinese: '词语' },
    { japanese: '', chinese: '空' },
    { japanese: '水', chinese: '' },
  ]),
  [{ japanese: '言葉', chinese: '词语' }],
);

assert.deepStrictEqual(
  buildTetrisVocabularyParams({
    sourceMode: 'level',
    selectedLevel: 'N3',
    pairCount: 8,
  }),
  { params: { level: 'N3', limit: 8 } },
);

assert.deepStrictEqual(
  buildTetrisVocabularyParams({
    sourceMode: 'textbook',
    selectedTextbook: '1',
    selectedTextbookName: '大家的日本语',
    selectedLesson: '第2课',
    pairCount: 12,
  }),
  {
    params: {
      textbook: '大家的日本语',
      lesson: '大家的日本语:第2课',
      limit: 12,
    },
  },
);

assert.deepStrictEqual(
  buildTetrisVocabularyParams({
    sourceMode: 'textbook',
    selectedTextbook: '1',
    selectedLesson: '',
    pairCount: 8,
  }),
  { error: '请先选择教材和课程' },
);

console.log('tetris game tests passed');
