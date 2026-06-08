import { useEffect, useMemo, useState } from 'react';

const hiraganaRows = [
  { row: 'あ行', characters: ['あ', 'い', 'う', 'え', 'お'] },
  { row: 'か行', characters: ['か', 'き', 'く', 'け', 'こ'] },
  { row: 'さ行', characters: ['さ', 'し', 'す', 'せ', 'そ'] },
  { row: 'た行', characters: ['た', 'ち', 'つ', 'て', 'と'] },
  { row: 'な行', characters: ['な', 'に', 'ぬ', 'ね', 'の'] },
  { row: 'は行', characters: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
  { row: 'ま行', characters: ['ま', 'み', 'む', 'め', 'も'] },
  { row: 'や行', characters: ['や', 'ゆ', 'よ'] },
  { row: 'ら行', characters: ['ら', 'り', 'る', 'れ', 'ろ'] },
  { row: 'わ行', characters: ['わ', 'を', 'ん'] },
];

const katakanaRows = [
  { row: 'ア行', characters: ['ア', 'イ', 'ウ', 'エ', 'オ'] },
  { row: 'カ行', characters: ['カ', 'キ', 'ク', 'ケ', 'コ'] },
  { row: 'サ行', characters: ['サ', 'シ', 'ス', 'セ', 'ソ'] },
  { row: 'タ行', characters: ['タ', 'チ', 'ツ', 'テ', 'ト'] },
  { row: 'ナ行', characters: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'] },
  { row: 'ハ行', characters: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'] },
  { row: 'マ行', characters: ['マ', 'ミ', 'ム', 'メ', 'モ'] },
  { row: 'ヤ行', characters: ['ヤ', 'ユ', 'ヨ'] },
  { row: 'ラ行', characters: ['ラ', 'リ', 'ル', 'レ', 'ロ'] },
  { row: 'ワ行', characters: ['ワ', 'ヲ', 'ン'] },
];

const rowOptions = ['全部', ...hiraganaRows.map(row => row.row)];

const rowUsesCompactBoard = row => row !== '全部';

const shuffle = items => [...items].sort(() => Math.random() - 0.5);

const GojyuonGame = ({ className = '' }) => {
  const [gameCards, setGameCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedRow, setSelectedRow] = useState('全部');
  const [currentTime, setCurrentTime] = useState(0);

  const matchedCount = matchedCards.length / 2;
  const pairCount = gameCards.length / 2;

  const boardGridClass = useMemo(() => {
    if (rowUsesCompactBoard(selectedRow)) {
      return 'grid-cols-5 gap-3';
    }
    return 'grid-cols-4 sm:grid-cols-6 gap-3';
  }, [selectedRow]);

  const generateGameCards = (row) => {
    const kanaPairs = [];
    const currentRow = row || selectedRow;

    if (currentRow === '全部') {
      hiraganaRows.forEach((hiraganaRow, rowIndex) => {
        hiraganaRow.characters.forEach((hiraganaChar, charIndex) => {
          kanaPairs.push({
            hiragana: hiraganaChar,
            katakana: katakanaRows[rowIndex].characters[charIndex],
          });
        });
      });
    } else {
      const rowIndex = hiraganaRows.findIndex(item => item.row === currentRow);
      if (rowIndex !== -1) {
        hiraganaRows[rowIndex].characters.forEach((hiraganaChar, charIndex) => {
          kanaPairs.push({
            hiragana: hiraganaChar,
            katakana: katakanaRows[rowIndex].characters[charIndex],
          });
        });
      }
    }

    const cardCount = rowUsesCompactBoard(currentRow) ? kanaPairs.length : 18;
    const cards = kanaPairs.slice(0, cardCount).flatMap((kanaPair, index) => ([
      {
        id: `${index}-hiragana`,
        char: kanaPair.hiragana,
        type: 'hiragana',
        pairId: index,
      },
      {
        id: `${index}-katakana`,
        char: kanaPair.katakana,
        type: 'katakana',
        pairId: index,
      },
    ]));

    return shuffle(cards);
  };

  const startGame = (row) => {
    const rowToUse = row !== undefined ? row : selectedRow;
    setSelectedRow(rowToUse);
    setSelectedCards([]);
    setMatchedCards([]);
    setScore(0);
    setGameOver(false);
    setStartTime(new Date());
    setTotalTime(0);
    setCurrentTime(0);
    setGameCards(generateGameCards(rowToUse));
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameCards([]);
    setSelectedCards([]);
    setMatchedCards([]);
    setScore(0);
    setGameStarted(false);
    setGameOver(false);
    setStartTime(null);
    setTotalTime(0);
    setCurrentTime(0);
  };

  const checkMatch = (selectedIds) => {
    const card1 = gameCards.find(card => card.id === selectedIds[0]);
    const card2 = gameCards.find(card => card.id === selectedIds[1]);

    if (!card1 || !card2) {
      setSelectedCards([]);
      return;
    }

    if (card1.pairId === card2.pairId && card1.type !== card2.type) {
      const newMatchedCards = [...matchedCards, ...selectedIds];
      setMatchedCards(newMatchedCards);
      setScore(prev => prev + 10);

      if (newMatchedCards.length === gameCards.length) {
        const seconds = Math.floor((new Date() - startTime) / 1000);
        setTotalTime(seconds);
        setGameOver(true);
      }
    }

    setSelectedCards([]);
  };

  const handleCardClick = (card) => {
    if (gameOver || matchedCards.includes(card.id) || selectedCards.includes(card.id) || selectedCards.length >= 2) {
      return;
    }

    const newSelectedCards = [...selectedCards, card.id];
    setSelectedCards(newSelectedCards);

    if (newSelectedCards.length === 2) {
      setTimeout(() => {
        checkMatch(newSelectedCards);
      }, 500);
    }
  };

  useEffect(() => {
    let interval;
    if (gameStarted && !gameOver && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Math.floor((new Date() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, startTime]);

  return (
    <div className={className}>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-3 text-gray-800">五十音消消乐</h3>
        <p className="text-gray-600 leading-relaxed">
          匹配同一组平假名和片假名，锻炼你的假名识别速度。
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {rowOptions.map(row => (
            <button
              key={row}
              type="button"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedRow === row
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => startGame(row)}
            >
              {row}
            </button>
          ))}
        </div>
      </div>

      {!gameStarted || gameCards.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100">
          <p className="text-gray-600 mb-4">选择行后点击开始游戏按钮开始游戏</p>
          <button
            type="button"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            onClick={() => startGame(selectedRow)}
          >
            开始游戏
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div className="text-lg font-semibold text-gray-800">分数: {score}</div>
            <div className="text-lg font-semibold text-gray-800">配对: {matchedCount}/{pairCount}</div>
            <div className="text-lg font-semibold text-gray-800">用时: {currentTime}秒</div>
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={resetGame}
            >
              重新开始
            </button>
          </div>

          <div className={`grid ${boardGridClass} mb-6`}>
            {gameCards.map(card => {
              const isSelected = selectedCards.includes(card.id);
              const isMatched = matchedCards.includes(card.id);

              return (
                <button
                  type="button"
                  key={card.id}
                  className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300 border ${
                    isMatched
                      ? 'bg-green-100 text-green-600 border-green-200'
                      : isSelected
                        ? 'bg-blue-100 text-blue-600 border-blue-500 ring-2 ring-blue-100'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-200'
                  }`}
                  onClick={() => handleCardClick(card)}
                >
                  <span className="text-2xl font-medium">{card.char}</span>
                </button>
              );
            })}
            {['や行', 'わ行'].includes(selectedRow) && gameCards.length < 10 && Array.from({ length: 10 - gameCards.length }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square bg-gray-50 rounded-lg border border-gray-100" />
            ))}
          </div>

          {gameOver && (
            <div className="bg-green-50 p-6 rounded-lg text-center border border-green-100">
              <h4 className="text-xl font-semibold mb-2 text-gray-800">游戏结束！</h4>
              <p className="text-gray-700 mb-2">你的得分: {score}</p>
              <p className="text-gray-700 mb-4">总共用时: {totalTime}秒</p>
              <button
                type="button"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                onClick={() => startGame(selectedRow)}
              >
                再玩一次
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GojyuonGame;
