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

const {
  conjugateVerb,
  conJpName,
  conjugations,
  verbs,
} = require('../lib/verbConjugation');

function expectAnswers(verb, form, expected) {
  const result = conjugateVerb(verb, form);
  for (const answer of expected) {
    assert(
      result.answers.includes(answer),
      `${verb.word} ${form} should include ${answer}; got ${result.answers.join(', ')}`
    );
  }
}

assert(Array.isArray(verbs) && verbs.length >= 50, 'verb list should include the provided practice words');
assert(conjugations.includes('shiekiukemi'), 'conjugation list should include shiekiukemi');
assert(conJpName.meirei === '命令形', 'Japanese conjugation names should be exported');

expectAnswers({ word: '書く', pro: 'かく', group: 1 }, 'masu', ['書きます', 'かきます']);
expectAnswers({ word: '会う', pro: 'あう', group: 1 }, 'nai', ['会わない', 'あわない']);
expectAnswers({ word: '泳ぐ', pro: 'およぐ', group: 1 }, 'te', ['泳いで', 'およいで']);
expectAnswers({ word: '読む', pro: 'よむ', group: 1 }, 'ta', ['読んだ', 'よんだ']);
expectAnswers({ word: '話す', pro: 'はなす', group: 1 }, 'kano', ['話せる', 'はなせる']);
expectAnswers({ word: '立つ', pro: 'たつ', group: 1 }, 'shiekiukemi', ['立たされる', 'たたされる']);

expectAnswers({ word: '食べる', pro: 'たべる', group: 2 }, 'te', ['食べて', 'たべて']);
expectAnswers({ word: '見る', pro: 'みる', group: 2 }, 'meirei', ['見ろ', 'みろ']);

expectAnswers({ word: '勉強する', pro: 'べんきょうする', group: 3 }, 'kano', ['勉強できる', 'べんきょうできる']);
expectAnswers({ word: 'する', pro: 'する', group: 3 }, 'meirei', ['しろ']);
expectAnswers({ word: '来る', pro: 'くる', group: 3 }, 'nai', ['来ない', 'こない']);
expectAnswers({ word: '来る', pro: 'くる', group: 3 }, 'iko', ['来よう', 'こよう']);

const tools = read('pages/tools.js');
const verbPagePath = path.join(root, 'pages/tools/verb-change.js');
assert(tools.includes('/tools/verb-change'), 'tools page should link to /tools/verb-change');
assert(tools.includes('动词变变变'), 'tools page should include the verb-change card');
assert(fs.existsSync(verbPagePath), 'pages/tools/verb-change.js should exist');

console.log('verb change checks passed');
