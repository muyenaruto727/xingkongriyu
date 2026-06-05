/**
 * seed-data.js
 * 为各管理模块插入100条测试数据
 * 运行: npm run seed-data  或  node scripts/seed-data.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'xingkongriyu',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  max: 5,
});

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const CATEGORIES_VOCAB = ['动词', '形容词', '名词', '副词', '接续词', '惯用语'];
const CATEGORIES_GRAMMAR = ['助词', '句型', '活用', '敬语', '复合语法'];
const TAG_LIST = ['日常', 'ビジネス', '旅行', '食べ物', '感情', '自然', '技術', '社会'];
const ARTICLE_CATS = ['日本文化', '生活会話', 'ニュース', '旅行', 'テクノロジー', '歴史'];

// JLPT 真题考试的题目类型和分类 — 必须与 /api/exam/generate.js 保持一致
const EXAM_QUESTION_TYPES = ['vocabulary', 'grammar', 'reading', 'listening'];
const EXAM_CATEGORIES = {
  vocabulary: ['kanji_reading', 'kanji_writing', 'word_formation', 'word_relation', 'synonym_replacement', 'usage'],
  grammar: ['sentence_grammar1', 'sentence_grammar2', 'text_grammar'],
  reading: ['short_content', 'medium_content', 'long_content', 'comprehensive', 'argument', 'information_retrieval'],
  listening: ['problem_understanding', 'point_understanding', 'summary_understanding', 'language_expression', 'immediate_response', 'comprehensive'],
};

// ────────────────────────────────────
// Data generators
// ────────────────────────────────────

const vocabData = [
  { j: '食べる', p: 'たべる', c: '吃' },
  { j: '飲む', p: 'のむ', c: '喝' },
  { j: '行く', p: 'いく', c: '去' },
  { j: '来る', p: 'くる', c: '来' },
  { j: '見る', p: 'みる', c: '看' },
  { j: '聞く', p: 'きく', c: '听/问' },
  { j: '話す', p: 'はなす', c: '说' },
  { j: '読む', p: 'よむ', c: '读' },
  { j: '書く', p: 'かく', c: '写' },
  { j: '買う', p: 'かう', c: '买' },
  { j: '美味しい', p: 'おいしい', c: '好吃的' },
  { j: '大きい', p: 'おおきい', c: '大的' },
  { j: '小さい', p: 'ちいさい', c: '小的' },
  { j: '新しい', p: 'あたらしい', c: '新的' },
  { j: '楽しい', p: 'たのしい', c: '快乐的' },
  { j: '難しい', p: 'むずかしい', c: '难的' },
  { j: '簡単', p: 'かんたん', c: '简单' },
  { j: '便利', p: 'べんり', c: '方便' },
  { j: '元気', p: 'げんき', c: '精神、健康' },
  { j: '天気', p: 'てんき', c: '天气' },
  { j: '学校', p: 'がっこう', c: '学校' },
  { j: '先生', p: 'せんせい', c: '老师' },
  { j: '学生', p: 'がくせい', c: '学生' },
  { j: '友達', p: 'ともだち', c: '朋友' },
  { j: '家族', p: 'かぞく', c: '家人' },
  { j: '仕事', p: 'しごと', c: '工作' },
  { j: '時間', p: 'じかん', c: '时间' },
  { j: '今日', p: 'きょう', c: '今天' },
  { j: '明日', p: 'あした', c: '明天' },
  { j: '昨日', p: 'きのう', c: '昨天' },
  { j: '日本語', p: 'にほんご', c: '日语' },
  { j: '説明', p: 'せつめい', c: '说明' },
  { j: '意味', p: 'いみ', c: '意思' },
  { j: '練習', p: 'れんしゅう', c: '练习' },
  { j: '勉強', p: 'べんきょう', c: '学习' },
  { j: '旅行', p: 'りょこう', c: '旅行' },
  { j: '料理', p: 'りょうり', c: '料理/烹饪' },
  { j: '映画', p: 'えいが', c: '电影' },
  { j: '音楽', p: 'おんがく', c: '音乐' },
  { j: '電話', p: 'でんわ', c: '电话' },
  { j: '早い', p: 'はやい', c: '快的/早的' },
  { j: '遅い', p: 'おそい', c: '慢的/晚的' },
  { j: '高い', p: 'たかい', c: '高的/贵的' },
  { j: '安い', p: 'やすい', c: '便宜的' },
  { j: '近い', p: 'ちかい', c: '近的' },
  { j: '遠い', p: 'とおい', c: '远的' },
  { j: '静か', p: 'しずか', c: '安静' },
  { j: '有名', p: 'ゆうめい', c: '有名' },
  { j: '必要', p: 'ひつよう', c: '必要' },
  { j: '大丈夫', p: 'だいじょうぶ', c: '没关系/没问题' },
];

const grammarPatterns = [
  { g: '～てください', jm: '〜してください', cm: '请做...' },
  { g: '～てもいいですか', jm: '〜してもいいですか', cm: '可以做...吗？' },
  { g: '～てはいけません', jm: '〜してはいけません', cm: '不可以做...' },
  { g: '～なければならない', jm: '〜しなければならない', cm: '必须做...' },
  { g: '～なくてもいい', jm: '〜しなくてもいい', cm: '不做...也可以' },
  { g: '～ことがある', jm: '〜したことがある', cm: '有过...经历' },
  { g: '～たい', jm: '〜したい', cm: '想要做...' },
  { g: '～つもり', jm: '〜するつもり', cm: '打算做...' },
  { g: '～ほうがいい', jm: '〜したほうがいい', cm: '最好做...' },
  { g: '～かもしれない', jm: '〜かもしれない', cm: '也许...' },
  { g: '～でしょう', jm: '〜でしょう', cm: '...吧（推测）' },
  { g: '～ようになる', jm: '〜するようになる', cm: '变得会做...' },
  { g: '～ことにする', jm: '〜することにする', cm: '决定做...' },
  { g: '～ことになる', jm: '〜することになる', cm: '（被）决定做...' },
  { g: '～てもらう', jm: '〜してもらう', cm: '请别人做...（受益）' },
  { g: '～てくれる', jm: '〜してくれる', cm: '别人为我做...' },
  { g: '～てあげる', jm: '〜してあげる', cm: '为别人做...' },
  { g: '～受身形（れる・られる）', jm: '〜される', cm: '被动形' },
  { g: '～使役形（せる・させる）', jm: '〜させる', cm: '使役形' },
  { g: '～使役受身形', jm: '〜させられる', cm: '使役被动形' },
  { g: '～尊敬語', jm: 'お/ご〜になる', cm: '尊敬语' },
  { g: '～謙譲語', jm: 'お/ご〜する', cm: '谦让语' },
  { g: '～条件形（と・ば・たら・なら）', jm: '〜すれば', cm: '条件形：如果...' },
  { g: '～ても', jm: '〜しても', cm: '即使...也' },
  { g: '～ために', jm: '〜するために', cm: '为了...' },
  { g: '～ように', jm: '〜するように', cm: '为了...（状态）' },
  { g: '～より／ほど', jm: '〜より〜ほど', cm: '比.../不如...' },
  { g: '～すぎる', jm: '〜しすぎる', cm: '过于...' },
  { g: '～やすい／にくい', jm: '〜しやすい／しにくい', cm: '容易/难做...' },
  { g: '～始める／終わる', jm: '〜し始める／し終わる', cm: '开始/结束做...' },
  { g: '～続ける', jm: '〜し続ける', cm: '继续做...' },
  { g: '～はずだ', jm: '〜のはずだ', cm: '应该...（有根据）' },
  { g: '～わけだ', jm: '〜わけだ', cm: '当然...（理由）' },
  { g: '～わけではない', jm: '〜わけではない', cm: '并不是...' },
  { g: '～とは限らない', jm: '〜とは限らない', cm: '不一定是...' },
  { g: '～に違いない', jm: '〜に違いない', cm: '一定是...' },
  { g: '～みたいだ', jm: '〜みたいだ', cm: '好像...' },
  { g: '～らしい', jm: '〜らしい', cm: '听说/好像...' },
  { g: '～そうだ（伝聞）', jm: '〜そうだ', cm: '听说...' },
  { g: '～そうだ（様態）', jm: '〜そうだ', cm: '看起来...' },
  { g: '～ながら', jm: '〜しながら', cm: '一边...一边...' },
  { g: '～前に／後で', jm: '〜する前に／した後で', cm: '在...之前/之后' },
  { g: '～時', jm: '〜する時', cm: '...的时候' },
  { g: '～間／間に', jm: '〜している間／間に', cm: '在...期间' },
  { g: '～まで／までに', jm: '〜するまで／までに', cm: '到...为止/在...之前' },
  { g: '～てから', jm: '〜してから', cm: '做完...之后' },
  { g: '～次第', jm: '〜し次第', cm: '一旦...就（立即）' },
  { g: '～ため（原因）', jm: '〜のため', cm: '因为...' },
  { g: '～せいで', jm: '〜のせいで', cm: '都怪...（负面原因）' },
];

const articleTemplates = [
  {
    title: '日本の正月文化',
    content: '日本では、正月は一年で最も重要な祝日です。家族が集まり、おせち料理を食べ、初詣に行きます。門松やしめ飾りを飾り、新年の神様をお迎えします。子どもたちはお年玉をもらい、凧揚げや羽子板で遊びます。',
    level: 'N4', cat: '日本文化',
  },
  {
    title: '東京の公共交通機関',
    content: '東京の公共交通機関は世界で最も発達していると言われています。JR線、私鉄、地下鉄が網の目のように広がり、どこへでも便利に行くことができます。SuicaやPASMOを使えば、改札を通るのも簡単です。ただし、ラッシュアワーの混雑は大変です。',
    level: 'N3', cat: '生活会話',
  },
  {
    title: '日本の四季',
    content: '日本には四季があり、それぞれの季節に美しい景色を楽しむことができます。春には桜が咲き、夏には花火大会、秋には紅葉、冬には雪景色と温泉を楽しめます。季節ごとの行事や食べ物も魅力の一つです。',
    level: 'N5', cat: '日本文化',
  },
];

const quoteTemplates = [
  { s: '千里の道も一歩から。', m: '千里之行，始于足下。', src: '中国のことわざ' },
  { s: '継続は力なり。', m: '坚持就是力量。', src: '日本のことわざ' },
  { s: '塵も積もれば山となる。', m: '积少成多，聚沙成塔。', src: 'ことわざ' },
  { s: '急がば回れ。', m: '欲速则不达。', src: 'ことわざ' },
  { s: '石の上にも三年。', m: '功到自然成。（石上三年，日久生效。）', src: 'ことわざ' },
  { s: '七転び八起き。', m: '百折不挠。（跌倒七次，第八次再站起来。）', src: 'ことわざ' },
  { s: '猿も木から落ちる。', m: '智者千虑，必有一失。', src: 'ことわざ' },
  { s: '二兎を追う者は一兎をも得ず。', m: '追二兔者，一兔不得。（贪多嚼不烂。）', src: 'ことわざ' },
  { s: '花より団子。', m: '舍华求实。（花不如团子实用。）', src: 'ことわざ' },
  { s: '郷に入っては郷に従え。', m: '入乡随俗。', src: 'ことわざ' },
  { s: '備えあれば憂いなし。', m: '有备无患。', src: 'ことわざ' },
  { s: '好きこそ物の上手なれ。', m: '兴趣是最好的老师。', src: 'ことわざ' },
  { s: '三人寄れば文殊の知恵。', m: '三个臭皮匠，顶个诸葛亮。', src: 'ことわざ' },
  { s: '百聞は一見にしかず。', m: '百闻不如一见。', src: 'ことわざ' },
  { s: '案ずるより生むが易し。', m: '车到山前必有路。（与其烦恼不如尝试。）', src: 'ことわざ' },
];

// ────────────────────────────────────
// Insert helpers
// ────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedVocabulary(count) {
  console.log(`  → 插入 ${count} 条词汇数据...`);
  for (let i = 0; i < count; i++) {
    const base = vocabData[i % vocabData.length];
    const suffix = i >= vocabData.length ? ` (${Math.floor(i / vocabData.length) + 1})` : '';
    const japanese = base.j + suffix;
    const level = pick(LEVELS);
    const category = pick(CATEGORIES_VOCAB);
    const tag = pick(TAG_LIST);
    const examples = [`{${japanese}を使って文を作りましょう。}`, `{${japanese}はよく使われる言葉です。}`];
    await pool.query(
      `INSERT INTO vocabulary (japanese, pronunciation, chinese, level, category, tag, examples, textbook, lesson)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [japanese, base.p, base.c + suffix, level, category, tag, examples, `教材${pick(LEVELS)}`, `第${randInt(1, 50)}課`]
    );
  }
}

async function seedGrammar(count) {
  console.log(`  → 插入 ${count} 条语法数据...`);
  for (let i = 0; i < count; i++) {
    const base = grammarPatterns[i % grammarPatterns.length];
    const suffix = i >= grammarPatterns.length ? ` (${Math.floor(i / grammarPatterns.length) + 1})` : '';
    const level = pick(LEVELS);
    const category = pick(CATEGORIES_GRAMMAR);
    const examples = [
      `例文1: ${base.g}。`,
      `例文2: これは${base.g.replace('～', '')}の使い方です。`,
    ];
    await pool.query(
      `INSERT INTO grammar (grammar_point, level, japanese_meaning, chinese_meaning, continuation, attention_points, translation_exercises, reference_answers, examples)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        base.g + suffix,
        level,
        base.jm,
        base.cm + suffix,
        pick(['動詞連用形', '動詞辞書形', '動詞タ形', '名詞', '形容詞']),
        `注意点: 「${base.g}」の使い方に注意してください。`,
        [`次の文を${base.g}を使って完成させなさい。`],
        [`正解: ${base.jm}の例です。`],
        examples,
      ]
    );
  }
}

async function seedListening(count) {
  console.log(`  → 插入 ${count} 条听力数据...`);
  for (let i = 0; i < count; i++) {
    const difficulty = pick(['N5', 'N4', 'N3', 'N2', 'N1']);
    const exerciseType = pick(['会話', '説明', 'ニュース', 'アナウンス']);
    const question = `听力问题 ${i + 1}: ${pick(['男の人と女の人が話しています。', 'アナウンスを聞いてください。', '先生が説明しています。', 'ニュースを聞いてください。'])}`;
    const options = JSON.stringify([
      { label: 'A', text: '選択肢Aの内容', correct: i % 4 === 0 },
      { label: 'B', text: '選択肢Bの内容', correct: i % 4 === 1 },
      { label: 'C', text: '選択肢Cの内容', correct: i % 4 === 2 },
      { label: 'D', text: '選択肢Dの内容', correct: i % 4 === 3 },
    ]);
    const groups = JSON.stringify({ section: pick(['Section 1', 'Section 2', 'Section 3']), part: randInt(1, 4) });
    await pool.query(
      `INSERT INTO listening (difficulty, audio_url, exercise_type, question, options, correct_answer, explanation, groups)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [difficulty, `https://example.com/audio/listening_${i + 1}.mp3`, exerciseType, question, options, pick(['A', 'B', 'C', 'D']), `这是听力第${i + 1}题的解说。`, groups]
    );
  }
}

async function seedReading(count) {
  console.log(`  → 插入 ${count} 条阅读数据...`);
  const passages = [
    '日本では、近年、働き方改革が進められています。長時間労働を減らし、有給休暇の取得を促進することで、仕事と生活のバランスを取ることが目的です。企業によっては、週休三日制を導入するところも出てきました。',
    '環境問題は、世界中で深刻化しています。特にプラスチックごみによる海洋汚染は大きな問題です。日本でもレジ袋の有料化が始まり、マイバッグを持参する人が増えました。一人一人の小さな努力が大きな変化につながります。',
    '日本のアニメは世界中で人気があります。その理由として、ストーリーの深さ、キャラクターの個性、美しい作画などが挙げられます。また、日本文化を背景にした作品も多く、外国人の日本への興味を引き出しています。',
    '少子高齢化は日本の大きな社会問題です。出生率の低下と平均寿命の延伸により、高齢者の割合が増加しています。政府は様々な対策を講じていますが、解決には時間がかかると予想されています。',
  ];
  for (let i = 0; i < count; i++) {
    const difficulty = pick(LEVELS);
    const article = passages[i % passages.length] + `\n\n（テストデータ ${i + 1}）`;
    const groups = JSON.stringify([{ type: '選択式', question: `本文の内容に合っているものはどれですか。（問題${i + 1}）`, options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'], answer: randInt(0, 3) }]);
    await pool.query(
      `INSERT INTO reading (difficulty, article, groups) VALUES ($1,$2,$3)`,
      [difficulty, article, groups]
    );
  }
}

async function seedArticles(count) {
  console.log(`  → 插入 ${count} 条文章数据...`);
  for (let i = 0; i < count; i++) {
    const tpl = articleTemplates[i % articleTemplates.length];
    const level = pick(LEVELS);
    const category = pick(ARTICLE_CATS);
    const suffix = i >= articleTemplates.length ? ` （その${Math.floor(i / articleTemplates.length) + 2}）` : '';
    await pool.query(
      `INSERT INTO articles (title, content, level, category) VALUES ($1,$2,$3,$4)`,
      [tpl.title + suffix, tpl.content + `\n（テストデータ #${i + 1}）`, level, category]
    );
  }
}

async function seedQuestions() {
  console.log(`  → 插入 JLPT 真题题库数据...`);

  // 阅读/文章类题目模板
  const readingPassages = {
    short_content: [
      { text: '今日は朝から雨が降っていた。傘を持っていなかったので、駅まで走って行った。駅に着いた時には、服がびしょ濡れになっていた。', questions: ['筆者はなぜ服が濡れたのか。', '筆者はどうやって駅まで行ったか。'] },
      { text: '田中さんは毎朝6時に起きる。朝ごはんを食べてから、新聞を読む。8時に家を出て、会社に9時に着く。', questions: ['田中さんは朝ごはんの前に何をするか。', '田中さんは何時に家を出るか。'] },
      { text: '日本のコンビニは24時間営業で、食べ物や飲み物だけでなく、公共料金の支払いもできる。とても便利だ。', questions: ['コンビニでできないことは何か。', '筆者はコンビニについてどう思っているか。'] },
      { text: '最近、電子書籍を利用する人が増えている。紙の本と比べて、持ち運びが便利で、場所を取らないのが利点だ。', questions: ['電子書籍の利点として正しいものはどれか。'] },
      { text: '日本では、お正月に家族でおせち料理を食べる習慣がある。おせち料理は、縁起の良い食材を使った伝統的な料理だ。', questions: ['おせち料理について正しいものはどれか。', 'おせち料理はいつ食べるか。'] },
    ],
    medium_content: [
      { text: '日本の少子高齢化は深刻な問題となっている。出生率の低下と平均寿命の延伸により、総人口に占める高齢者の割合が年々増加している。政府は子育て支援や年金制度の改革など、様々な対策を講じているが、抜本的な解決には至っていない。一方で、高齢者が生き生きと働ける社会づくりも重要な課題である。', questions: ['少子高齢化の原因として正しいものはどれか。', '政府の対策として挙げられていないものはどれか。'] },
      { text: '近年、AI技術の発展は目覚ましく、様々な産業に影響を与えている。自動運転技術や医療診断支援など、AIの活用範囲は広がる一方である。しかし、AIによって仕事が奪われるのではないかという不安の声も少なくない。', questions: ['AIについて正しいものはどれか。', '筆者の考えに最も近いものはどれか。'] },
      { text: '地球温暖化の影響は、気温の上昇だけではない。異常気象の増加、海面上昇、生態系の変化など、多岐にわたる。国際社会はパリ協定を採択し、温室効果ガスの削減に取り組んでいるが、目標達成にはさらなる努力が必要とされている。', questions: ['地球温暖化の影響として述べられていないものはどれか。'] },
    ],
    long_content: [
      { text: '日本語の敬語は、大きく分けて尊敬語、謙譲語、丁寧語の3つがある。尊敬語は相手の行動に対して使う表現で、「いらっしゃる」「おっしゃる」などが代表的な例である。一方、謙譲語は自分の行動を低めることで相手に敬意を示す表現であり、「申し上げる」「参る」などがある。丁寧語は「です」「ます」のように、聞き手に対する敬意を表す。敬語を適切に使い分けることは、日本人にとっても難しいと言われている。', questions: ['尊敬語の例として正しいものはどれか。', '敬語について正しいものはどれか。', '筆者の意見に最も近いものはどれか。'] },
    ],
    comprehensive: [
      { text: 'A社の調査によると、2025年度の国内スマートフォン市場は前年比3%増の2.5兆円となった。特にシニア層のスマートフォン所有率が上昇しており、60代以上では初めて70%を超えた。一方、若年層では動画視聴やSNSの利用時間が増加傾向にある。B社のレポートでは、1日あたりの平均スマートフォン利用時間は約3時間に達している。', questions: ['60代以上のスマートフォン所有率について正しいものはどれか。', '二つの文章に共通するテーマは何か。'] },
    ],
    argument: [
      { text: 'グローバル化が進む現代社会において、英語教育の重要性はますます高まっている。確かに、英語は国際共通語としてビジネスや学術の場で不可欠である。しかし、母語である日本語の教育をおろそかにしてよいわけではない。論理的思考力や豊かな表現力を養うには、母語による深い読解と作文の訓練が欠かせないからである。', questions: ['筆者の主張に最も近いものはどれか。', '筆者が英語教育についてどう考えているか。'] },
    ],
    information_retrieval: [
      { text: '【アルバイト募集】\n職種：カフェスタッフ\n勤務時間：17:00〜22:00（週3日〜）\n時給：1,200円（22時以降は1,500円）\n応募条件：日本語日常会話レベル以上\n連絡先：03-1234-5678（担当：山田）', questions: ['このアルバイトの時給について正しいものはどれか。', '応募条件として必要なものはどれか。'] },
    ],
  };

  // 文法 text_grammar 文章
  const textGrammarPassages = [
    { text: '私は昨日、友達と映画を見に行った。映画館はとても混んでいたが、チケットを予約していたので、すぐに入ることができた。映画は2時間ぐらいだった。内容はとても面白くて、最後に感動した。', questions: ['（　）に入る最も適当なものはどれか。'] },
    { text: '日本では、食事の前に「いただきます」、食事の後に「ごちそうさまでした」と言う。これは、食べ物を作ってくれた人や、食材への感謝の気持ちを表している。', questions: ['（　）に入る最も適当なものはどれか。'] },
    { text: '山田さんは来月、海外に出張する予定だ。先週パスポートを申請したので、今週中には届くはずだ。ホテルももう予約してある。', questions: ['（　）に入る最も適当なものはどれか。'] },
  ];

  let totalInserted = 0;

  for (const qType of EXAM_QUESTION_TYPES) {
    const categories = EXAM_CATEGORIES[qType];
    for (const category of categories) {
      const isPassageType = (qType === 'reading') || (qType === 'grammar' && category === 'text_grammar');

      for (const level of LEVELS) {
        if (isPassageType) {
          // 文章类：选合适的文章模板，生成若干小题
          const passagePool = qType === 'grammar' ? textGrammarPassages : (readingPassages[category] || readingPassages['short_content']);
          const selectedPassages = pickN(passagePool, Math.min(3, passagePool.length));

          for (const passage of selectedPassages) {
            for (let qi = 0; qi < passage.questions.length; qi++) {
              const options = [
                `選択肢A（${level}-${category}）`,
                `選択肢B（${level}-${category}）`,
                `選択肢C（${level}-${category}）`,
                `選択肢D（${level}-${category}）`,
              ];
              await pool.query(
                `INSERT INTO questions (question_text, question_type, options, correct_answer, explanation, level, is_real_exam, category, passage, audio_url)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
                [
                  passage.questions[qi],
                  qType,
                  options,
                  String(randInt(0, 3)),
                  `正解の解説：${passage.text.substring(0, 50)}...`,
                  level,
                  true,
                  category,
                  passage.text,
                  null,
                ]
              );
              totalInserted++;
            }
          }
        } else {
          // 普通题目：每个 category + level 生成 4-8 道题
          const count = randInt(4, 8);
          for (let i = 0; i < count; i++) {
            const questionTexts = {
              vocabulary: [
                '（　）の言葉の読み方として最も良いものを選びなさい。',
                '（　）の言葉を漢字で書く時、最も良いものを選びなさい。',
                '（　）に入れるのに最も良いものを選びなさい。',
                '次の言葉と最も関係の深いものを選びなさい。',
                '下線部の言葉に意味が最も近いものを選びなさい。',
                '次の言葉の使い方として最も良いものを選びなさい。',
              ],
              grammar: [
                '次の（　）に入れるのに最も良いものを選びなさい。',
                '次の文の ★ に入る最も適当なものを選びなさい。',
                '下線部に入る最も適当なものを選びなさい。',
              ],
              listening: [
                '質問を聞いて、最も良いものを選びなさい。',
                '話を聞いて、質問の答えとして最も良いものを選びなさい。',
                '会話を聞いて、内容に合うものを選びなさい。',
              ],
            };
            const texts = questionTexts[qType] || questionTexts['vocabulary'];
            const qText = `${texts[i % texts.length]}（${level}-${category}-${i + 1}）`;

            const options = [
              `選択肢A`,
              `選択肢B`,
              `選択肢C`,
              `選択肢D`,
            ];

            await pool.query(
              `INSERT INTO questions (question_text, question_type, options, correct_answer, explanation, level, is_real_exam, category, passage, audio_url)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
              [
                qText,
                qType,
                options,
                String(randInt(0, 3)),
                `これは${level}レベルの${category}に関する問題の解説です。`,
                level,
                true,
                category,
                null,
                qType === 'listening' ? `https://example.com/audio/${level}_${category}_${i + 1}.mp3` : null,
              ]
            );
            totalInserted++;
          }
        }
      }
    }
  }

  console.log(`    ✓ 共插入 ${totalInserted} 条真题题目`);
}

async function seedDailyQuotes(count) {
  console.log(`  → 插入 ${count} 条每日一句数据...`);
  for (let i = 0; i < count; i++) {
    const base = quoteTemplates[i % quoteTemplates.length];
    const suffix = i >= quoteTemplates.length ? `（${Math.floor(i / quoteTemplates.length) + 1}）` : '';
    await pool.query(
      `INSERT INTO daily_quotes (sentence, meaning, source) VALUES ($1,$2,$3)`,
      [base.s + suffix, base.m, base.src]
    );
  }
}

// ────────────────────────────────────
// Main
// ────────────────────────────────────

async function main() {
  const TARGET = 100;

  console.log('═══════════════════════════════════════');
  console.log('  seed-data.js — 测试数据插入脚本');
  console.log(`  各模块目标: ${TARGET} 条`);
  console.log('═══════════════════════════════════════\n');

  const start = Date.now();

  try {
    await seedVocabulary(TARGET);
    await seedGrammar(TARGET);
    await seedListening(TARGET);
    await seedReading(TARGET);
    await seedArticles(TARGET);
    await seedQuestions();
    await seedDailyQuotes(TARGET);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n✅ 完成！共插入 ${TARGET * 7} 条测试数据，耗时 ${elapsed}s`);
  } catch (err) {
    console.error('❌ 插入失败:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
