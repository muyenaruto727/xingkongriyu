const assert = require('assert');

const {
  buildTypingVocabularyParams,
  cleanTypingVocabulary,
  normalizeTypingList,
} = require('./typingGame');

assert.deepStrictEqual(normalizeTypingList([{ id: 1 }]), [{ id: 1 }]);
assert.deepStrictEqual(normalizeTypingList({ data: [{ id: 2 }] }), [{ id: 2 }]);
assert.deepStrictEqual(normalizeTypingList(null), []);

assert.deepStrictEqual(
  cleanTypingVocabulary([
    { japanese: '言葉', chinese: '词语' },
    { japanese: '', chinese: '空' },
    { japanese: '水', chinese: '' },
  ]),
  [{ japanese: '言葉', chinese: '词语', meaning: '词语' }],
);

assert.deepStrictEqual(
  buildTypingVocabularyParams({
    gameMode: 'word',
    sourceMode: 'level',
    selectedLevel: 'N3',
    wordCount: 20,
  }),
  { params: { level: 'N3', limit: 20 } },
);

assert.deepStrictEqual(
  buildTypingVocabularyParams({
    gameMode: 'word',
    sourceMode: 'textbook',
    selectedTextbook: '1',
    selectedTextbookName: '大家的日本语',
    selectedLesson: '第3课',
    wordCount: 30,
  }),
  {
    params: {
      textbook: '大家的日本语',
      lesson: '大家的日本语:第3课',
      limit: 30,
    },
  },
);

assert.deepStrictEqual(
  buildTypingVocabularyParams({
    gameMode: 'word',
    sourceMode: 'textbook',
    selectedTextbook: '1',
    selectedLesson: '',
    wordCount: 30,
  }),
  { error: '请先选择教材和课程' },
);

assert.deepStrictEqual(
  buildTypingVocabularyParams({ gameMode: 'sentence', wordCount: 20 }),
  null,
);

console.log('typing game tests passed');
