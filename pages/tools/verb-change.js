import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';

const {
  checkVerbAnswer,
  conjugateVerb,
  conJpName,
  conjugations,
  groupName,
  verbs,
} = require('../../lib/verbConjugation');

const randomItem = items => items[Math.floor(Math.random() * items.length)];

const VerbChangeGame = () => {
  const router = useRouter();
  const [selectedForms, setSelectedForms] = useState(conjugations);
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState({ total: 0, correct: 0, streak: 0, bestStreak: 0 });

  const activeForms = selectedForms.length > 0 ? selectedForms : conjugations;
  const allSelected = selectedForms.length === conjugations.length;

  const accuracy = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
  }, [stats]);

  const createChallenge = (forms = activeForms) => {
    const verb = randomItem(verbs);
    const form = randomItem(forms.length > 0 ? forms : conjugations);
    setChallenge({
      verb,
      form,
      expected: conjugateVerb(verb, form),
    });
    setAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    createChallenge(activeForms);
  }, []);

  const toggleForm = (form) => {
    setSelectedForms(prev => {
      const next = prev.includes(form)
        ? prev.filter(item => item !== form)
        : [...prev, form];
      return next.length === 0 ? conjugations : next;
    });
  };

  const selectAllForms = () => {
    setSelectedForms(conjugations);
  };

  const submitAnswer = (event) => {
    event.preventDefault();
    if (!challenge || !answer.trim()) return;

    const result = checkVerbAnswer(challenge.verb, challenge.form, answer);
    setFeedback(result);
    setStats(prev => {
      const total = prev.total + 1;
      const correct = prev.correct + (result.correct ? 1 : 0);
      const streak = result.correct ? prev.streak + 1 : 0;
      return {
        total,
        correct,
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
      };
    });
  };

  const nextQuestion = () => {
    createChallenge(activeForms);
  };

  return (
    <div className="tool-page-shell">
      <Head>
        <title>动词变变变 — 星空日语</title>
        <meta name="description" content="日语动词变形练习游戏，支持ます形、ない形、て形、た形、可能形等形式" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        <section className="tool-main">
          <div className="container max-w-5xl">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => router.push('/tools')}
                className="tool-back"
              >
                <span aria-hidden="true">←</span>
                返回小工具
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              <aside className="tool-panel h-fit">
                <div className="mb-6">
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-2">动词变变变</h1>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    选择要练习的变形形式，输入假名或标准写法都可以。
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="tool-stat">
                    <div className="text-xl font-extrabold text-slate-900">{stats.correct}</div>
                    <div className="text-xs text-gray-500">正确</div>
                  </div>
                  <div className="tool-stat">
                    <div className="text-xl font-extrabold text-slate-900">{accuracy}%</div>
                    <div className="text-xs text-gray-500">正确率</div>
                  </div>
                  <div className="tool-stat">
                    <div className="text-xl font-extrabold text-slate-900">{stats.streak}</div>
                    <div className="text-xs text-gray-500">连击</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-700">练习形式</h2>
                    <button
                      type="button"
                      onClick={selectAllForms}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                        allSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                    全部形式
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {conjugations.map(form => (
                    <button
                      key={form}
                      type="button"
                      onClick={() => toggleForm(form)}
                      className={`tool-chip ${
                        selectedForms.includes(form)
                          ? 'tool-chip-active'
                          : ''
                      }`}
                    >
                      {conJpName[form]}
                    </button>
                  ))}
                </div>
              </aside>

              <section className="tool-panel">
                {challenge && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                      <div>
                        <span className="tool-eyebrow">
                          {groupName[challenge.verb.group]}
                        </span>
                        <div className="text-sm text-gray-400">请写出</div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mt-1">
                          {challenge.verb.word}
                        </h2>
                        <p className="text-lg text-gray-400 mt-2">{challenge.verb.pro}</p>
                      </div>
                      <div className="tool-panel-muted px-5 py-4 text-center">
                        <div className="text-xs font-bold text-slate-500 mb-1">目标形式</div>
                        <div className="text-2xl font-extrabold text-slate-950">{conJpName[challenge.form]}</div>
                      </div>
                    </div>

                    <form onSubmit={submitAnswer} className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">你的答案</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          value={answer}
                          onChange={(event) => setAnswer(event.target.value)}
                          placeholder="输入假名或标准写法，例如 書きます / かきます"
                          className="tool-input flex-1 text-lg"
                        />
                        <button
                          type="submit"
                          disabled={!answer.trim()}
                          className="tool-button-primary"
                        >
                          校对
                        </button>
                      </div>
                    </form>

                    {feedback && (
                      <div className={`rounded-md border p-5 mb-6 ${
                        feedback.correct
                          ? 'bg-green-50 border-green-100'
                          : 'bg-amber-50 border-amber-100'
                      }`}>
                        <div className={`text-lg font-extrabold mb-2 ${
                          feedback.correct ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {feedback.correct ? '回答正确' : '再练一次这个变化'}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          标准写法：<span className="font-bold text-gray-900">{feedback.written}</span>
                          <span className="mx-2 text-gray-300">/</span>
                          假名：<span className="font-bold text-gray-900">{feedback.kana}</span>
                        </p>
                        <button
                          type="button"
                          onClick={nextQuestion}
                          className="tool-button-primary"
                        >
                          下一题
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-500">
                      <div className="tool-panel-muted p-3">
                        支持输入标准写法或假名读法。
                      </div>
                      <div className="tool-panel-muted p-3">
                        当前题库：{verbs.length} 个动词。
                      </div>
                      <div className="tool-panel-muted p-3">
                        最佳连击：{stats.bestStreak}
                      </div>
                    </div>
                  </>
                )}
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VerbChangeGame;
