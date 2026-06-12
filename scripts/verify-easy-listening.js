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
  getListeningAnswerValues,
  listeningTypeLabels,
  listeningTypes,
  normalizeListeningAnswer,
  getListeningSamples,
} = require('../lib/listeningSamples');

assert(Array.isArray(audioSamples), 'listening samples should be an array');
assert(
  JSON.stringify(listeningTypes) === JSON.stringify(['平仮名', '片仮名', '数字', '日付', '電話番号', '句子']),
  'listening types should follow the new sample type list'
);
assert(listeningTypeLabels['電話番号'] === '電話番号', 'type labels should use the raw type value');
assert(getListeningSamples('電話番号').every(sample => sample.type === '電話番号'), 'phone filter should return only phone samples');
assert(getListeningSamples('句子').some(sample => sample.v === 'どうぞよろしくお願いします'), 'sentence filter should expose sample sentence');
assert(getListeningSamples().every(sample => sample.type === '平仮名'), 'default sample list should use the first listening type');
assert(
  getListeningAnswerValues({ v: '携帯電話', p: 'けいたいでんわ' })
    .map(normalizeListeningAnswer)
    .includes(normalizeListeningAnswer('携帯電話')),
  'answer values should accept the v field'
);
assert(
  getListeningAnswerValues({ v: '携帯電話', p: 'けいたいでんわ' })
    .map(normalizeListeningAnswer)
    .includes(normalizeListeningAnswer('けいたいでんわ')),
  'answer values should accept the p field'
);
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
assert(page.includes('listeningTypes'), 'easy listening page should use the listening sample type list');
assert(page.includes('currentSample.v'), 'easy listening page should pass v to TTS and display it as the answer');
assert(api.includes("@andresaya/edge-tts"), 'Edge TTS API route should import @andresaya/edge-tts');
assert(api.includes('EdgeTTS'), 'Edge TTS API route should use EdgeTTS');
assert(api.includes('ja-JP'), 'Edge TTS API route should use a Japanese voice');

console.log('easy listening checks passed');
