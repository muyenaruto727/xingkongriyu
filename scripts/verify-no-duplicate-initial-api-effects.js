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

function extractUseEffects(source) {
  const effects = [];
  const pattern = /useEffect\(\(\) => \{([\s\S]*?)\}, \[([^\]]*)\]\);/g;
  let match;
  while ((match = pattern.exec(source))) {
    effects.push({ body: match[1], deps: match[2].trim() });
  }
  return effects;
}

const learningPages = [
  'pages/learning-center/vocabulary.js',
  'pages/learning-center/grammar.js',
];

for (const file of learningPages) {
  const source = read(file);
  const effects = extractUseEffects(source);

  const currentUserEffects = effects.filter(effect =>
    effect.deps.split(',').map(dep => dep.trim()).includes('currentUser')
  );
  assert(
    currentUserEffects.length === 0,
    `${file} should not use currentUser as an initial-load API effect dependency`
  );

  const listFetchEffects = effects.filter(effect =>
    effect.body.includes('fetchVocabList') || effect.body.includes('fetchGrammarList')
  );
  assert(
    listFetchEffects.length === 1,
    `${file} should have one list-fetching effect on initial filter state`
  );

  const favoriteFetchEffects = effects.filter(effect => effect.body.includes('fetchFavorites'));
  assert(
    favoriteFetchEffects.length === 1,
    `${file} should have one favorite-fetching effect on initial user state`
  );
}

console.log('duplicate initial API effect checks passed');
