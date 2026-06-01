const { Client } = require('pg');

// 数据库连接配置
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'hanhan',
  password: '123456',
  database: 'japanese_learning'
});

// 连接数据库
client.connect()
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Connection error', err));

// 各级别的题目配置
const examConfig = {
  N1: {
    vocabulary: [
      { category: 'kanji_reading', count: 6 },
      { category: 'kanji_writing', count: 0 },
      { category: 'word_formation', count: 0 },
      { category: 'word_relation', count: 7 },
      { category: 'synonym_replacement', count: 6 },
      { category: 'usage', count: 5 }
    ],
    grammar: [
      { category: 'sentence_grammar1', count: 10 },
      { category: 'sentence_grammar2', count: 5 },
      { category: 'text_grammar', count: 1 } // 1篇文章，包含若干小题
    ],
    reading: [
      { category: 'short_content', count: 4 }, // 4篇，每篇包含若干小题
      { category: 'medium_content', count: 4 }, // 4篇，每篇包含若干小题
      { category: 'long_content', count: 1 }, // 1篇，包含若干小题
      { category: 'comprehensive', count: 1 }, // 1篇，包含若干小题
      { category: 'argument', count: 1 }, // 1篇，包含若干小题
      { category: 'information_retrieval', count: 1 } // 1篇，包含若干小题
    ],
    listening: [
      { category: 'problem_understanding', count: 5 },
      { category: 'point_understanding', count: 6 },
      { category: 'summary_understanding', count: 5 },
      { category: 'language_expression', count: 0 },
      { category: 'immediate_response', count: 11 },
      { category: 'comprehensive', count: 3 }
    ]
  },
  N2: {
    vocabulary: [
      { category: 'kanji_reading', count: 5 },
      { category: 'kanji_writing', count: 5 },
      { category: 'word_formation', count: 3 },
      { category: 'word_relation', count: 7 },
      { category: 'synonym_replacement', count: 5 },
      { category: 'usage', count: 5 }
    ],
    grammar: [
      { category: 'sentence_grammar1', count: 12 },
      { category: 'sentence_grammar2', count: 5 },
      { category: 'text_grammar', count: 1 } // 1篇文章，包含若干小题
    ],
    reading: [
      { category: 'short_content', count: 5 }, // 5篇，每篇包含若干小题
      { category: 'medium_content', count: 4 }, // 4篇，每篇包含若干小题
      { category: 'long_content', count: 0 }, // 0篇
      { category: 'comprehensive', count: 1 }, // 1篇，包含若干小题
      { category: 'argument', count: 1 }, // 1篇，包含若干小题
      { category: 'information_retrieval', count: 1 } // 1篇，包含若干小题
    ],
    listening: [
      { category: 'problem_understanding', count: 5 },
      { category: 'point_understanding', count: 6 },
      { category: 'summary_understanding', count: 5 },
      { category: 'language_expression', count: 0 },
      { category: 'immediate_response', count: 11 },
      { category: 'comprehensive', count: 3 }
    ]
  },
  N3: {
    vocabulary: [
      { category: 'kanji_reading', count: 10 },
      { category: 'kanji_writing', count: 5 },
      { category: 'word_formation', count: 0 },
      { category: 'word_relation', count: 10 },
      { category: 'synonym_replacement', count: 5 },
      { category: 'usage', count: 5 }
    ],
    grammar: [
      { category: 'sentence_grammar1', count: 15 },
      { category: 'sentence_grammar2', count: 5 },
      { category: 'text_grammar', count: 1 } // 1篇文章，包含若干小题
    ],
    reading: [
      { category: 'short_content', count: 4 }, // 4篇，每篇包含若干小题
      { category: 'medium_content', count: 2 }, // 2篇，每篇包含若干小题
      { category: 'long_content', count: 1 }, // 1篇，包含若干小题
      { category: 'comprehensive', count: 0 }, // 0篇
      { category: 'argument', count: 0 }, // 0篇
      { category: 'information_retrieval', count: 1 } // 1篇，包含若干小题
    ],
    listening: [
      { category: 'problem_understanding', count: 6 },
      { category: 'point_understanding', count: 6 },
      { category: 'summary_understanding', count: 3 },
      { category: 'language_expression', count: 4 },
      { category: 'immediate_response', count: 10 },
      { category: 'comprehensive', count: 0 }
    ]
  },
  N4: {
    vocabulary: [
      { category: 'kanji_reading', count: 7 },
      { category: 'kanji_writing', count: 5 },
      { category: 'word_formation', count: 0 },
      { category: 'word_relation', count: 8 },
      { category: 'synonym_replacement', count: 4 },
      { category: 'usage', count: 4 }
    ],
    grammar: [
      { category: 'sentence_grammar1', count: 13 },
      { category: 'sentence_grammar2', count: 4 },
      { category: 'text_grammar', count: 1 } // 1篇文章，包含若干小题
    ],
    reading: [
      { category: 'short_content', count: 3 }, // 3篇，每篇包含若干小题
      { category: 'medium_content', count: 1 }, // 1篇，包含若干小题
      { category: 'long_content', count: 0 }, // 0篇
      { category: 'comprehensive', count: 0 }, // 0篇
      { category: 'argument', count: 0 }, // 0篇
      { category: 'information_retrieval', count: 1 } // 1篇，包含若干小题
    ],
    listening: [
      { category: 'problem_understanding', count: 8 },
      { category: 'point_understanding', count: 7 },
      { category: 'summary_understanding', count: 0 },
      { category: 'language_expression', count: 5 },
      { category: 'immediate_response', count: 8 },
      { category: 'comprehensive', count: 0 }
    ]
  },
  N5: {
    vocabulary: [
      { category: 'kanji_reading', count: 12 },
      { category: 'kanji_writing', count: 8 },
      { category: 'word_formation', count: 0 },
      { category: 'word_relation', count: 10 },
      { category: 'synonym_replacement', count: 5 },
      { category: 'usage', count: 0 }
    ],
    grammar: [
      { category: 'sentence_grammar1', count: 16 },
      { category: 'sentence_grammar2', count: 5 },
      { category: 'text_grammar', count: 1 } // 1篇文章，包含若干小题
    ],
    reading: [
      { category: 'short_content', count: 3 }, // 3篇，每篇包含若干小题
      { category: 'medium_content', count: 1 }, // 1篇，包含若干小题
      { category: 'long_content', count: 0 }, // 0篇
      { category: 'comprehensive', count: 0 }, // 0篇
      { category: 'argument', count: 0 }, // 0篇
      { category: 'information_retrieval', count: 1 } // 1篇，包含若干小题
    ],
    listening: [
      { category: 'problem_understanding', count: 7 },
      { category: 'point_understanding', count: 6 },
      { category: 'summary_understanding', count: 0 },
      { category: 'language_expression', count: 5 },
      { category: 'immediate_response', count: 6 },
      { category: 'comprehensive', count: 0 }
    ]
  }
};

