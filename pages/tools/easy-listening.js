import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';

const {
  getListeningAnswerValues,
  getListeningSamples,
  listeningTypeLabels,
  listeningTypes,
  normalizeListeningAnswer,
} = require('../../lib/listeningSamples');

const randomItem = items => items[Math.floor(Math.random() * items.length)];

const EasyListening = () => {
  const router = useRouter();
  const audioRef = useRef(null);
  const [selectedType, setSelectedType] = useState(listeningTypes[0]);
  const [currentSample, setCurrentSample] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playError, setPlayError] = useState('');
  const [stats, setStats] = useState({ total: 0, correct: 0, streak: 0 });

  const createQuestion = (type = selectedType) => {
    const pool = getListeningSamples(type);
    setCurrentSample(randomItem(pool));
    setAnswer('');
    setFeedback(null);
    setPlayError('');
  };

  useEffect(() => {
    createQuestion(selectedType);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedType]);

  const playAudio = async () => {
    if (!currentSample) return;

    setIsPlaying(true);
    setPlayError('');

    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(`/api/edge-tts?text=${encodeURIComponent(currentSample.v)}&t=${Date.now()}`);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setPlayError('音频生成失败，请稍后再试');
      };
      await audio.play();
    } catch (error) {
      console.error('Play audio failed:', error);
      setIsPlaying(false);
      setPlayError('音频播放失败，请检查浏览器播放权限');
    }
  };

  const submitAnswer = (event) => {
    event.preventDefault();
    if (!answer.trim() || !currentSample) return;

    const normalizedAnswer = normalizeListeningAnswer(answer);
    const answerValues = getListeningAnswerValues(currentSample);
    const correct = answerValues
      .map(normalizeListeningAnswer)
      .includes(normalizedAnswer);
    setFeedback({
      correct,
      expected: answerValues,
      input: answer.trim(),
    });

    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (correct ? 1 : 0),
      streak: correct ? prev.streak + 1 : 0,
    }));
  };

  const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 via-white to-blue-50">
      <Head>
        <title>听力入门 — 星空日语</title>
        <meta name="description" content="日语入门听力练习，使用 Edge TTS 合成单词和句子音频" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container max-w-4xl">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => router.push('/tools')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                <span aria-hidden="true">←</span>
                返回小工具
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3">听力入门</h1>
                    <p className="text-gray-500 leading-relaxed">
                      选择题型，听音频，输入你听到的内容。
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 min-w-[240px]">
                    <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-3 text-center">
                      <div className="text-xl font-extrabold text-cyan-600">{stats.correct}</div>
                      <div className="text-xs text-gray-500">正确</div>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
                      <div className="text-xl font-extrabold text-blue-600">{accuracy}%</div>
                      <div className="text-xs text-gray-500">正确率</div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-center">
                      <div className="text-xl font-extrabold text-emerald-600">{stats.streak}</div>
                      <div className="text-xs text-gray-500">连击</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap gap-3 mb-8">
                  {listeningTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`px-5 py-3 rounded-xl font-bold border transition-all ${
                        selectedType === type
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-cyan-50 hover:border-cyan-200'
                      }`}
                    >
                      {listeningTypeLabels[type]}
                    </button>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100 p-6 md:p-8 mb-6 text-center">
                  <div className="text-xs font-bold text-cyan-500 mb-2">当前题型</div>
                  <div className="text-2xl font-extrabold text-gray-900 mb-5">
                    {listeningTypeLabels[selectedType]}
                  </div>
                  <button
                    type="button"
                    onClick={playAudio}
                    disabled={isPlaying}
                    className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-cyan-500 text-white font-extrabold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? '播放中...' : '播放音频'}
                  </button>
                  {playError && (
                    <p className="text-sm text-rose-500 mt-4">{playError}</p>
                  )}
                </div>

                <form onSubmit={submitAnswer} className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">输入听到的内容</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      placeholder={selectedType === '数字' ? '例如：53 或 ごじゅうさん' : '例如：どうぞよろしくお願いします'}
                      className="flex-1 px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 text-lg"
                    />
                    <button
                      type="submit"
                      disabled={!answer.trim()}
                      className="px-6 py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      校对
                    </button>
                  </div>
                </form>

                {feedback && (
                  <div className={`rounded-xl border p-5 mb-6 ${
                    feedback.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div className={`text-lg font-extrabold mb-2 ${
                      feedback.correct ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {feedback.correct ? '听写正确' : '答案不一致'}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      你的输入：<span className="font-bold text-gray-900">{feedback.input}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      正确答案：<span className="font-bold text-gray-900">{feedback.expected.join(' / ')}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => createQuestion(selectedType)}
                      className="px-5 py-2.5 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors"
                    >
                      下一题
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EasyListening;
