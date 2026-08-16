const assert = require('assert');

const {
  normalizeFlashcardExamples,
  getNextFlashcardReviewState,
  getFlashcardProgress,
  hasFlashcardFieldValue,
} = require('./flashcardStudy');

assert.deepStrictEqual(
  normalizeFlashcardExamples(['毎日勉強します。', '', '  本を読みます。  ']),
  ['毎日勉強します。', '本を読みます。'],
);

assert.deepStrictEqual(
  normalizeFlashcardExamples('毎日勉強します。;本を読みます。'),
  ['毎日勉強します。', '本を読みます。'],
);

const rememberedState = getNextFlashcardReviewState(
  { remembered: 2, reviewAgain: 1 },
  'remembered',
);
assert.deepStrictEqual(rememberedState, { remembered: 3, reviewAgain: 1 });

const reviewState = getNextFlashcardReviewState(
  { remembered: 2, reviewAgain: 1 },
  'reviewAgain',
);
assert.deepStrictEqual(reviewState, { remembered: 2, reviewAgain: 2 });

assert.deepStrictEqual(getFlashcardProgress(2, 10), {
  current: 3,
  total: 10,
  percent: 30,
});

assert.strictEqual(hasFlashcardFieldValue(0), true);
assert.strictEqual(hasFlashcardFieldValue(''), false);
assert.strictEqual(hasFlashcardFieldValue(null), false);
assert.strictEqual(hasFlashcardFieldValue(['0']), true);
assert.strictEqual(hasFlashcardFieldValue([]), false);

console.log('flashcard study tests passed');