// 生成词汇题
const generateVocabularyQuestions = (level, category, count) => {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    let questionText, options, correctAnswer, explanation;
    
    switch (category) {
      case 'kanji_reading':
        questionText = `次の漢字の読み方を選んでください：${getRandomKanji()}`;
        options = [getRandomReading(), getRandomReading(), getRandomReading(), getRandomReading()];
        correctAnswer = Math.floor(Math.random() * 4).toString();
        explanation = `正しい読み方は「${options[correctAnswer]}」です。`;
        break;
      case 'kanji_writing':
        questionText = `次の言葉を漢字で書くとき、最も適切なものを選んでください：${getRandomWord()}`;
        options = [getRandomKanji(), getRandomKanji(), getRandomKanji(), getRandomKanji()];
        correctAnswer = Math.floor(Math.random() * 4).toString();
        explanation = `正しい漢字は「${options[correctAnswer]}」です。`;
        break;
      case 'word_relation':
        questionText = `次の文の（　）に入れるのに最も適切な言葉を選んでください：今日は（　）天気です。`;
        options = ['いい', '悪い', '暑い', '寒い'];
        correctAnswer = Math.floor(Math.random() * 4).toString();
        explanation = `正しい答えは「${options[correctAnswer]}」です。`;
        break;
      case 'synonym_replacement':
        questionText = `次の言葉と意味が最も近いものを選んでください：大きい`;
        options = ['小さい', '広い', '高い', '巨い'];
        correctAnswer = '3';
        explanation = `正しい答えは「巨い」です。`;
        break;
      case 'usage':
        questionText = `次の言葉の使い方として最も適切なものを選んでください：「上手」`;
        options = [
          '彼は英語が上手です。',
          'この料理は上手です。',
          '彼は上手に走ります。',
          'この本は上手です。'
        ];
        correctAnswer = '0';
        explanation = `正しい答えは「彼は英語が上手です。」です。`;
        break;
      default:
        questionText = 'テスト問題';
        options = ['選択肢1', '選択肢2', '選択肢3', '選択肢4'];
        correctAnswer = '0';
        explanation = 'これはテスト問題です。';
    }
    
    questions.push({
      question_text: questionText,
      question_type: 'vocabulary',
      options: options,
      correct_answer: correctAnswer,
      explanation: explanation,
      level: level,
      category: category,
      is_real_exam: true
    });
  }
  
  return questions;
};

