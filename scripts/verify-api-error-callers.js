const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

const root = path.resolve(__dirname, '..');
const appFiles = [
  ...walk(path.join(root, 'pages')),
  ...walk(path.join(root, 'components')),
];

for (const file of appFiles) {
  const relative = path.relative(root, file);
  const source = fs.readFileSync(file, 'utf8');
  assert(!source.includes('handleApiError'), `${relative} should not call legacy handleApiError for API requests`);
  assert(!source.includes('isApiErrorNotified'), `${relative} should not guard duplicate API messages in the page`);
}

const utilsSource = fs.readFileSync(path.join(root, 'utils.js'), 'utf8');
assert(!utilsSource.includes('getApiErrorMessage'), 'utils.js should not depend on lib/api.js error internals');

console.log('api error caller checks passed');
