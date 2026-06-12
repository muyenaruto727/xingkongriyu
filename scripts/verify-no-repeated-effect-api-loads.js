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
      if (entry.name !== 'api') walk(fullPath, files);
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractUseEffects(source) {
  const effects = [];
  const pattern = /useEffect\(\(\) => \{([\s\S]*?)\}, \[([^\]]*)\]\);/g;
  let match;
  while ((match = pattern.exec(source))) {
    effects.push(match[1]);
  }
  return effects;
}

function extractFunctionApiMap(source) {
  const map = new Map();
  const functionPattern = /const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{([\s\S]*?)\n\s{2}\};/g;
  let match;
  while ((match = functionPattern.exec(source))) {
    const [, name, body] = match;
    const methods = [...body.matchAll(/api\.(get[A-Za-z0-9_]+)/g)].map(apiMatch => apiMatch[1]);
    if (methods.length > 0) {
      map.set(name, methods);
    }
  }
  return map;
}

function apiMethodsCalledByEffect(effectBody, functionApiMap) {
  const methods = [...effectBody.matchAll(/api\.(get[A-Za-z0-9_]+)/g)].map(match => match[1]);
  for (const [fnName, fnMethods] of functionApiMap.entries()) {
    const callPattern = new RegExp(`\\b${fnName}\\s*\\(`);
    if (callPattern.test(effectBody)) {
      methods.push(...fnMethods);
    }
  }
  return methods;
}

const root = path.resolve(__dirname, '..');
const files = [
  ...walk(path.join(root, 'pages')),
  ...walk(path.join(root, 'components')),
];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const functionApiMap = extractFunctionApiMap(source);
  const effects = extractUseEffects(source);
  const counts = new Map();

  for (const effect of effects) {
    const methods = new Set(apiMethodsCalledByEffect(effect, functionApiMap));
    for (const method of methods) {
      counts.set(method, (counts.get(method) || 0) + 1);
    }
  }

  const repeated = [...counts.entries()].filter(([, count]) => count > 1);
  assert(
    repeated.length === 0,
    `${path.relative(root, file)} triggers duplicate API loads from useEffect: ${repeated.map(([method, count]) => `${method} x${count}`).join(', ')}`
  );
}

console.log('repeated effect API load checks passed');