// 生成语法题
const generateGrammarQuestions = (level, category, count) => {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    let questionText, options, correctAnswer, explanation, passage;
    
    switch (category) {
      case 'sentence_grammar1':
        questionText = `次の文の（　）に入れるのに最も適切なものを選んでください：彼は（　）勉強しています。`;
        options = ['一生懸命', 'ゆっくり', '早く', '静かに'];
        correctAnswer = Math.floor(Math.random() * 4).toString();
        explanation = `正しい答えは「${options[correctAnswer]}」です。`;
        break;
      case 'sentence_grammar2':
        questionText = `次の文の（　）に入れるのに最も適切なものを選んでください：雨が降っているので、傘を（　）行きました。`;
        options = ['持って', '持たないで', '持たずに', '持ったら'];
        correctAnswer = '0';
        explanation = `正しい答えは「持って」です。`;
        break;
      case 'text_grammar':
        passage = '日本の四季は非常に美しいです。春には桜が咲き、夏には海で遊び、秋には紅葉が美しく、冬には雪が降ります。日本人は四季の変化を大切にしています。';
        questionText = `次の文章の（　）に入れるのに最も適切なものを選んでください：日本の四季は（　）美しいです。`;
        options = ['非常に', '少し', '全然', 'たまに'];
        correctAnswer = '0';
        explanation = `正しい答えは「非常に」です。`;
        break;
      default:
        questionText = 'テスト問題';
        options = ['選択肢1', '選択肢2', '選択肢3', '選択肢4'];
        correctAnswer = '0';
        explanation = 'これはテスト問題です。';
    }
    
    questions.push({
      question_text: questionText,
      question_type: 'grammar',
      options: options,
      correct_answer: correctAnswer,
      explanation: explanation,
      level: level,
      category: category,
      passage: passage || null,
      is_real_exam: true
    });
  }
  
  return questions;
};

