const verbs = [
  { word: '書く', pro: 'かく', group: 1 },
  { word: '会う', pro: 'あう', group: 1 },
  { word: '選ぶ', pro: 'えらぶ', group: 1 },
  { word: '置く', pro: 'おく', group: 1 },
  { word: '話す', pro: 'はなす', group: 1 },
  { word: '待つ', pro: 'まつ', group: 1 },
  { word: '泳ぐ', pro: 'およぐ', group: 1 },
  { word: '死ぬ', pro: 'しぬ', group: 1 },
  { word: '遊ぶ', pro: 'あそぶ', group: 1 },
  { word: '読む', pro: 'よむ', group: 1 },
  { word: '走る', pro: 'はしる', group: 1 },
  { word: '押す', pro: 'おす', group: 1 },
  { word: '行う', pro: 'おこなう', group: 1 },
  { word: '探す', pro: 'さがす', group: 1 },
  { word: '立つ', pro: 'たつ', group: 1 },
  { word: '使う', pro: 'つかう', group: 1 },
  { word: '入る', pro: 'はいる', group: 1 },
  { word: '帰る', pro: 'かえる', group: 1 },
  { word: '切る', pro: 'きる', group: 1 },
  { word: '防ぐ', pro: 'ふせぐ', group: 1 },
  { word: '引っ越す', pro: 'ひっこす', group: 1 },
  { word: '休む', pro: 'やすむ', group: 1 },
  { word: '呼ぶ', pro: 'よぶ', group: 1 },
  { word: '雇う', pro: 'やとう', group: 1 },
  { word: '笑う', pro: 'わらう', group: 1 },
  { word: '運ぶ', pro: 'はこぶ', group: 1 },
  { word: '直す', pro: 'なおす', group: 1 },
  { word: '探す', pro: 'さがす', group: 1 },
  { word: '返す', pro: 'かえす', group: 1 },
  { word: '食べる', pro: 'たべる', group: 2 },
  { word: '見る', pro: 'みる', group: 2 },
  { word: '決める', pro: 'きめる', group: 2 },
  { word: '集める', pro: 'あつめる', group: 2 },
  { word: '受ける', pro: 'うける', group: 2 },
  { word: '助ける', pro: 'たすける', group: 2 },
  { word: '調べる', pro: 'しらべる', group: 2 },
  { word: '捨てる', pro: 'すてる', group: 2 },
  { word: '迎える', pro: 'むかえる', group: 2 },
  { word: '届ける', pro: 'とどける', group: 2 },
  { word: '続ける', pro: 'つづける', group: 2 },
  { word: '忘れる', pro: 'わすれる', group: 2 },
  { word: '見つける', pro: 'みつける', group: 2 },
  { word: '伝える', pro: 'つたえる', group: 2 },
  { word: '知らせる', pro: 'しらせる', group: 2 },
  { word: '求める', pro: 'もとめる', group: 2 },
  { word: '止める', pro: 'とめる', group: 2 },
  { word: '勉強する', pro: 'べんきょうする', group: 3 },
  { word: 'する', pro: 'する', group: 3 },
  { word: '来る', pro: 'くる', group: 3 },
  { word: '卒業する', pro: 'そつぎょうする', group: 3 },
  { word: '担当する', pro: 'たんとうする', group: 3 },
];

const conjugations = [
  'masu',
  'nai',
  'te',
  'ta',
  'kano',
  'kate',
  'iko',
  'ukemi',
  'shieki',
  'shiekiukemi',
  'meirei',
];

const conJpName = {
  masu: 'ます形',
  nai: 'ない形',
  te: 'て形',
  ta: 'た形',
  kano: '可能形',
  kate: '假定形',
  iko: '意向形',
  ukemi: '受身形',
  shieki: '使役形',
  shiekiukemi: '使役受身形',
  meirei: '命令形',
};

const groupName = {
  1: '一类动词',
  2: '二类动词',
  3: '三类动词',
};

const godanMap = {
  i: { う: 'い', く: 'き', ぐ: 'ぎ', す: 'し', つ: 'ち', ぬ: 'に', ぶ: 'び', む: 'み', る: 'り' },
  a: { う: 'わ', く: 'か', ぐ: 'が', す: 'さ', つ: 'た', ぬ: 'な', ぶ: 'ば', む: 'ま', る: 'ら' },
  e: { う: 'え', く: 'け', ぐ: 'げ', す: 'せ', つ: 'て', ぬ: 'ね', ぶ: 'べ', む: 'め', る: 'れ' },
  o: { う: 'お', く: 'こ', ぐ: 'ご', す: 'そ', つ: 'と', ぬ: 'の', ぶ: 'ぼ', む: 'も', る: 'ろ' },
};

const normalizeAnswer = value => String(value || '').replace(/\s+/g, '').trim();

const unique = values => Array.from(new Set(values.filter(Boolean)));

const replaceLastKana = (value, row) => {
  const last = value.slice(-1);
  const replacement = godanMap[row][last];
  if (!replacement) {
    throw new Error(`Unsupported godan ending: ${value}`);
  }
  return `${value.slice(0, -1)}${replacement}`;
};

