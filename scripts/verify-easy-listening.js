const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const pkg = JSON.parse(read('package.json'));
assert(pkg.dependencies['@andresaya/edge-tts'], 'package.json should include @andresaya/edge-tts');

const {
  audioSamples,
  normalizeListeningAnswer,
  getListeningSamples,
} = require('../lib/listeningSamples');

assert(audioSamples.vacabulary.length === 6, 'vocabulary sample list should include 6 items');
assert(audioSamples.sentances.length === 3, 'sentence sample list should include 3 items');
assert(getListeningSamples('vacabulary').includes('おしえる'), 'vocabulary list should expose おしえる');
assert(getListeningSamples('sentances').includes('どうぞよろしくお願いします'), 'sentence list should expose sample sentence');
assert(
  normalizeListeningAnswer('田中さんのご家族は何人ですか？') === normalizeListeningAnswer('田中さんのご家族は何人ですか'),
  'normalizer should ignore Japanese question punctuation'
);

const tools = read('pages/tools.js');
assert(tools.includes('/tools/easy-listening'), 'tools page should link to /tools/easy-listening');
assert(tools.includes('听力入门'), 'tools page should include easy listening card');

assert(fs.existsSync(path.join(root, 'pages/tools/easy-listening.js')), 'pages/tools/easy-listening.js should exist');
assert(fs.existsSync(path.join(root, 'pages/api/edge-tts.js')), 'pages/api/edge-tts.js should exist');

const page = read('pages/tools/easy-listening.js');
const api = read('pages/api/edge-tts.js');

assert(page.includes('/api/edge-tts'), 'easy listening page should request the Edge TTS API route');
assert(page.includes('audioSamples'), 'easy listening page should use the listening sample library');
assert(api.includes("@andresaya/edge-tts"), 'Edge TTS API route should import @andresaya/edge-tts');
assert(api.includes('EdgeTTS'), 'Edge TTS API route should use EdgeTTS');
assert(api.includes('ja-JP'), 'Edge TTS API route should use a Japanese voice');

console.log('easy listening checks passed');