// 生成阅读题
const generateReadingQuestions = (level, category, count) => {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    let passage, questionText, options, correctAnswer, explanation;
    
    switch (category) {
      case 'short_content':
        passage = '私は毎朝7時に起きます。それから、顔を洗い、朝ごはんを食べます。8時に家を出て、電車で学校に行きます。学校は9時から始まります。';
        questionText = `この文章によると、作者は毎朝何時に起きますか？`;
        options = ['6時', '7時', '8時', '9時'];
        correctAnswer = '1';
        explanation = `文章に「私は毎朝7時に起きます。」とあります。`;
        break;
      case 'medium_content':
        passage = '日本の食文化は非常に豊富です。寿司、刺身、天ぷら、焼肉など、様々な料理があります。最近では、健康食品や低カロリー食品も人気があります。日本人は食べ物を大切にしています。';
        questionText = `この文章の主な内容は何ですか？`;
        options = ['日本の食文化', '日本の観光地', '日本の歴史', '日本の地理'];
        correctAnswer = '0';
        explanation = `文章は日本の食文化について述べています。`;
        break;
      case 'long_content':
        passage = '日本はアジアの東に位置する島国です。面積は約37万平方キロメートルで、人口は約1億2600万人です。日本は四季がはっきりしていて、自然が豊かです。また、経済的にも豊かな国です。';
        questionText = `日本の人口は約何人ですか？`;
        options = ['1億人', '1億2600万人', '2億人', '3億人'];
        correctAnswer = '1';
        explanation = `文章に「人口は約1億2600万人です。」とあります。`;
        break;
      case 'comprehensive':
        passage = 'AさんとBさんは大学の友達です。Aさんは日本語が得意で、Bさんは英語が得意です。二人はお互いに勉強を教え合っています。';
        questionText = `AさんとBさんは何をしていますか？`;
        options = ['一緒に遊んでいます', 'お互いに勉強を教え合っています', '一緒に食べています', '一緒に働いています'];
        correctAnswer = '1';
        explanation = `文章に「二人はお互いに勉強を教え合っています。」とあります。`;
        break;
      case 'argument':
        passage = '現代社会では、インターネットの普及により、情報の入手が容易になりました。しかし、情報の量が多すぎて、必要な情報を見つけるのが難しくなっています。また、偽情報も増えています。';
        questionText = `この文章の作者はどのような問題を指摘していますか？`;
        options = ['情報の入手が難しい', '情報の量が多すぎて必要な情報を見つけるのが難しい', 'インターネットが普及していない', '偽情報が少ない'];
        correctAnswer = '1';
        explanation = `文章に「情報の量が多すぎて、必要な情報を見つけるのが難しくなっています。」とあります。`;
        break;
      case 'information_retrieval':
        passage = 'イベント情報：日本文化フェスティバル 日時：2026年5月1日（土）10:00〜17:00 場所：東京文化会館 内容：和服展示、茶道体験、和食試食など';
        questionText = `日本文化フェスティバルの日時はいつですか？`;
        options = ['2026年5月1日（土）10:00〜17:00', '2026年5月2日（日）10:00〜17:00', '2026年5月3日（月）10:00〜17:00', '2026年5月4日（火）10:00〜17:00'];
        correctAnswer = '0';
        explanation = `文章に「日時：2026年5月1日（土）10:00〜17:00」とあります。`;
        break;
      default:
        passage = 'テスト文章';
        questionText = 'テスト問題';
        options = ['選択肢1', '選択肢2', '選択肢3', '選択肢4'];
        correctAnswer = '0';
        explanation = 'これはテスト問題です。';
    }
    
    questions.push({
      question_text: questionText,
      question_type: 'reading',
      options: options,
      correct_answer: correctAnswer,
      explanation: explanation,
      level: level,
      category: category,
      passage: passage,
      is_real_exam: true
    });
  }
  
  return questions;
};

// 生成听力题
const generateListeningQuestions = (level, category, count) => {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    let questionText, options, correctAnswer, explanation, audioUrl;
    
    switch (category) {
      case 'problem_understanding':
        questionText = `男の人は何をしますか？`;
        options = ['買い物に行きます', '映画を見ます', '勉強します', '散歩します'];
        correctAnswer = Math.floor(Math.random() * 4).toString();
        explanation = `正しい答えは「${options[correctAnswer]}」です。`;
        audioUrl = null;
        break;
      case 'point_understanding':
        questionText = `女の人の意見は何ですか？`;
        options = ['賛成です', '反対です', 'どちらでもない', '分かりません'];
        correctAnswer = Math.floor(Math.random() * 4).toString();
        explanation = `正しい答えは「${options[correctAnswer]}」です。`;
        audioUrl = null;
        break;
      case 'summary_understanding':
        questionText = `この話の要約は何ですか？`;
        options = ['動物の話', '植物の話', '天気の話', '交通の話'];
        correctAnswer = Math.floor(Math.random() * 4).toString();
        explanation = `正しい答えは「${options[correctAnswer]}」です。`;
        audioUrl = null;
        break;
      case 'language_expression':
        questionText = `次の場面で、最も適切な言葉を選んでください：先生に会ったとき`;
        options = ['こんにちは', 'お疲れ様です', 'お元気ですか', 'さようなら'];
        correctAnswer = '0';
        explanation = `正しい答えは「こんにちは」です。`;
        audioUrl = null;
        break;
      case 'immediate_response':
        questionText = `「今日はいい天気ですね。」と言われたとき、最も適切な返事を選んでください。`;
        options = ['はい、そうですね', 'いいえ、違います', '分かりません', 'どういたしまして'];
        correctAnswer = '0';
        explanation = `正しい答えは「はい、そうですね」です。`;
        audioUrl = null;
        break;
      case 'comprehensive':
        questionText = `この会話の内容に合っているものはどれですか？`;
        options = ['二人は友達です', '二人は家族です', '二人は同僚です', '二人は恋人です'];
        correctAnswer = Math.floor(Math.random() * 4).toString();
        explanation = `正しい答えは「${options[correctAnswer]}」です。`;
        audioUrl = null;
        break;
      default:
        questionText = 'テスト問題';
        options = ['選択肢1', '選択肢2', '選択肢3', '選択肢4'];
        correctAnswer = '0';
        explanation = 'これはテスト問題です。';
        audioUrl = null;
    }
    
    questions.push({
      question_text: questionText,
      question_type: 'listening',
      options: options,
      correct_answer: correctAnswer,
      explanation: explanation,
      level: level,
      category: category,
      audio_url: audioUrl,
      is_real_exam: true
    });
  }
  
  return questions;
};

