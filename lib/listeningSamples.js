const audioSamples = {
  vacabulary: [
    'おしえる',
    'いいあう',
    'ごがくけんしゅうせい',
    'いちまんはっせんえん',
    'てつがく',
    'いちりゅうだいがく',
  ],
  sentances: [
    '田中さんのご家族は何人ですか',
    'こちらは高橋美穂さんです',
    'どうぞよろしくお願いします',
  ],
};

const listeningTypeLabels = {
  vacabulary: '单词',
  sentances: '句子',
};

const normalizeListeningAnswer = value => String(value || '')
  .replace(/\s+/g, '')
  .replace(/[。．.、,，!！?？]/g, '')
  .trim();

const getListeningSamples = (type) => audioSamples[type] || audioSamples.vacabulary;

module.exports = {
  audioSamples,
  getListeningSamples,
  listeningTypeLabels,
  normalizeListeningAnswer,
};
