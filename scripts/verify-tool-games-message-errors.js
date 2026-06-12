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

const files = [
  'pages/tools/tetris-game.js',
  'pages/tools/typing-game.js',
];

for (const file of files) {
  const source = read(file);
  assert(!source.includes('loadError'), `${file} should not keep API errors in page state`);
  assert(!source.includes('setLoadError'), `${file} should not render API errors inline`);
  assert(!source.includes('getApiErrorMessage'), `${file} should rely on lib/api.js for API error messages`);
  assert(!source.includes('rounded-xl border border-rose-100 bg-rose-50'), `${file} should not show API errors inside the page`);
}

console.log('tool game message error checks passed');