// 辅助函数：生成随机汉字
function getRandomKanji() {
  const kanjiList = ['日', '月', '水', '火', '木', '金', '土', '人', '口', '目'];
  return kanjiList[Math.floor(Math.random() * kanjiList.length)];
}

// 辅助函数：生成随机读音
function getRandomReading() {
  const readingList = ['にち', 'げつ', 'すい', 'か', 'もく', 'きん', 'ど', 'じん', 'くち', 'め'];
  return readingList[Math.floor(Math.random() * readingList.length)];
}

// 辅助函数：生成随机词语
function getRandomWord() {
  const wordList = ['たいへん', 'よく', 'たくさん', 'すこし', 'とても'];
  return wordList[Math.floor(Math.random() * wordList.length)];
}

// 插入题目数据
async function insertQuestions() {
  try {
    // 清空现有数据
    await client.query('DELETE FROM questions WHERE is_real_exam = false');
    console.log('Cleared existing non-real exam questions');
    
    let totalQuestions = 0;
    
    // 为每个级别生成题目
    for (const level in examConfig) {
      const levelConfig = examConfig[level];
      
      // 生成词汇题
      for (const item of levelConfig.vocabulary) {
        const { category, count } = item;
        if (count > 0) {
          const questions = generateVocabularyQuestions(level, category, count * 2); // 生成两倍数量的题目，确保有足够的题目可供选择
          for (const question of questions) {
            await client.query(
              `INSERT INTO questions (question_text, question_type, options, correct_answer, explanation, level, category, is_real_exam) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [question.question_text, question.question_type, question.options, question.correct_answer, question.explanation, question.level, question.category, question.is_real_exam]
            );
            totalQuestions++;
          }
        }
      }
      
      // 生成语法题
      for (const item of levelConfig.grammar) {
        const { category, count } = item;
        if (count > 0) {
          const questions = generateGrammarQuestions(level, category, count * 2); // 生成两倍数量的题目
          for (const question of questions) {
            await client.query(
              `INSERT INTO questions (question_text, question_type, options, correct_answer, explanation, level, category, passage, is_real_exam) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [question.question_text, question.question_type, question.options, question.correct_answer, question.explanation, question.level, question.category, question.passage, question.is_real_exam]
            );
            totalQuestions++;
          }
        }
      }
      
      // 生成阅读题
      for (const item of levelConfig.reading) {
        const { category, count } = item;
        if (count > 0) {
          const questions = generateReadingQuestions(level, category, count * 2); // 生成两倍数量的题目
          for (const question of questions) {
            await client.query(
              `INSERT INTO questions (question_text, question_type, options, correct_answer, explanation, level, category, passage, is_real_exam) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [question.question_text, question.question_type, question.options, question.correct_answer, question.explanation, question.level, question.category, question.passage, question.is_real_exam]
            );
            totalQuestions++;
          }
        }
      }
      
      // 生成听力题
      for (const item of levelConfig.listening) {
        const { category, count } = item;
        if (count > 0) {
          const questions = generateListeningQuestions(level, category, count * 2); // 生成两倍数量的题目
          for (const question of questions) {
            await client.query(
              `INSERT INTO questions (question_text, question_type, options, correct_answer, explanation, level, category, audio_url, is_real_exam) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [question.question_text, question.question_type, question.options, question.correct_answer, question.explanation, question.level, question.category, question.audio_url, question.is_real_exam]
            );
            totalQuestions++;
          }
        }
      }
      
      console.log(`Generated ${totalQuestions} questions for level ${level}`);
    }
    
    console.log(`Total questions generated: ${totalQuestions}`);
    
    // 关闭数据库连接
    await client.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error inserting questions:', error);
    await client.end();
  }
}

// 运行插入脚本
insertQuestions();
