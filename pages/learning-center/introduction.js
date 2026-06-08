import { useState } from 'react';
import Head from 'next/head';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import GojyuonGame from '../../components/tools/GojyuonGame';

const Introduction = () => {
  const [activeTab, setActiveTab] = useState('japanese-characters');
  const [showModal, setShowModal] = useState(false);
  const [selectedKana, setSelectedKana] = useState(null);
  
  const tabs = [
    { id: 'japanese-characters', label: '日语文字组成' },
    { id: 'hiragana', label: '五十音图' },
    { id: 'game', label: '五十音消消乐' },
    { id: 'dakuon', label: '浊音' },
    { id: 'youon', label: '拗音' },
    { id: 'special', label: '特殊音' },
    { id: 'intonation', label: '声调和节拍' },
    { id: 'greetings', label: '日常问候语' },
    { id: 'learning-tips', label: '学习建议' },
  ];

  // 假名数据
  const hiragana = [
    { row: 'あ行', characters: [
      { char: 'あ', roman: 'a', strokeOrder: 'あ的笔画顺序', source: '"安"字的草书' },
      { char: 'い', roman: 'i', strokeOrder: 'い的笔画顺序', source: '"以"字的草书' },
      { char: 'う', roman: 'u', strokeOrder: 'う的笔画顺序', source: '"宇"字的草书' },
      { char: 'え', roman: 'e', strokeOrder: 'え的笔画顺序', source: '"衣"字的草书' },
      { char: 'お', roman: 'o', strokeOrder: 'お的笔画顺序', source: '"於"字的草书' }
    ]},
    { row: 'か行', characters: [
      { char: 'か', roman: 'ka', strokeOrder: 'か的笔画顺序', source: '"加"字的草书' },
      { char: 'き', roman: 'ki', strokeOrder: 'き的笔画顺序', source: '"幾"字的草书' },
      { char: 'く', roman: 'ku', strokeOrder: 'く的笔画顺序', source: '"久"字的草书' },
      { char: 'け', roman: 'ke', strokeOrder: 'け的笔画顺序', source: '"計"字的草书' },
      { char: 'こ', roman: 'ko', strokeOrder: 'こ的笔画顺序', source: '"己"字的草书' }
    ]},
    { row: 'さ行', characters: [
      { char: 'さ', roman: 'sa', strokeOrder: 'さ的笔画顺序', source: '"左"字的草书' },
      { char: 'し', roman: 'shi', strokeOrder: 'し的笔画顺序', source: '"之"字的草书' },
      { char: 'す', roman: 'su', strokeOrder: 'す的笔画顺序', source: '"寸"字的草书' },
      { char: 'せ', roman: 'se', strokeOrder: 'せ的笔画顺序', source: '"世"字的草书' },
      { char: 'そ', roman: 'so', strokeOrder: 'そ的笔画顺序', source: '"曽"字的草书' }
    ]},
    { row: 'た行', characters: [
      { char: 'た', roman: 'ta', strokeOrder: 'た的笔画顺序', source: '"太"字的草书' },
      { char: 'ち', roman: 'chi', strokeOrder: 'ち的笔画顺序', source: '"知"字的草书' },
      { char: 'つ', roman: 'tsu', strokeOrder: 'つ的笔画顺序', source: '"川"字的草书' },
      { char: 'て', roman: 'te', strokeOrder: 'て的笔画顺序', source: '"天"字的草书' },
      { char: 'と', roman: 'to', strokeOrder: 'と的笔画顺序', source: '"止"字的草书' }
    ]},
    { row: 'な行', characters: [
      { char: 'な', roman: 'na', strokeOrder: 'な的笔画顺序', source: '"奈"字的草书' },
      { char: 'に', roman: 'ni', strokeOrder: 'に的笔画顺序', source: '"仁"字的草书' },
      { char: 'ぬ', roman: 'nu', strokeOrder: 'ぬ的笔画顺序', source: '"奴"字的草书' },
      { char: 'ね', roman: 'ne', strokeOrder: 'ね的笔画顺序', source: '"祢"字的草书' },
      { char: 'の', roman: 'no', strokeOrder: 'の的笔画顺序', source: '"乃"字的草书' }
    ]},
    { row: 'は行', characters: [
      { char: 'は', roman: 'ha', strokeOrder: 'は的笔画顺序', source: '"波"字的草书' },
      { char: 'ひ', roman: 'hi', strokeOrder: 'ひ的笔画顺序', source: '"比"字的草书' },
      { char: 'ふ', roman: 'fu', strokeOrder: 'ふ的笔画顺序', source: '"不"字的草书' },
      { char: 'へ', roman: 'he', strokeOrder: 'へ的笔画顺序', source: '"部"字的草书' },
      { char: 'ほ', roman: 'ho', strokeOrder: 'ほ的笔画顺序', source: '"保"字的草书' }
    ]},
    { row: 'ま行', characters: [
      { char: 'ま', roman: 'ma', strokeOrder: 'ま的笔画顺序', source: '"末"字的草书' },
      { char: 'み', roman: 'mi', strokeOrder: 'み的笔画顺序', source: '"美"字的草书' },
      { char: 'む', roman: 'mu', strokeOrder: 'む的笔画顺序', source: '"牟"字的草书' },
      { char: 'め', roman: 'me', strokeOrder: 'め的笔画顺序', source: '"女"字的草书' },
      { char: 'も', roman: 'mo', strokeOrder: 'も的笔画顺序', source: '"毛"字的草书' }
    ]},
    { row: 'や行', characters: [
      { char: 'や', roman: 'ya', strokeOrder: 'や的笔画顺序', source: '"也"字的草书' },
      { char: 'ゆ', roman: 'yu', strokeOrder: 'ゆ的笔画顺序', source: '"由"字的草书' },
      { char: 'よ', roman: 'yo', strokeOrder: 'よ的笔画顺序', source: '"与"字的草书' }
    ]},
    { row: 'ら行', characters: [
      { char: 'ら', roman: 'ra', strokeOrder: 'ら的笔画顺序', source: '"良"字的草书' },
      { char: 'り', roman: 'ri', strokeOrder: 'り的笔画顺序', source: '"利"字的草书' },
      { char: 'る', roman: 'ru', strokeOrder: 'る的笔画顺序', source: '"留"字的草书' },
      { char: 'れ', roman: 're', strokeOrder: 'れ的笔画顺序', source: '"礼"字的草书' },
      { char: 'ろ', roman: 'ro', strokeOrder: 'ろ的笔画顺序', source: '"呂"字的草书' }
    ]},
    { row: 'わ行', characters: [
      { char: 'わ', roman: 'wa', strokeOrder: 'わ的笔画顺序', source: '"和"字的草书' },
      { char: 'を', roman: 'wo', strokeOrder: 'を的笔画顺序', source: '"乎"字的草书' },
      { char: 'ん', roman: 'n', strokeOrder: 'ん的笔画顺序', source: '"无"字的草书' }
    ]}
  ];

  const katakana = [
    { row: 'ア行', characters: [
      { char: 'ア', roman: 'a', strokeOrder: 'ア的笔画顺序', source: '"阿"字的偏旁' },
      { char: 'イ', roman: 'i', strokeOrder: 'イ的笔画顺序', source: '"伊"字的偏旁' },
      { char: 'ウ', roman: 'u', strokeOrder: 'ウ的笔画顺序', source: '"宇"字的偏旁' },
      { char: 'エ', roman: 'e', strokeOrder: 'エ的笔画顺序', source: '"江"字的偏旁' },
      { char: 'オ', roman: 'o', strokeOrder: 'オ的笔画顺序', source: '"於"字的偏旁' }
    ]},
    { row: 'カ行', characters: [
      { char: 'カ', roman: 'ka', strokeOrder: 'カ的笔画顺序', source: '"加"字的偏旁' },
      { char: 'キ', roman: 'ki', strokeOrder: 'キ的笔画顺序', source: '"幾"字的偏旁' },
      { char: 'ク', roman: 'ku', strokeOrder: 'ク的笔画顺序', source: '"久"字的偏旁' },
      { char: 'ケ', roman: 'ke', strokeOrder: 'ケ的笔画顺序', source: '"介"字的偏旁' },
      { char: 'コ', roman: 'ko', strokeOrder: 'コ的笔画顺序', source: '"己"字的偏旁' }
    ]},
    { row: 'サ行', characters: [
      { char: 'サ', roman: 'sa', strokeOrder: 'サ的笔画顺序', source: '"散"字的偏旁' },
      { char: 'シ', roman: 'shi', strokeOrder: 'シ的笔画顺序', source: '"之"字的偏旁' },
      { char: 'ス', roman: 'su', strokeOrder: 'ス的笔画顺序', source: '"須"字的偏旁' },
      { char: 'セ', roman: 'se', strokeOrder: 'セ的笔画顺序', source: '"世"字的偏旁' },
      { char: 'ソ', roman: 'so', strokeOrder: 'ソ的笔画顺序', source: '"曽"字的偏旁' }
    ]},
    { row: 'タ行', characters: [
      { char: 'タ', roman: 'ta', strokeOrder: 'タ的笔画顺序', source: '"多"字的偏旁' },
      { char: 'チ', roman: 'chi', strokeOrder: 'チ的笔画顺序', source: '"千"字的偏旁' },
      { char: 'ツ', roman: 'tsu', strokeOrder: 'ツ的笔画顺序', source: '"川"字的偏旁' },
      { char: 'テ', roman: 'te', strokeOrder: 'テ的笔画顺序', source: '"天"字的偏旁' },
      { char: 'ト', roman: 'to', strokeOrder: 'ト的笔画顺序', source: '"止"字的偏旁' }
    ]},
    { row: 'ナ行', characters: [
      { char: 'ナ', roman: 'na', strokeOrder: 'ナ的笔画顺序', source: '"奈"字的偏旁' },
      { char: 'ニ', roman: 'ni', strokeOrder: 'ニ的笔画顺序', source: '"二"字的偏旁' },
      { char: 'ヌ', roman: 'nu', strokeOrder: 'ヌ的笔画顺序', source: '"奴"字的偏旁' },
      { char: 'ネ', roman: 'ne', strokeOrder: 'ネ的笔画顺序', source: '"祢"字的偏旁' },
      { char: 'ノ', roman: 'no', strokeOrder: 'ノ的笔画顺序', source: '"乃"字的偏旁' }
    ]},
    { row: 'ハ行', characters: [
      { char: 'ハ', roman: 'ha', strokeOrder: 'ハ的笔画顺序', source: '"八"字的偏旁' },
      { char: 'ヒ', roman: 'hi', strokeOrder: 'ヒ的笔画顺序', source: '"比"字的偏旁' },
      { char: 'フ', roman: 'fu', strokeOrder: 'フ的笔画顺序', source: '"不"字的偏旁' },
      { char: 'ヘ', roman: 'he', strokeOrder: 'ヘ的笔画顺序', source: '"部"字的偏旁' },
      { char: 'ホ', roman: 'ho', strokeOrder: 'ホ的笔画顺序', source: '"保"字的偏旁' }
    ]},
    { row: 'マ行', characters: [
      { char: 'マ', roman: 'ma', strokeOrder: 'マ的笔画顺序', source: '"末"字的偏旁' },
      { char: 'ミ', roman: 'mi', strokeOrder: 'ミ的笔画顺序', source: '"三"字的偏旁' },
      { char: 'ム', roman: 'mu', strokeOrder: 'ム的笔画顺序', source: '"牟"字的偏旁' },
      { char: 'メ', roman: 'me', strokeOrder: 'メ的笔画顺序', source: '"女"字的偏旁' },
      { char: 'モ', roman: 'mo', strokeOrder: 'モ的笔画顺序', source: '"毛"字的偏旁' }
    ]},
    { row: 'ヤ行', characters: [
      { char: 'ヤ', roman: 'ya', strokeOrder: 'ヤ的笔画顺序', source: '"也"字的偏旁' },
      { char: 'ユ', roman: 'yu', strokeOrder: 'ユ的笔画顺序', source: '"由"字的偏旁' },
      { char: 'ヨ', roman: 'yo', strokeOrder: 'ヨ的笔画顺序', source: '"与"字的偏旁' }
    ]},
    { row: 'ラ行', characters: [
      { char: 'ラ', roman: 'ra', strokeOrder: 'ラ的笔画顺序', source: '"良"字的偏旁' },
      { char: 'リ', roman: 'ri', strokeOrder: 'リ的笔画顺序', source: '"利"字的偏旁' },
      { char: 'ル', roman: 'ru', strokeOrder: 'ル的笔画顺序', source: '"流"字的偏旁' },
      { char: 'レ', roman: 're', strokeOrder: 'レ的笔画顺序', source: '"礼"字的偏旁' },
      { char: 'ロ', roman: 'ro', strokeOrder: 'ロ的笔画顺序', source: '"呂"字的偏旁' }
    ]},
    { row: 'ワ行', characters: [
      { char: 'ワ', roman: 'wa', strokeOrder: 'ワ的笔画顺序', source: '"和"字的偏旁' },
      { char: 'ヲ', roman: 'wo', strokeOrder: 'ヲ的笔画顺序', source: '"乎"字的偏旁' },
      { char: 'ン', roman: 'n', strokeOrder: 'ン的笔画顺序', source: '"尔"字的偏旁' }
    ]}
  ];

  const playAudio = (kana, useLocalAudio = false) => {
    if (useLocalAudio) {
      // 使用本地音频文件播放
      const audio = new Audio(`/audio/${kana.roman}.mp3`);
      audio.play();
    } else {
      // 使用Web Speech API播放音频
      const utterance = new SpeechSynthesisUtterance(kana.char);
      utterance.lang = 'ja-JP'; // 设置日语
      utterance.rate = 0.5; // 设置播放速度为0.5
      speechSynthesis.speak(utterance);
    }
  };

  const openModal = (kana) => {
    setSelectedKana(kana);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedKana(null);
  };
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>日语入门 - 星空日语</title>
        <meta name="description" content="日语入门，了解日语基础知识，包括假名、发音和基础问候语" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Navigation />
      
      <main className="flex-grow">
        <section className="pt-12 pb-12 md:pt-20 md:pb-20">
          <div className="container">
            <div className="text-center mb-8">
            </div>
            
            {/* Tab Navigation */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex space-x-2 border-b border-gray-200">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              {activeTab === 'japanese-characters' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">日语文字组成</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    日语文字由平假名、片假名和汉字组成。平假名和片假名各有46个，是日语的基础。
                  </p>
                  
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <p className="text-gray-600 p-4 bg-gray-50 rounded-lg">
                        <span className="text-red-600">日本</span><span className="text-blue-600">の</span><span className="text-red-600">子供</span><span className="text-blue-600">たち</span><span className="text-blue-600">は</span><span className="text-green-600">ドラえもん</span><span className="text-blue-600">が</span><span className="text-red-600">大好き</span><span className="text-blue-600">です</span>。<span className="text-red-600">漫画</span><span className="text-blue-600">の</span><span className="text-red-600">主人公</span><span className="text-blue-600">で</span>、<span className="text-red-600">猫</span><span className="text-blue-600">の</span><span className="text-red-600">形</span><span className="text-blue-600">の</span><span className="text-green-600">ロボット</span><span className="text-blue-600">です</span>。<br /><br />
                        <span className="text-green-600">ドラえもん</span><span className="text-blue-600">は</span><span className="text-red-600">不思議</span><span className="text-blue-600">な</span><span className="text-green-600">ポケット</span><span className="text-blue-600">を</span><span className="text-red-600">持</span><span className="text-blue-600">っ</span><span className="text-blue-600">て</span><span className="text-blue-600">い</span><span className="text-blue-600">て</span>、<span className="text-blue-600">いろいろ</span><span className="text-blue-600">な</span><span className="text-blue-600">も</span><span className="text-blue-600">の</span><span className="text-blue-600">が</span><span className="text-red-600">出</span><span className="text-blue-600">せ</span><span className="text-blue-600">ます</span>。<span className="text-red-600">例</span><span className="text-blue-600">えば</span>、「<span className="text-green-600">タケコプター</span>」<span className="text-blue-600">や</span>「<span className="text-green-600">タイムテレビ</span>」<span className="text-blue-600">です</span>。「<span className="text-green-600">タケコプター</span>」<span className="text-blue-600">を</span><span className="text-red-600">頭</span><span className="text-blue-600">に</span><span className="text-blue-600">つ</span><span className="text-blue-600">ける</span><span className="text-blue-600">と</span>、<span className="text-red-600">自由</span><span className="text-blue-600">に</span><span className="text-red-600">空</span><span className="text-blue-600">を</span><span className="text-red-600">飛</span><span className="text-blue-600">べ</span><span className="text-blue-600">ます</span>。「<span className="text-green-600">タイムテレビ</span>」<span className="text-blue-600">では</span><span className="text-red-600">昔</span><span className="text-blue-600">の</span><span className="text-red-600">自分</span><span className="text-blue-600">や</span><span className="text-red-600">将来</span><span className="text-blue-600">の</span><span className="text-red-600">自分</span><span className="text-blue-600">が</span><span className="text-red-600">見</span><span className="text-blue-600">られ</span><span className="text-blue-600">ます</span>。<br /><br />
                        <span className="text-blue-600">わたし</span><span className="text-blue-600">が</span><span className="text-red-600">一番</span><span className="text-red-600">欲</span><span className="text-blue-600">しい</span><span className="text-blue-600">も</span><span className="text-blue-600">の</span><span className="text-blue-600">は</span>「<span className="text-green-600">どこでもドア</span>」<span className="text-blue-600">です</span>。「<span className="text-green-600">どこでもドア</span>」<span className="text-blue-600">を</span><span className="text-red-600">開</span><span className="text-blue-600">ける</span><span className="text-blue-600">と</span>、<span className="text-blue-600">どこでも</span><span className="text-red-600">行</span><span className="text-blue-600">き</span><span className="text-blue-600">たい</span><span className="text-blue-600">ところ</span><span className="text-blue-600">へ</span><span className="text-red-600">行</span><span className="text-blue-600">け</span><span className="text-blue-600">ます</span>。<span className="text-red-600">皆</span><span className="text-blue-600">さん</span>、<span className="text-blue-600">もし</span><span className="text-green-600">ドラえもん</span><span className="text-blue-600">に</span><span className="text-red-600">会</span><span className="text-blue-600">え</span><span className="text-blue-600">たら</span>、<span className="text-blue-600">どんな</span><span className="text-blue-600">も</span><span className="text-blue-600">の</span><span className="text-blue-600">を</span><span className="text-red-600">出</span><span className="text-blue-600">し</span><span className="text-blue-600">て</span><span className="text-blue-600">も</span><span className="text-blue-600">らい</span><span className="text-blue-600">たい</span><span className="text-blue-600">です</span><span className="text-blue-600">か</span>。
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h4 className="text-xl font-semibold mb-4 text-gray-800">平假名（蓝色）</h4>
                      <p className="text-gray-600 mb-4">平假名是日语中最常用的文字，用于表示日语固有的词汇和语法。</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h4 className="text-xl font-semibold mb-4 text-gray-800">片假名（绿色）</h4>
                      <p className="text-gray-600 mb-4">片假名主要用于外来语、外国人名、地名等。</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h4 className="text-xl font-semibold mb-4 text-gray-800">汉字（红色）</h4>
                      <p className="text-gray-600 mb-4">汉字是从中国传入的文字，在日语中广泛使用。</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'hiragana' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">五十音图</h3>
                  <div className="space-y-8">
                    {hiragana.map((hiraganaRow, rowIndex) => {
                      // 找到对应的片假名行
                      const rowMapping = {
                        'あ行': 'ア行',
                        'か行': 'カ行',
                        'さ行': 'サ行',
                        'た行': 'タ行',
                        'な行': 'ナ行',
                        'は行': 'ハ行',
                        'ま行': 'マ行',
                        'や行': 'ヤ行',
                        'ら行': 'ラ行',
                        'わ行': 'ワ行'
                      };
                      const katakanaRowName = rowMapping[hiraganaRow.row];
                      const katakanaRow = katakana.find(row => row.row === katakanaRowName);
                      if (!katakanaRow) return null;
                        
                      return (
                        <div key={rowIndex} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium mb-4 text-gray-700">{hiraganaRow.row}</h4>
                          <div className="space-y-3">
                            {/* 平假名行 */}
                            <div className="grid grid-cols-5 gap-2">
                              {hiraganaRow.characters.map((char, charIndex) => (
                                <div 
                                  key={charIndex} 
                                  className="text-center py-2 cursor-pointer hover:bg-gray-50 rounded-lg"
                                  onClick={() => openModal(char)}
                                >
                                  <span className="text-xl font-medium">{char.char}</span>
                                </div>
                              ))}
                            </div>
                            {/* 片假名行 */}
                            <div className="grid grid-cols-5 gap-2">
                              {katakanaRow.characters.map((char, charIndex) => (
                                <div 
                                  key={charIndex} 
                                  className="text-center py-2 cursor-pointer hover:bg-gray-50 rounded-lg"
                                  onClick={() => openModal(char)}
                                >
                                  <span className="text-xl font-medium">{char.char}</span>
                                </div>
                              ))}
                            </div>
                            {/* 罗马音行 */}
                            <div className="grid grid-cols-5 gap-2">
                              {hiraganaRow.characters.map((char, charIndex) => (
                                <div key={charIndex} className="text-center py-2 text-gray-600">
                                  <span>{char.roman}</span>
                                </div>
                              ))}
                            </div>
                            {/* 音频行 */}
                            <div className="grid grid-cols-5 gap-2">
                              {hiraganaRow.characters.map((char, charIndex) => (
                                <div key={charIndex} className="text-center py-2">
                                  <button 
                                    className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                                    onClick={() => playAudio(char, true)}
                                    title="播放音频"
                                  >
                                    ▶
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {activeTab === 'dakuon' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">浊音</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    浊音是在清音的基础上加上浊音符号（""）形成的，发音时声带振动。
                  </p>
                  <div className="space-y-8">
                    {/* が行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">が行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">が</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぎ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぐ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">げ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ご</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ガ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ギ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">グ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ゲ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ゴ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>ga</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>gi</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>gu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>ge</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>go</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'が' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぎ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぐ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'げ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ご' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* ざ行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">ざ行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ざ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">じ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ず</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぜ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぞ</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ザ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ジ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ズ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ゼ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ゾ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>za</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>ji</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>zu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>ze</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>zo</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ざ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'じ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ず' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぜ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぞ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* だ行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">だ行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">だ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぢ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">づ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">で</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ど</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ダ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ヂ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ヅ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">デ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ド</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>da</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>ji</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>zu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>de</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>do</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'だ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぢ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'づ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'で' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ど' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* ば行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">ば行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ば</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">び</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぶ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">べ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぼ</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">バ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ビ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ブ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ベ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ボ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>ba</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>bi</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>bu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>be</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>bo</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ば' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'び' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぶ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'べ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぼ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* ぱ行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">ぱ行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぱ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぴ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぷ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぺ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ぽ</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">パ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ピ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">プ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ペ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ポ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>pa</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>pi</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>pu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>pe</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>po</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぱ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぴ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぷ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぺ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ぽ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'youon' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">拗音</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    拗音是由い段假名和や、ゆ、よ组合而成的音节，发音时要注意缩短一拍。
                  </p>
                  <div className="space-y-8">
                    {/* きゃ行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">きゃ行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">きゃ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">きゅ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">きょ</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">キャ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">キュ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">キョ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>kya</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>kyu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>kyo</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'きゃ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'きゅ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'きょ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* しゃ行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">しゃ行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">しゃ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">しゅ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">しょ</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">シャ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">シュ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ショ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>sha</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>shu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>sho</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'しゃ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'しゅ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'しょ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* ちゃ行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">ちゃ行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ちゃ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ちゅ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ちょ</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">チャ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">チュ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">チョ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>cha</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>chu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>cho</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ちゃ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ちゅ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ちょ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* にゃ行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">にゃ行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">にゃ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">にゅ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">にょ</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ニャ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ニュ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ニョ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>nya</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>nyu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>nyo</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'にゃ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'にゅ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'にょ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* ひゃ行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">ひゃ行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ひゃ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ひゅ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ひょ</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ヒャ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ヒュ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ヒョ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>hya</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>hyu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>hyo</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ひゃ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ひゅ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'ひょ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* みゃ行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">みゃ行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">みゃ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">みゅ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">みょ</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ミャ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ミュ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">ミョ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>mya</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>myu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>myo</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'みゃ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'みゅ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'みょ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* りゃ行 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-4 text-gray-700">りゃ行</h4>
                      <div className="space-y-3">
                        {/* 平假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">りゃ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">りゅ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">りょ</span>
                          </div>
                        </div>
                        {/* 片假名行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">リャ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">リュ</span>
                          </div>
                          <div className="text-center py-2">
                            <span className="text-xl font-medium">リョ</span>
                          </div>
                        </div>
                        {/* 罗马音行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2 text-gray-600">
                            <span>rya</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>ryu</span>
                          </div>
                          <div className="text-center py-2 text-gray-600">
                            <span>ryo</span>
                          </div>
                        </div>
                        {/* 音频行 */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'りゃ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'りゅ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                          <div className="text-center py-2">
                            <button 
                              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto"
                              onClick={() => playAudio({ char: 'りょ' })}
                              title="播放音频"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'special' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">特殊音</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    日语中还有一些特殊的发音，包括拨音、长音和促音。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3 text-gray-700">拨音 (ん)</h4>
                      <p className="text-gray-600 mb-4">发音时软腭下垂，气流从鼻腔通过。</p>
                      <div className="text-center p-2">ん (n)</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3 text-gray-700">长音</h4>
                      <p className="text-gray-600 mb-4">发音时将元音延长一拍，用长音符号（ー）表示。</p>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-2">おおきい (ookii)</div>
                        <div className="text-center p-2">とおい (tooi)</div>
                        <div className="text-center p-2">せんせい (sensei)</div>
                        <div className="text-center p-2">にいさん (niisan)</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3 text-gray-700">促音 (っ)</h4>
                      <p className="text-gray-600 mb-4">发音时堵住气流，形成一个短促的停顿。</p>
                      <div className="text-center p-2">っ (small tsu)</div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'pitch' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">声调和节拍</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    日语的声调是高低型的，不同的声调会改变词语的意思。节拍则是指发音的节奏。
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium mb-3 text-gray-700">声调类型</h4>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>平板型：第一个音节低，后面的音节都高</li>
                      <li>头高型：第一个音节高，后面的音节都低</li>
                      <li>中高型：第二个音节高，其他音节低</li>
                      <li>尾高型：最后一个音节高，其他音节低</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 text-gray-700">节拍示例</h4>
                    <div className="space-y-3 text-gray-600">
                      <div>かんじ (汉字) - 2拍</div>
                      <div>にほんご (日本語) - 3拍</div>
                      <div>すみません (对不起) - 4拍</div>
                      <div>ありがとう (谢谢) - 4拍</div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'greetings' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">日常问候语</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">こんにちは (Konnichiwa)</h4>
                        <button 
                          className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          onClick={() => playAudio({ char: 'こんにちは' })}
                          title="播放音频"
                        >
                          ▶
                        </button>
                      </div>
                      <p className="text-gray-600">你好（白天问候）</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">おはようございます (Ohayou gozaimasu)</h4>
                        <button 
                          className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          onClick={() => playAudio({ char: 'おはようございます' })}
                          title="播放音频"
                        >
                          ▶
                        </button>
                      </div>
                      <p className="text-gray-600">早上好</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">こんばんは (Konbanwa)</h4>
                        <button 
                          className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          onClick={() => playAudio({ char: 'こんばんは' })}
                          title="播放音频"
                        >
                          ▶
                        </button>
                      </div>
                      <p className="text-gray-600">晚上好</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">さようなら (Sayonara)</h4>
                        <button 
                          className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          onClick={() => playAudio({ char: 'さようなら' })}
                          title="播放音频"
                        >
                          ▶
                        </button>
                      </div>
                      <p className="text-gray-600">再见</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">ありがとう (Arigatou)</h4>
                        <button 
                          className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          onClick={() => playAudio({ char: 'ありがとう' })}
                          title="播放音频"
                        >
                          ▶
                        </button>
                      </div>
                      <p className="text-gray-600">谢谢</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">すみません (Sumimasen)</h4>
                        <button 
                          className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          onClick={() => playAudio({ char: 'すみません' })}
                          title="播放音频"
                        >
                          ▶
                        </button>
                      </div>
                      <p className="text-gray-600">对不起/打扰了</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">はじめまして (Hajimemashite)</h4>
                        <button 
                          className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          onClick={() => playAudio({ char: 'はじめまして' })}
                          title="播放音频"
                        >
                          ▶
                        </button>
                      </div>
                      <p className="text-gray-600">初次见面</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">お元気ですか？ (Ogenki desu ka?)</h4>
                        <button 
                          className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          onClick={() => playAudio({ char: 'お元気ですか' })}
                          title="播放音频"
                        >
                          ▶
                        </button>
                      </div>
                      <p className="text-gray-600">你好吗？</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'learning-tips' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">学习建议</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    以下是一些学习日语的建议，帮助你更有效地掌握这门语言。
                  </p>
                  
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="text-xl font-semibold mb-4 text-gray-800">学习方法</h4>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li>每天坚持学习，哪怕只有15分钟</li>
                        <li>多听多说，不要害怕犯错</li>
                        <li>使用闪卡记忆假名和词汇</li>
                        <li>看日本动漫、电影和电视剧</li>
                        <li>尝试用日语写日记</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="text-xl font-semibold mb-4 text-gray-800">学习资源</h4>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li>教材：《みんなの日本語》（大家的日语）</li>
                        <li>APP：Duolingo、JapanesePod101</li>
                        <li>网站：NHK News Web Easy</li>
                        <li>词典：大辞林、Weblio</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="text-xl font-semibold mb-4 text-gray-800">学习目标</h4>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li>第一阶段：掌握五十音图</li>
                        <li>第二阶段：学习基础词汇和语法</li>
                        <li>第三阶段：能够进行简单的日常对话</li>
                        <li>第四阶段：通过JLPT N5考试</li>
                        <li>第五阶段：继续提高，争取更高水平</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="text-xl font-semibold mb-4 text-gray-800">常见问题</h4>
                      <div className="space-y-3 text-gray-600">
                        <div>
                          <strong>Q: 五十音图很难记，怎么办？</strong>
                          <p>A: 可以通过联想记忆法，比如将假名与汉字或图像联系起来，每天复习一点，坚持一段时间就会记住。</p>
                        </div>
                        <div>
                          <strong>Q: 日语发音很难，如何提高？</strong>
                          <p>A: 多听标准发音，模仿日本母语者的发音，注意声调的变化。</p>
                        </div>
                        <div>
                          <strong>Q: 学习日语需要多长时间？</strong>
                          <p>A: 这取决于你的学习时间和学习方法，一般来说，达到基础会话水平需要6-12个月的时间。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-800">开始你的日语学习之旅</h3>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
                      掌握了基础知识后，你可以继续学习词汇和语法，逐步提高你的日语水平。
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                      <a 
                        href="/learning-center/vocabulary" 
                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        学习词汇
                      </a>
                      <a 
                        href="/learning-center/grammar" 
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        学习语法
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'game' && (
                <GojyuonGame />
              )}
            </div>
            

          </div>
        </section>
      </main>
      
      {/* 假名书写顺序弹窗 */}
      {showModal && selectedKana && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">{selectedKana.char} ({selectedKana.roman})</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-4 text-gray-700">平假名笔顺</h4>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-center">
                  <img 
                    src={`/audio/${selectedKana.roman}.gif`} 
                    alt={`${selectedKana.char} 平假名笔顺`} 
                    className="max-h-64"
                  />
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2 text-gray-700">片假名笔顺</h4>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-center">
                    <img 
                      src={`/audio/${selectedKana.roman} (1).gif`} 
                      alt={`${selectedKana.char} 片假名笔顺`} 
                      className="max-h-64"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4 text-gray-700">字源</h4>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
                  <p className="text-gray-600">{selectedKana.source}</p>
                </div>
                <h4 className="font-medium mb-4 text-gray-700">发音</h4>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center h-40">
                  <div className="text-4xl font-medium mb-4">{selectedKana.char}</div>
                  <button 
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={() => playAudio(selectedKana, true)}
                  >
                    播放音频
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Introduction;
