const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

function extractFirstUseEffect(source) {
  const match = source.match(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/);
  return match ? match[0] : '';
}

function extractFunction(source, name) {
  const match = source.match(new RegExp(`const ${name} = [^{]+=> \\{[\\s\\S]*?\\n  \\};`));
  return match ? match[0] : '';
}

const tetris = read('pages/tools/tetris-game.js');
const typing = read('pages/tools/typing-game.js');

const tetrisInitialEffect = extractFirstUseEffect(tetris);
const typingInitialEffect = extractFirstUseEffect(typing);
const tetrisStartGame = extractFunction(tetris, 'startGame');
const typingStartGame = extractFunction(typing, 'startGame');

assert(tetrisInitialEffect, 'tetris game should have an initial useEffect');
assert(typingInitialEffect, 'typing game should have an initial useEffect');
assert(!tetrisInitialEffect.includes('fetchVocab'), 'tetris game should not fetch vocabulary on page load');
assert(!tetrisInitialEffect.includes('api.getVocabList'), 'tetris game should not call vocabulary API on page load');
assert(!typingInitialEffect.includes('fetchData'), 'typing game should not fetch practice data on page load');
assert(!typingInitialEffect.includes('api.getVocabList'), 'typing game should not call vocabulary API on page load');
assert(!typingInitialEffect.includes('api.getArticleList'), 'typing game should not call article API on page load');

assert(tetrisStartGame.includes('api.getVocabList'), 'tetris game should fetch vocabulary when starting the game');
assert(typingStartGame.includes('api.getVocabList'), 'typing game should fetch vocabulary when starting word mode');
assert(typingStartGame.includes('api.getRandomArticle'), 'typing game should fetch an article when starting sentence mode');

console.log('tool game lazy fetch checks passed');
