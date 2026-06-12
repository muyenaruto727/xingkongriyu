const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const root = path.resolve(__dirname, '..');
const vocabularyApi = fs.readFileSync(path.join(root, 'pages/api/vocabulary/index.js'), 'utf8');
const tetrisGame = fs.readFileSync(path.join(root, 'pages/tools/tetris-game.js'), 'utf8');
const vocabManager = fs.readFileSync(path.join(root, 'components/admin/VocabManager.js'), 'utf8');

const limitValidation = vocabularyApi.match(/parseIntegerParam\(limit,\s*\{[^}]+max:\s*(\d+)/s);
assert(limitValidation, 'vocabulary API should validate the limit query parameter');
assert(
  Number(limitValidation[1]) >= 10000,
  'vocabulary API should allow bulk vocabulary fetches up to 10000 items'
);
assert(
  tetrisGame.includes('limit: 1000'),
  'tetris game should be able to keep its 1000-item vocabulary request'
);
assert(
  vocabManager.includes('limit: 10000'),
  'vocabulary admin bulk flows should remain supported'
);

console.log('vocabulary limit checks passed');
