const CSV_HEADERS = [
  'japanese',
  'pronunciation',
  'chinese',
  'level',
  'tag',
  'category',
  'pitchAccent',
  'examples',
  'textbooks',
  'lessons',
];

const MULTI_VALUE_FIELDS = new Set([
  'tag',
  'category',
  'pitchAccent',
  'pitch_accent',
  'examples',
  'textbooks',
  'lessons',
]);

const HEADER_ALIASES = {
  pitch_accent: 'pitchAccent',
};

const TEMPLATE_ROWS = [
  {
    japanese: '働く',
    pronunciation: 'はたらく',
    chinese: '工作',
    level: 'N5',
    tag: '日常;商务/职场',
    category: '自I',
    pitchAccent: '⓪;①',
    examples: '毎日、会社で働きます。;兄は銀行で働いています。',
    textbooks: '综合日语1;大家的日语初级上',
    lessons: '综合日语1:第5课;大家的日语初级上:第13课',
  },
  {
    japanese: '便利',
    pronunciation: 'べんり',
    chinese: '方便',
    level: 'N4',
    tag: '日常;旅游/餐饮/交通;IT/计算机',
    category: '形II',
    pitchAccent: '⓪;②',
    examples: 'このアプリはとても便利です。;駅に近くて便利です。',
    textbooks: '综合日语2;大家的日语初级下',
    lessons: '综合日语2:第18课;大家的日语初级下:第32课',
  },
  {
    japanese: '確認する',
    pronunciation: 'かくにんする',
    chinese: '确认',
    level: 'N3',
    tag: '商务/职场;IT/计算机;制造业',
    category: '他III',
    pitchAccent: '⓪;③',
    examples: '資料の内容を確認してください。;メールを送る前に宛先を確認します。',
    textbooks: '综合日语3;大家的日语中级上',
    lessons: '综合日语3:第3课;大家的日语中级上:第6课',
  },
  {
    japanese: '市場',
    pronunciation: 'しじょう',
    chinese: '市场',
    level: 'N2',
    tag: '金融/经济/财务;商务/职场',
    category: '名',
    pitchAccent: '⓪;①',
    examples: '海外市場を調査します。;市場の変化に注意が必要です。',
    textbooks: '综合日语4;大家的日语中级下',
    lessons: '综合日语4:第16课;大家的日语中级下:第18课',
  },
];

function normalizeHeader(header) {
  const normalized = String(header || '').replace(/^\uFEFF/, '').trim();
  return HEADER_ALIASES[normalized] || normalized;
}

function splitCsvRows(content) {
  const rows = [];
  let row = [];
  let currentValue = '';
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(currentValue);
      if (row.some((value) => String(value).trim() !== '')) {
        rows.push(row);
      }
      row = [];
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  row.push(currentValue);
  if (row.some((value) => String(value).trim() !== '')) {
    rows.push(row);
  }

  return rows;
}

function splitMultiValue(value) {
  return String(value || '')
    .split(/[;；]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseVocabularyCsv(content) {
  const rows = splitCsvRows(String(content || ''));
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map(normalizeHeader);

  return rows.slice(1).map((row) => {
    const record = {};

    headers.forEach((header, index) => {
      const value = String(row[index] || '').trim();
      if (MULTI_VALUE_FIELDS.has(header)) {
        record[header] = value ? splitMultiValue(value) : [];
      } else {
        record[header] = value;
      }
    });

    return record;
  });
}

function escapeCsvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function buildVocabularyCsvTemplate() {
  const rows = TEMPLATE_ROWS.map((row) =>
    CSV_HEADERS.map((header) => escapeCsvCell(row[header])).join(',')
  );

  return `\uFEFF${CSV_HEADERS.join(',')}\n${rows.join('\n')}`;
}

module.exports = {
  buildVocabularyCsvTemplate,
  parseVocabularyCsv,
  splitCsvRows,
};
