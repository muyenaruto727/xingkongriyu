const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const flashCards = read('pages/tools/flash-cards.js');
const tools = read('pages/tools.js');
const introduction = read('pages/learning-center/introduction.js');
const gojyuonPagePath = path.join(root, 'pages/tools/gojyuon.js');
const gojyuonComponentPath = path.join(root, 'components/tools/GojyuonGame.js');

assert(
  flashCards.includes('currentVocab.pitch_accent') && flashCards.includes('currentVocab.category'),
  'flash card Japanese side should render pitch_accent and category'
);

assert(
  tools.includes('/tools/gojyuon') && tools.includes('五十音消消乐'),
  'tools page should include a card linking to /tools/gojyuon'
);

assert(fs.existsSync(gojyuonPagePath), 'pages/tools/gojyuon.js should exist');
assert(fs.existsSync(gojyuonComponentPath), 'components/tools/GojyuonGame.js should exist');

const gojyuonPage = read('pages/tools/gojyuon.js');
const gojyuonComponent = read('components/tools/GojyuonGame.js');

assert(
  gojyuonPage.includes("import GojyuonGame from '../../components/tools/GojyuonGame'"),
  'gojyuon page should import the reusable GojyuonGame component'
);
assert(
  introduction.includes("import GojyuonGame from '../../components/tools/GojyuonGame'"),
  'introduction page should import the reusable GojyuonGame component'
);
assert(
  introduction.includes('<GojyuonGame') && !introduction.includes('const [gameCards'),
  'introduction page should render GojyuonGame instead of owning game state'
);
assert(
  gojyuonComponent.includes('const GojyuonGame') &&
  gojyuonComponent.includes('generateGameCards') &&
  gojyuonComponent.includes('export default GojyuonGame'),
  'GojyuonGame component should contain the extracted game logic'
);

console.log('tools gojyuon checks passed');