const dropLast = value => value.slice(0, -1);

const teTaSuffix = (value, kind) => {
  const last = value.slice(-1);
  const te = kind === 'te';
  if (['う', 'つ', 'る'].includes(last)) return te ? 'って' : 'った';
  if (['む', 'ぶ', 'ぬ'].includes(last)) return te ? 'んで' : 'んだ';
  if (last === 'く') return te ? 'いて' : 'いた';
  if (last === 'ぐ') return te ? 'いで' : 'いだ';
  if (last === 'す') return te ? 'して' : 'した';
  throw new Error(`Unsupported te/ta ending: ${value}`);
};

const conjugateGodanValue = (value, form) => {
  switch (form) {
    case 'masu':
      return `${replaceLastKana(value, 'i')}ます`;
    case 'nai':
      return `${replaceLastKana(value, 'a')}ない`;
    case 'te':
    case 'ta':
      return `${dropLast(value)}${teTaSuffix(value, form)}`;
    case 'kano':
      return `${replaceLastKana(value, 'e')}る`;
    case 'kate':
      return `${replaceLastKana(value, 'e')}ば`;
    case 'iko':
      return `${replaceLastKana(value, 'o')}う`;
    case 'ukemi':
      return `${replaceLastKana(value, 'a')}れる`;
    case 'shieki':
      return `${replaceLastKana(value, 'a')}せる`;
    case 'shiekiukemi':
      return `${replaceLastKana(value, 'a')}される`;
    case 'meirei':
      return replaceLastKana(value, 'e');
    default:
      throw new Error(`Unsupported conjugation: ${form}`);
  }
};

const conjugateIchidanValue = (value, form) => {
  const stem = dropLast(value);
  switch (form) {
    case 'masu':
      return `${stem}ます`;
    case 'nai':
      return `${stem}ない`;
    case 'te':
      return `${stem}て`;
    case 'ta':
      return `${stem}た`;
    case 'kano':
    case 'ukemi':
      return `${stem}られる`;
    case 'kate':
      return `${stem}れば`;
    case 'iko':
      return `${stem}よう`;
    case 'shieki':
      return `${stem}させる`;
    case 'shiekiukemi':
      return `${stem}させられる`;
    case 'meirei':
      return `${stem}ろ`;
    default:
      throw new Error(`Unsupported conjugation: ${form}`);
  }
};

const conjugateSuruValue = (value, form) => {
  const stem = value.endsWith('する') ? value.slice(0, -2) : '';
  switch (form) {
    case 'masu':
      return `${stem}します`;
    case 'nai':
      return `${stem}しない`;
    case 'te':
      return `${stem}して`;
    case 'ta':
      return `${stem}した`;
    case 'kano':
      return `${stem}できる`;
    case 'kate':
      return `${stem}すれば`;
    case 'iko':
      return `${stem}しよう`;
    case 'ukemi':
      return `${stem}される`;
    case 'shieki':
      return `${stem}させる`;
    case 'shiekiukemi':
      return `${stem}させられる`;
    case 'meirei':
      return `${stem}しろ`;
    default:
      throw new Error(`Unsupported conjugation: ${form}`);
  }
};

const kuruKanji = {
  masu: '来ます',
  nai: '来ない',
  te: '来て',
  ta: '来た',
  kano: '来られる',
  kate: '来れば',
  iko: '来よう',
  ukemi: '来られる',
  shieki: '来させる',
  shiekiukemi: '来させられる',
  meirei: '来い',
};

const kuruKana = {
  masu: 'きます',
  nai: 'こない',
  te: 'きて',
  ta: 'きた',
  kano: 'こられる',
  kate: 'くれば',
  iko: 'こよう',
  ukemi: 'こられる',
  shieki: 'こさせる',
  shiekiukemi: 'こさせられる',
  meirei: 'こい',
};

const conjugateVerb = (verb, form) => {
  if (!conjugations.includes(form)) {
    throw new Error(`Unknown conjugation: ${form}`);
  }

  let written;
  let kana;

  if (verb.group === 1) {
    written = conjugateGodanValue(verb.word, form);
    kana = conjugateGodanValue(verb.pro, form);
  } else if (verb.group === 2) {
    written = conjugateIchidanValue(verb.word, form);
    kana = conjugateIchidanValue(verb.pro, form);
  } else if (verb.word === '来る') {
    written = kuruKanji[form];
    kana = kuruKana[form];
  } else {
    written = conjugateSuruValue(verb.word, form);
    kana = conjugateSuruValue(verb.pro, form);
  }

  return {
    verb,
    form,
    label: conJpName[form],
    written,
    kana,
    answers: unique([written, kana]).map(normalizeAnswer),
  };
};

const checkVerbAnswer = (verb, form, value) => {
  const normalized = normalizeAnswer(value);
  const result = conjugateVerb(verb, form);
  return {
    ...result,
    input: normalized,
    correct: result.answers.includes(normalized),
  };
};

module.exports = {
  checkVerbAnswer,
  conjugateVerb,
  conJpName,
  conjugations,
  groupName,
  normalizeAnswer,
  verbs,
};
